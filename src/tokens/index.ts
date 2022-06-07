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
  {
    displayName: "USDT",
    name: "usdt",
    color: "#1B8362",
    isActive: true,
  },
];

export { tokens, Token };
