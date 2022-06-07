import {Context, Markup, session, Telegraf} from 'telegraf'
import {SessionStore} from "telegraf/src/session";
import fs from "fs";
import {Token} from "./tokens";
import {Address} from "ton";
import translations from './translations'

const TonWeb = require('tonweb');
const tokens = require('./tokens');
const BN = require("bn.js");

const TONSWAP_URL = 'https://tonswap.github.io/tonswap-web/';


const tonweb = new TonWeb(
    new TonWeb.HttpProvider("https://scalable-api.tonwhales.com/jsonRPC")
);
const correctPassword = 'orbs123'
interface SessionData {
    waitingForPassword: boolean,
    walletAddress: string,
    token?: string,
    language?: string,
    walletBalance?: string; 
    password?: string;
}

interface MyContext extends Context {
    session?: SessionData
}

const bot = new Telegraf<MyContext>(require('./config.ts').default.token);

// ---------------- PERSISTENCE ------------------

if (!fs.existsSync('./db.json')) {
    fs.writeFileSync('./db.json', JSON.stringify({}));
}

class RedisStore implements SessionStore<any> {

    #store: any = require('../db.json');

    async delete(name: string): Promise<void> {
        delete this.#store[name];
        fs.writeFileSync('./db.json', JSON.stringify(this.#store));
    }

    async get(name: string): Promise<any> {
        return this.#store[name];
    }

    async set(name: string, value: any): Promise<void> {
        this.#store[name] = value;
        fs.writeFileSync('./db.json', JSON.stringify(this.#store));
    }

}

// Make session data available
bot.use(session({
    store: new RedisStore()
}));

bot.start(async (ctx) => {
    // set a default value

    ctx.session ??= {walletAddress: "", waitingForPassword: false, language: 'EN'};

    ctx.session.waitingForPassword = true;
    await ctx.reply(steps.tokens.text(ctx), steps.tokens.buttons(ctx));
});

// ---------------- LANGUAGES ------------------

const languages = [
    {
        id: 'EN',
        label: '🇺🇸',
    },
    {
        id: 'RU',
        label: '🇷🇺',
    },
];




// ---------------- BUTTONS ------------------

const prepareTranslation = (translation: string, token?: string) => {
    return translation.replace(/XXX/g, token || '');
};

const steps = {
    tokens: {
        text: (ctx: any) => {
            return translations.TOKENS[ctx.session.language];
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                tokens.tokens.slice(0, 4).map((t: Token) => Markup.button.callback(t.displayName, t.name)),
                tokens.tokens.slice(4, 8).map((t: Token) => Markup.button.callback(t.displayName, t.name)),
                [
                    Markup.button.callback(prepareTranslation(translations.buttons.LANGUAGES[ctx.session.language], languages.find(l => l.id === ctx.session.language)?.label), 'languages'),
                    Markup.button.callback(translations.buttons.HELP[ctx.session.language], 'help_tokens'),
                ]
            ]);
        }
    },
    tbd: {
        text: (ctx: any) => {
            return prepareTranslation(translations.TOKEN_TBD[ctx.session.language], ctx.update.callback_query.data.toUpperCase());
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(translations.buttons.GOT_IT[ctx.session.language], 'tokens'),
                ]
            ]);
        }
    },
    token: {
        text: (ctx: any) => {
            return prepareTranslation(translations.TOKEN[ctx.session.language], ctx.update.callback_query.data.toUpperCase());
        },
        buttons: (ctx: any) => {
            const token = ctx.update.callback_query.data.toUpperCase();
                            
            return Markup.inlineKeyboard(
                [
                    [
                        Markup.button.webApp(prepareTranslation(translations.buttons.BUY[ctx.session.language], token), `${TONSWAP_URL}buy/${token.toLowerCase()}?telegram_webapp=true`),
                        Markup.button.webApp(prepareTranslation(translations.buttons.SELL[ctx.session.language], token), `${TONSWAP_URL}sell/${token.toLowerCase()}?telegram_webapp=true`),
                    ],
                    [
                        Markup.button.callback(translations.buttons.MANAGE_LIQUIDITY[ctx.session.language], 'manage_liquidity'),
                    ],
                    [
                        Markup.button.callback(translations.buttons.BACK[ctx.session.language], 'back_token'),
                        Markup.button.callback(translations.buttons.HELP[ctx.session.language], 'help_token'),
                    ]
                ]
            );
        }
    },
    helpTokens: {
        text: (ctx: any) => {
            return prepareTranslation(translations.HELP_TOKENS[ctx.session.language]);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(translations.buttons.GOT_IT[ctx.session.language], 'tokens'),
                ]
            ]);
        }
    },
    helpToken: {
        text: (ctx: any) => {
            const token = ctx.session.token.toUpperCase();
            return prepareTranslation(translations.HELP_TOKEN[ctx.session.language], token);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(translations.buttons.GOT_IT[ctx.session.language], ctx.session.token),
                ]
            ]);
        }
    },
    helpLiquidity: {
        text: (ctx: any) => {
            const token = ctx.session.token.toUpperCase();
            return prepareTranslation(translations.HELP_LIQUIDITY[ctx.session.language], token);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(translations.buttons.GOT_IT[ctx.session.language], 'manage_liquidity'),
                ]
            ]);
        }
    },
    manageLiquidity: {
        text: (ctx: any) => {
            const token = ctx.session.token.toUpperCase();
            return prepareTranslation(translations.MANAGE_LIQUIDITY[ctx.session.language], token);
        },
        buttons: (ctx: any, hasLpBalance: boolean) => {
            const token = ctx.session.token.toUpperCase();
            return Markup.inlineKeyboard(
                [
                    [
                        Markup.button.webApp(translations.buttons.ADD_LIQUIDITY[ctx.session.language], `${TONSWAP_URL}add-liquidity/${token.toLowerCase()}?telegram_webapp=true`),
                        hasLpBalance
                            ? Markup.button.webApp(translations.buttons.REMOVE_LIQUIDITY[ctx.session.language], `${TONSWAP_URL}remove-liquidity/${token.toLowerCase()}?telegram_webapp=true`)
                            : Markup.button.callback(translations.buttons.REMOVE_LIQUIDITY[ctx.session.language], 'remove_liquidity')
                    ],
                    [
                        Markup.button.callback(translations.buttons.BACK[ctx.session.language], ctx.session.token),
                        Markup.button.callback(translations.buttons.HELP[ctx.session.language], 'help_liquidity')
                    ]
                ]
            );
        },
    },
    remove_liquidity: {
        text: (ctx: any) => {
            const token = ctx.session.token.toUpperCase();
            return prepareTranslation(translations.REMOVE_LIQUIDITY[ctx.session.language], token);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.callback(translations.buttons.ADD_LIQUIDITY[ctx.session.language], 'add_liquidity'),
                    Markup.button.callback(translations.buttons.BACK[ctx.session.language], 'manage_liquidity'),
                ]
            ]);
        }
    },
    languages: {
        text: (ctx: any) => {
            const language = languages.find(l => l.id === ctx.session.language)?.label;
            return prepareTranslation(translations.LANGUAGES[ctx.session.language], language);
        },
        buttons: (ctx: any) => {
            const buttons = languages.filter(l => l.id !== ctx.session.language).map(l => Markup.button.callback(l.label, l.id))
                .concat([Markup.button.callback(translations.buttons.BACK[ctx.session.language], ctx.session.walletAddress ? 'tokens' : 'disconnect')]);
            return Markup.inlineKeyboard(buttons, {columns: 5});
        }
    },
    disconnected: {
        text: (ctx: any) => {
            return prepareTranslation(translations.DISCONNECTED[ctx.session.language]);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard(
                [
                [
                    Markup.button.callback(prepareTranslation(translations.buttons.SELECT_ACTION[ctx.session.language]), 'tokens')
                ],
                [
                    Markup.button.callback(prepareTranslation(translations.buttons.LANGUAGES[ctx.session.language], languages.find(l => l.id === ctx.session.language)?.label), 'languages'),
                    Markup.button.callback(translations.buttons.HELP[ctx.session.language], 'help_disconnected')
                ]]
            );
        }
    },
    helpDisconnected: {
        text: (ctx: any) => {
            return prepareTranslation(translations.HELP_DISCONNECTED[ctx.session.language]);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard(
                [
                    Markup.button.callback(translations.buttons.GOT_IT[ctx.session.language], 'back_help_disconnected'),
                ]
            );
        }
    }
}

