export const NOAH_ADDRESSES = {
  1: process.env.REACT_APP_NOAHV4_1 || "",
  11155111: process.env.REACT_APP_NOAHV4_11155111 || "",
  10: process.env.REACT_APP_NOAHV4_10 || "",
  137: process.env.REACT_APP_NOAHV4_137 || "",
  8453: process.env.REACT_APP_NOAHV4_8453 || "",
  42161: process.env.REACT_APP_NOAHV4_42161 || "",
};

export function getNoahAddressForChain(chainId) {
  const id = Number(chainId || 0);
  return NOAH_ADDRESSES[id] || process.env.REACT_APP_NOAHV4_ADDRESS || "";
}


