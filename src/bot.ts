import {Telegraf, Markup, Context, session, Telegram} from 'telegraf';
const { reply, fork } = Telegraf
import { getMacros, macroReplace, execFifth, execRunMethod } from './utils'
import { initMarkupUI } from './markup-ui';
const MACROS = getMacros();

interface SessionData {
    messageCount: number
// ... more session data go here
}

// Define your own context type
interface MyContext extends Context {
    session?: SessionData
// ... more props go here
}


const config = require('./config');
console.log(config);
const process = require('process');
const bot = new Telegraf<MyContext>(config.token)

bot.use(session());


const keyboard = Markup.inlineKeyboard([
    Markup.button.game('Swap')
]);
bot.start((ctx: Context) => ctx.replyWithGame('Tonswap', keyboard));
bot.gameQuery((ctx: Context) => {
    ctx.answerGameQuery('http://telegraf.js.org').then();
});


// const keyboard = Markup.inlineKeyboard([
//     Markup.button.callback('Telegraf help', 'rotem')
// ]);
// bot.start((ctx) => ctx.telegram.sendMessage(ctx.message.chat.id, 'Swap', keyboard));
//
// bot.action('rotem', async (ctx: Context) => {
//
//     try {
//         await ctx.answerCbQuery('hey', {
//             url: 'http://telegraf.js.org'
//         })
//     } catch (e) {
//         console.log(e);
//     }
//
// });

//bot.start((ctx) => ctx.replyWithMarkdown('[hey](http://telegraf.js.org)', keyboard));



bot.help((ctx: any) => {
//     ctx.reply(
// `/balance <token_addr> <address_file> ->  prints out balance address
// -> /balance $USDC #MY_ADDRESS
// /transfer <token_addr> <target_addr> <amount>
// -> /transfer $USDC LP-TON.addr 200
// /mint <token_address> -> creates a mint action on a erc20
// -> /mint $USDC
// /addliquidity <amount_a> <amount_b> ->
// -> /addliquidity 1000 1000
// /removeliquidity <lp_address> <amount_to_remove> ->
// -> /removeliquidity $LP 2.5
// /swap <src_token_address> <lp_address> <amount_to_swap> <min_amount_out>
// ->    /swap $USDC $LP_USDC_KILO 4000 1 Send
// /quit to stop the bot
// `);
});

bot.command('balances', async (ctx: any) => {
    console.log('rotem');
});

bot.launch().then();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