// ---------------- ACTIONS ------------------

bot.action('back_help_disconnected', async (ctx: Context) => {
    // @ts-ignore
    await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    await ctx.reply(steps.disconnected.text(ctx), steps.disconnected.buttons(ctx));
});

bot.action('help_disconnected', async (ctx: Context) => {
    // @ts-ignore
    await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    await ctx.replyWithPhoto('https://i.ibb.co/D8Ddt33/image.png', {
        ...steps.helpDisconnected.buttons(ctx),
        caption: steps.helpDisconnected.text(ctx)
    });
});

bot.action('languages', async (ctx: any) => {
    ctx.editMessageText(steps.languages.text(ctx), steps.languages.buttons(ctx));
});




bot.action('remove_liquidity', async (ctx: any) => {
    ctx.editMessageText(steps.remove_liquidity.text(ctx), steps.remove_liquidity.buttons(ctx));
});

bot.action('manage_liquidity', async (ctx: any) => {
    const token = ctx.session.token.toUpperCase();
    // const address = ctx.session.walletAddress;
    // const amm = tokens.tokens.find((t: Token) => t.name === token.toLowerCase()).amm;
 //   const lpBalance = await getTokenBalance(address, amm);

    ctx.editMessageText(steps.manageLiquidity.text(ctx), steps.manageLiquidity.buttons(ctx, true));
});

