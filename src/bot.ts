import {Context, Markup, session, Telegraf} from 'telegraf'
import {SessionStore} from "telegraf/src/session";
import fs from "fs";

interface SessionData {
    waitingForWalletAddress: boolean,
    walletAddress: string,
    token?: string,
    language?: string,
    showRewards?: boolean // Temp just to show it can look
    showRemoveLiquidity?: boolean // Temp just to show it can look
}

interface MyContext extends Context {
    session?: SessionData
}

const bot = new Telegraf<MyContext>(require('./config.ts').token);

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

// bot.start(async (ctx) => {
//     await ctx.reply(`Hello, please enter your wallet address`);
// });

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

const translations: any = {
    'TOKENS': {
        'EN': 'Select a token to trade',
        'RU': 'Выберите токен для торговли'
    },
    'TOKEN': {
        'EN': 'What would you like to do with XXX ⠀⠀⠀⠀⠀⠀⠀',
        'RU': 'Что бы вы хотели сделать с XXX ⠀⠀⠀⠀⠀⠀⠀',
    },
    'HELP_TOKENS': {
        'EN': 'To start trading on Tonswap you need to first select which token you want to trade. Tokens are normally traded against the native TON coin. After that, you will be able to do various actions such as buy, sell, add liquidity and claim rewards.',
        'RU': 'Чтобы начать торговать на Tonswap, сначала нужно выбрать токен. Токенами обычно торгуют против базовой монеты TON. После этого, вы сможете выполнять различные действия, такие как покупка, продажа, добавление ликвидности и получение вознаграждения.',

    },
    'HELP_TOKEN': {
        'EN': 'To swap XXX to TON press the Sell button. To swap TON to XXX press the Buy button. To add liquidity and earn rewards or to remove liquidity you already provided, tap the Manage Liquidity button',
        'RU': 'Чтобы обменять XXX на TON, нажмите кнопку «Продать». Чтобы обменять TON на XXX, нажмите кнопку «Купить». Чтобы добавить ликвидность и заработать вознаграждение или удалить уже предоставленную ликвидность, нажмите кнопку «Управление ликвидностью»',
    },
    'HELP_LIQUIDITY': {
        'EN': 'Adding liquidity is the action of supplying both XXX and TON to allow others to swap between them. For every swap you will earn 0.3% fees + additional 88% rewards APR. There is always a risk of impermanent loss so it is advised to learn about it before supplying liquidity. Remove liquidity is the action of getting back the XXX and TON you already supplied before.',
        'RU': 'Добавление ликвидности — это действие по предоставлению как XXX, так и TON, чтобы позволить другим обмениваться ими. За каждый своп вы будете получать комиссию в размере 0,3% + дополнительные вознаграждения в размере 88% годовых. Всегда существует риск непоправимой потери, поэтому рекомендуется узнать об этом до предоставления ликвидности. Удаление ликвидности — это действие по возврату XXX и TON, которые вы уже предоставили ранее',
    },
    'HAS_REWARDS': {
        'EN': 'You earned 2.4 TON, tap to approve the claim rewards transaction in your TON wallet 🥳',
        'RU': 'Вы заработали 2,4 TON, нажмите, чтобы одобрить транзакцию вознаграждения в вашем кошельке TON🥳',
    },
    'NO_REWARDS': {
        'EN': 'Liquidity providers can earn rewards of up to 88% APR (yearly interest). You must add liquidity by depositing both XXX and TON to earn rewards',
        'RU': 'Провайдеры ликвидности могут получать вознаграждение в размере до 88% годовых (годовых процентов). Вы должны увеличить ликвидность, внося как XXX, так и TON, чтобы получать вознаграждение',
    },
    'MANAGE_LIQUIDITY': {
        'EN': 'Add liquidity by depositing both XXX and TON to earn rewards of up to 88% APR (yearly interest) or remove liquidity to withdraw your XXX and TON back to your wallet XXX and TON to earn rewards',
        'RU': 'Bы можете добавить ликвидность, внося депозиты как XXX, так и TON, чтобы получить вознаграждение до 88% годовых (годовые проценты), или удалите ликвидность, чтобы вывести XXX и TON обратно в свой кошелек XXX и TON, чтобы получить вознаграждение',
    },
    'REMOVE_LIQUIDITY': {
        'EN': 'You need to add liquidity before you can remove it',
        'RU': 'Вам нужно добавить ликвидность, прежде чем вы сможете ее удалить',
    },
    'LANGUAGES': {
        'EN': 'You are currently using XXX',
        'RU': 'Вы используете язык XXX',
    },
    'DISCONNECTED': {
        'EN': 'Connect your TON wallet by pasting your TON wallet address',
        'RU': 'Подключите свой кошелек TON, вставив адрес своего кошелька TON',
    },
    'HELP_DISCONNECTED': {
        'EN': 'In order to interact with TonSwap you need to provide your TON wallet address by writing it in this chat. This is the same address you give your friends when they want to send you TON coins.  . It looks something like EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N (this is TON foundation\'s wallet address).  To find your address, open your TON wallet (the app you use to manage your TON coins). Your wallet address usually appears in the front page of your walletor when tapping on the Receive button. Copy it and paste it in chat.',
        'RU': 'Для взаимодействия с TonSwap, вам необходимо указать адрес своего кошелька TON, написав его в этом чате. Это тот же адрес, который вы даете своим друзьям, когда они хотят отправить вам TON. Он выглядит примерно так: EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N (это общий адрес кошелька TON). Чтобы найти личный адрес, откройте свой кошелек TON (приложение, которое вы используете для управления токенами TON). Адрес вашего кошелька обычно отображается на главной странице вашего кошелька или при нажатии на кнопку «Получить». Скопируйте его и вставьте в чат',
    },
    'WALLET_CONNECTED': {
        'EN': 'Wallet connected successfully 🎉',
        'RU': 'Кошелек успешно подключен 🎉'
    },
    buttons: {
        'BUY': {
            'EN': 'Buy XXX 💰',
            'RU': 'Купить ХХХ 💰'
        },
        'SELL': {
            'EN': 'Sell XXX 💸',
            'RU': 'Продать ХХХ 💸'
        },
        'MANAGE_LIQUIDITY': {
            'EN': 'Manage Liquidity 💧',
            'RU': 'Управление ликвидностью 💧'
        },
        'CLAIM_REWARDS': {
            'EN': 'Claim Rewards 💎',
            'RU': 'Получить награду 💎'
        },
        'BACK': {
            'EN': 'Back 🔙',
            'RU': 'Назад 🔙'
        },
        'HELP': {
            'EN': 'Help 🆘',
            'RU': 'Помощь 🆘'
        },
        'GOT_IT': {
            'EN': 'Got it 👍',
            'RU': 'Ясно👍'
        },
        'APPROVE': {
            'EN': 'Approve 👍',
            'RU': 'Подтвердить👍'
        },
        'ADD_LIQUIDITY': {
            'EN': 'Add liquidity ➕',
            'RU': 'Добавить ликвидность ➕'
        },
        'REMOVE_LIQUIDITY': {
            'EN': 'Remove liquidity ➖',
            'RU': 'Удалить ликвидность ➖'
        },
        'DISCONNECT': {
            'EN': 'Disconnect 🔌',
            'RU': 'Отключить 🔌'
        },
        'LANGUAGES': {
            'EN': 'Languages XXX',
            'RU': 'Языки XXX'
        }
    }
}


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
                    Markup.button.callback(translations.buttons.DISCONNECT[ctx.session.language], 'disconnect'),
                    Markup.button.callback(prepareTranslation(translations.buttons.LANGUAGES[ctx.session.language], languages.find(l => l.id === ctx.session.language)?.label), 'languages'),
                    Markup.button.callback(translations.buttons.HELP[ctx.session.language], 'help_tokens'),
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
                        Markup.button.url(prepareTranslation(translations.buttons.BUY[ctx.session.language], token), 'https://ton.org'),
                        Markup.button.url(prepareTranslation(translations.buttons.SELL[ctx.session.language], token), 'https://ton.org'),
                    ],
                    [
                        Markup.button.callback(translations.buttons.MANAGE_LIQUIDITY[ctx.session.language], 'manage_liquidity'),
                        Markup.button.callback(translations.buttons.CLAIM_REWARDS[ctx.session.language], 'claim_rewards'),
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
    hasRewards: {
        text: (ctx: any) => {
            const token = ctx.session.token.toUpperCase();
            return prepareTranslation(translations.HAS_REWARDS[ctx.session.language], token);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.url(translations.buttons.APPROVE[ctx.session.language], 'https://ton.org'),
                    Markup.button.callback(translations.buttons.BACK[ctx.session.language], ctx.session.token),
                ]
            ]);
        }
    },
    noRewards: {
        text: (ctx: any) => {
            const token = ctx.session.token.toUpperCase();
            return prepareTranslation(translations.NO_REWARDS[ctx.session.language], token);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard([
                [
                    Markup.button.url(translations.buttons.ADD_LIQUIDITY[ctx.session.language], 'https://ton.org'),
                    Markup.button.callback(translations.buttons.BACK[ctx.session.language], ctx.session.token),
                ]
            ]);
        }
    },
    manageLiquidity: {
        text: (ctx: any) => {
            const token = ctx.session.token.toUpperCase();
            return prepareTranslation(translations.MANAGE_LIQUIDITY[ctx.session.language], token);
        },
        buttons: (ctx: any) => {
            return Markup.inlineKeyboard(
                [
                    [
                        Markup.button.url(translations.buttons.ADD_LIQUIDITY[ctx.session.language], 'https://ton.org'),
                        ctx.session.showRemoveLiquidity ?
                            Markup.button.callback(translations.buttons.REMOVE_LIQUIDITY[ctx.session.language], 'remove_liquidity') :
                            Markup.button.url(translations.buttons.REMOVE_LIQUIDITY[ctx.session.language], 'https://ton.org'),
                    ],
                    [
                        Markup.button.callback(translations.buttons.CLAIM_REWARDS[ctx.session.language], 'claim_rewards'),
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
                    Markup.button.callback(prepareTranslation(translations.buttons.LANGUAGES[ctx.session.language], languages.find(l => l.id === ctx.session.language)?.label), 'languages'),
                    Markup.button.callback(translations.buttons.HELP[ctx.session.language], 'help_disconnected')
                ]
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
    ctx.editMessageText(steps.manageLiquidity.text(ctx), steps.manageLiquidity.buttons(ctx));
    ctx.session.showRemoveLiquidity = !ctx.session.showRemoveLiquidity;
});

bot.action('claim_rewards', async (ctx: any) => {
    if (ctx.session.showRewards) {
        ctx.editMessageText(steps.hasRewards.text(ctx), steps.hasRewards.buttons(ctx));
    } else {
        ctx.editMessageText(steps.noRewards.text(ctx), steps.noRewards.buttons(ctx));
    }
    ctx.session.showRewards = !ctx.session.showRewards;
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

bot.action(['usdc', 'fodl', 'xrp', 'dot', 'btc', 'eth', 'link', 'dot'], async (ctx: any) => {
    ctx.session.token = ctx.update.callback_query.data;
    ctx.editMessageText(steps.token.text(ctx), steps.token.buttons(ctx));
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
    ctx.session.walletAddress = '';
    ctx.session.waitingForWalletAddress = true;
    ctx.editMessageText(`Wallet disconnected. ${steps.disconnected.text(ctx)}`, steps.disconnected.buttons(ctx));
});

// ---------------- ON MESSAGE ------------------

bot.on('message', async (ctx) => {
    // set a default value
    ctx.session ??= {walletAddress: "", waitingForWalletAddress: false, language: 'EN'};

    if (ctx.session.waitingForWalletAddress) {
        ctx.session.walletAddress = (ctx.message as any).text;
    }

    if (ctx.session.walletAddress) {
        ctx.session.waitingForWalletAddress = false;
        await ctx.reply('Wallet connected successfully 🎉');
        await ctx.reply(steps.tokens.text(ctx), steps.tokens.buttons(ctx));
    } else {
        ctx.session.waitingForWalletAddress = true;
        await ctx.reply(steps.disconnected.text(ctx), steps.disconnected.buttons(ctx));
    }
});

// ---------------- BOT ------------------

// Launch bot
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch().then();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
