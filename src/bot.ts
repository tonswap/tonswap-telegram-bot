import { Context, Markup, session, Telegraf } from "telegraf";
import { SessionStore } from "telegraf/src/session";
import fs from "fs";

const BN = require("bn.js");

interface SessionData {
    waitingForPassword: boolean;
    walletAddress: string;
    token?: string;
    language?: string;
    walletBalance?: string;
    password?: string;
}

interface MyContext extends Context {
    session?: SessionData;
}

const bot = new Telegraf<MyContext>(require("./config.ts").default.token);

// ---------------- PERSISTENCE ------------------

if (!fs.existsSync("./db.json")) {
    fs.writeFileSync("./db.json", JSON.stringify({}));
}

class FileStore implements SessionStore<any> {
    #store: any = require("../db.json");

    async delete(name: string): Promise<void> {
        delete this.#store[name];
        fs.writeFileSync("./db.json", JSON.stringify(this.#store));
    }

    async get(name: string): Promise<any> {
        return this.#store[name];
    }

    async set(name: string, value: any): Promise<void> {
        this.#store[name] = value;
        fs.writeFileSync("./db.json", JSON.stringify(this.#store));
    }
}

// Make session data available
bot.use(
    session({
        store: new FileStore(),
    })
);

bot.start(async (ctx) => {
    // set a default value
});

bot.on("message", async (ctx) => {
    console.log((ctx.message as any).text);
});

// ---------------- BOT ------------------

// Launch bot
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch().then();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