bot.action('help_tokens', async (ctx: any) => {
    ctx.editMessageText(steps.helpTokens.text(ctx), steps.helpTokens.buttons(ctx));
});



bot.action('help_token', async (ctx: any) => {
    ctx.editMessageText(steps.helpToken.text(ctx), steps.helpToken.buttons(ctx));
});

bot.action('help_liquidity', async (ctx: any) => {
    ctx.editMessageText(steps.helpLiquidity.text(ctx), steps.helpLiquidity.buttons(ctx));
});

bot.action('shib', async (ctx: any) => {
    ctx.session.token = ctx.update.callback_query.data;
    ctx.editMessageText(steps.token.text(ctx), steps.token.buttons(ctx));
});

bot.action('usdt', async (ctx: any) => {
    ctx.session.token = ctx.update.callback_query.data;
    ctx.editMessageText(steps.token.text(ctx), steps.token.buttons(ctx));
});

bot.action(tokens.tokens.filter((t: Token) => (['shib', 'usdt'].includes(t.name))).map((t: Token) => t.name), async (ctx: any) => {
    ctx.session.token = ctx.update.callback_query.data;
    ctx.editMessageText(steps.tbd.text(ctx), steps.tbd.buttons(ctx));
});

bot.action(languages.map(l => l.id), async (ctx: any) => {
    ctx.session.language = ctx.update.callback_query.data;
    ctx.editMessageText(steps.languages.text(ctx), steps.languages.buttons(ctx));
});

bot.action('back_token', async (ctx: any) => {
    ctx.editMessageText(steps.tokens.text(ctx), steps.tokens.buttons(ctx));
});

bot.action('tokens', async (ctx: any) => {
    ctx.editMessageText(steps.tokens.text(ctx), steps.tokens.buttons(ctx));
});

bot.action('disconnect', async (ctx: any) => {
    ctx.editMessageText(`${ctx.session.walletAddress ? `${translations.WALLET_DISCONNECTED[ctx.session.language]}.` : ''} ${steps.disconnected.text(ctx)}`, steps.disconnected.buttons(ctx));
    ctx.session.walletAddress = '';
    ctx.session.waitingForPassword = true;
});

// ---------------- READ ----------------

const parseNumber = (
    num: any,
    units: number = 9,
    decimalPoints: number = 4
): number => {
    if (num.toString().length <= 9) {
        return parseFloat(
            parseFloat(
                "0." + num.toString().padStart(units).replace(/\s/g, "0")
            ).toFixed(decimalPoints)
        );
    } else {
        return parseFloat(
            parseFloat(
                num.div(new BN(10 ** units)).toString() +
                "." +
                num.mod(new BN(10 ** units)).toString()
            ).toFixed(decimalPoints)
        );
    }
};

const getTokenBalance = async (addressOfUser: string, amm: string) => {
    const owner = Address.parse(addressOfUser);
    let wc = owner.workChain;
    let address = new BN(owner.hash);
    const res = await tonweb.call(amm, "ibalance_of", [
        ["num", wc.toString(10)],
        ["num", address.toString(10)],
    ]);

    return parseNumber(new BN(eval(res.stack[0][1])));
};


// ---------------- ON MESSAGE ------------------




bot.on('message', async (ctx) => {
        console.log((ctx.message as any).text);
        
    // set a default value
    ctx.session ??= {walletAddress: "", waitingForPassword: false, language: 'EN'};

    if (ctx.session.waitingForPassword) {
        if((ctx.message as any).text !== correctPassword){
         await ctx.reply(translations.INVALID_ADDRESS[ctx.session.language!!]);
       
        }else{
            await ctx.reply(steps.disconnected.text(ctx), steps.disconnected.buttons(ctx));
        }
      
        ctx.session.walletAddress = (ctx.message as any).text;
            
    }
});




// ---------------- BOT ------------------

// Launch bot
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch().then();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
