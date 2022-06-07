interface Token {
    image?: string;
    displayName: string;
    name: string;
    color: string;
    isActive: boolean;
    address?: string;
    amm?: string;
}

const tokens: Token[] = [
    {
        displayName: "SHIB",
        name: "shib",
        color: "#F00601",
        isActive: true,
        address: "EQAycqbigAAkekkGG1A_3LSVGS1RfvJb4YavqUcbUg0pYK0u",
        amm: "EQCSOxDQI94b0vGCN2Lc3DPan8v3P_JRt-z4PJ9Af2_BPHx5",
    },
    // {
    //   displayName: "DAI",
    //   name: "dai",
    //   color: "#9F8728",
    //   isActive: false
    // },
    // {
    //   displayName: "BTC",
    //   name: "btc",
    //   color: "#E08618",
    //    isActive: false
    // },
    // {
    //   displayName: "ETH",
    //   name: "eth",
    //   color: "#4D67CD",
    //    isActive: false
    // },
    // {
    //   displayName: "DOGE",
    //   name: "doge",
    //   color: "#9F8728",
    //    isActive: false
    // },
    // {
    //   displayName: "DOT",
    //   name: "dot",
    //   color: "#C20268",
    //    isActive: false
    // },
    // {
    //   displayName: "USDC",
    //   name: "usdc",
    //   color: "#28619E",
    //    isActive: false
    // },
    {
        displayName: "USDT",
        name: "usdt",
        color: "#1B8362",
        isActive: false,
        address: "EQD9SyLUUGV9Caqh7DgHp15JY4GcKpLoZ_wdmG7SQ_Mpjxw4",
        amm: "EQBomTp_uTphBeuJtuumlfmB4d6SP_zvN93KYpiM7WR7h9nA",
    },
];

export { tokens, Token };
