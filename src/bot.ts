import {Context, Markup, session, Telegraf} from 'telegraf'
import {SessionStore} from "telegraf/src/session";
import fs from "fs";

interface SessionData {
    waitingForWalletAddress: boolean,
    walletAddress: string,
    token?: string,
    showRewards?: boolean // Temp just to show it can look
    showRemoveLiquidity?: boolean // Temp just to show it can look
}

interface MyContext extends Context {
    session?: SessionData
}

const bot = new Telegraf<MyContext>(require('./config').token);

// ---------------- PERSISTENCE ------------------

class RedisStore implements SessionStore<any> {

    #store: any = require('../db.json');

    async delete(name: string): Promise<void> {
        delete this.#store[name];
        fs.writeFileSync('../db.json', JSON.stringify(this.#store));
    }

    async get(name: string): Promise<any> {
        return this.#store[name];
    }

    async set(name: string, value: any): Promise<void> {
        this.#store[name] = value;
        fs.writeFileSync('../db.json', JSON.stringify(this.#store));
    }

}

// Make session data available
bot.use(session({
    store: new RedisStore()
}));

// bot.start(async (ctx) => {
//     await ctx.reply(`Hello, please enter your wallet address`);
// });

// ---------------- BUTTONS ------------------

const steps = {
    tokens: {
        text: `Select a token to trade`,
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback('USDC', 'usdc'),
                    Markup.button.callback('FODL', 'fodl'),
                    Markup.button.callback('XRP', 'xrp'),
                    Markup.button.callback('DOT', 'dot')
                ],
                [
                    Markup.button.callback('BTC', 'btc'),
                    Markup.button.callback('ETH', 'eth'),
                    Markup.button.callback('LINK', 'link'),
                    Markup.button.callback('FTM', 'dot')
                ],
                [
                    Markup.button.callback('Disconnect 🔌', 'disconnect'),
                    Markup.button.callback('Help 🆘', 'help_tokens'),
                ]
            ]);
        }
    },
    token: {
        text: (ctx: any) => {
            return `What would you like to do with ${
                ctx.update.callback_query.data.toUpperCase()
            }?                   `;
        },
        buttons: (ctx: any) => {
            const token = ctx.update.callback_query.data.toUpperCase();
            return Markup.inlineKeyboard([
                [
                    Markup.button.url(`Buy ${token} 💰`, 'https://ton.org'),
                    Markup.button.url(`Sell ${token} 💸`, 'https://ton.org'),
                ],
                [
                    Markup.button.callback('Manage Liquidity 💧', 'manage_liquidity'),
                    Markup.button.callback('Claim Rewards 💎', 'claim_rewards'),
                ],
                [
                    Markup.button.callback('Back 🔙', 'back_token'),
                    Markup.button.callback('Help', 'help_tokens'),
                ]
            ]);
        }
    },
    helpTokens: {
        text: 'To start trading on Tonswap you need to first select which token you want to trade. Tokens are normally traded against the native TON coin. After that, you will be able to do various actions such as buy, sell, add liquidity and claim rewards.',
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(`Got it 👍`, 'tokens'),
                ]
            ]);
        }
    },
    hasRewards: {
        text: 'You earned 2.4 TON, tap to approve the claim rewards transaction in your TON wallet 🥳',
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.url(`Approve 👍`, 'https://ton.org'),
                    Markup.button.callback('Back 🔙', ctx.session.token),
                ]
            ]);
        }
    },
    noRewards: {
        text: (ctx: any) => {
            return `Liquidity providers can earn rewards of up to 88% APR (yearly interest). You must add liquidity by depositing both ${ctx.session.token.toUpperCase()} and TON to earn rewards`;
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(`Add liquidity ➕`, 'add_liquidity'),
                    Markup.button.callback('Back 🔙', ctx.session.token),
                ]
            ]);
        }
    },
    manageLiquidity: {
        text: (ctx: any) => {
            return `Add liquidity by depositing both ${ctx.session.token.toUpperCase()} and TON to earn rewards of up to 88% APR (yearly interest) or remove liquidity to withdraw your ${ctx.session.token.toUpperCase()} and TON back to your wallet${ctx.session.token.toUpperCase()} and TON to earn rewards`;
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.url(`Add liquidity ➕`, 'https://ton.org'),
                    ctx.session.showRemoveLiquidity ?
                        Markup.button.callback(`Remove liquidity ➖`, 'remove_liquidity') :
                        Markup.button.url(`Remove liquidity ➖`, 'https://ton.org'),
                ],
                [
                    Markup.button.callback('Claim Rewards 💎', 'claim_rewards'),
                ],
                [
                    Markup.button.callback('Back 🔙', ctx.session.token),
                    Markup.button.callback('Help', 'help_liquidity')
                ]
            ]);
        },
    },
    remove_liquidity: {
        text: 'You need to add liquidity before you can remove it',
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(`Add liquidity ➕`, 'add_liquidity'),
                    Markup.button.callback('Back 🔙', ctx.session.token),
                ]
            ]);
        }
    }
}

// ---------------- ACTIONS ------------------

bot.action('remove_liquidity', async (ctx: any) => {
    ctx.editMessageText(steps.remove_liquidity.text, steps.remove_liquidity.buttons(ctx));
});

bot.action('manage_liquidity', async (ctx: any) => {
    ctx.editMessageText(steps.manageLiquidity.text(ctx), steps.manageLiquidity.buttons(ctx));
    ctx.session.showRemoveLiquidity = !ctx.session.showRemoveLiquidity;
});

bot.action('claim_rewards', async (ctx: any) => {
    if (ctx.session.showRewards) {
        ctx.editMessageText(steps.hasRewards.text, steps.hasRewards.buttons(ctx));
    } else {
        ctx.editMessageText(steps.noRewards.text(ctx), steps.noRewards.buttons(ctx));
    }
    ctx.session.showRewards = !ctx.session.showRewards;
});

bot.action('help_tokens', async (ctx: any) => {
    ctx.editMessageText(steps.helpTokens.text, steps.helpTokens.buttons(ctx));
});

bot.action(['usdc', 'fodl', 'xrp', 'dot', 'btc', 'eth', 'link', 'dot'], async (ctx: any) => {
    ctx.session.token = ctx.update.callback_query.data;
    ctx.editMessageText(steps.token.text(ctx), steps.token.buttons(ctx));
})

bot.action('back_token', async (ctx: any) => {
    ctx.editMessageText(steps.tokens.text, steps.tokens.buttons(ctx));
})

bot.action('tokens', async (ctx: any) => {
    ctx.editMessageText(steps.tokens.text, steps.tokens.buttons(ctx));
})

// ---------------- ON MESSAGE ------------------

bot.on('message', async (ctx) => {
    // set a default value
    ctx.session ??= {walletAddress: "", waitingForWalletAddress: false};

    if (ctx.session.waitingForWalletAddress) {
        ctx.session.walletAddress = (ctx.message as any).text;
    }

    if (ctx.session.walletAddress) {
        ctx.session.waitingForWalletAddress = false;
        await ctx.reply(steps.tokens.text, steps.tokens.buttons(ctx));
    } else {
        ctx.session.waitingForWalletAddress = true;
        await ctx.reply(`Please enter a wallet address`);
    }

});

// ---------------- BOT ------------------

// Launch bot
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch().then();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
