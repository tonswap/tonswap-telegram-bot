interface Token {
  image?: string;
  displayName: string;
  name: string;
  color:string;
  isActive: boolean;
  address?: string;
  amm?: string;
}

const tokens: Token[] = [
  {
    displayName: "LUNA",
    name: "luna",
    color: "#32487E",
    isActive: true,
    address: 'EQAycqbigAAkekkGG1A_3LSVGS1RfvJb4YavqUcbUg0pYK0u',
    amm: "EQCSOxDQI94b0vGCN2Lc3DPan8v3P_JRt-z4PJ9Af2_BPHx5"
  },
  {
    displayName: "DAI",
    name: "dai",
    color: "#9F8728",
    isActive: false
  },
  {
    displayName: "BTC",
    name: "btc",
    color: "#E08618",
     isActive: false
  },
  {
    displayName: "ETH",
    name: "eth",
    color: "#4D67CD",
     isActive: false
  },
  {
    displayName: "DOGE",
    name: "doge",
    color: "#9F8728",
     isActive: false
  },
  {
    displayName: "DOT",
    name: "dot",
    color: "#C20268",
     isActive: false
  },
  {
    displayName: "USDC",
    name: "usdc",
    color: "#28619E",
     isActive: false
  },
  {
    displayName: "USDT",
    name: "usdt",
    color: "#1B8362",
     isActive: false
  },

];

export { tokens, Token };
