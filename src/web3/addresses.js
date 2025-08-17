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

// Optional: Noah v4 NFT contract addresses (ERC721-based Ark)
export const NOAH_NFT_ADDRESSES = {
  1: process.env.REACT_APP_NOAHV4NFT_1 || "",
  11155111: process.env.REACT_APP_NOAHV4NFT_11155111 || "",
  42161: process.env.REACT_APP_NOAHV4NFT_42161 || "",
};

export function getNoahNftAddressForChain(chainId) {
  const id = Number(chainId || 0);
  return NOAH_NFT_ADDRESSES[id] || process.env.REACT_APP_NOAHV4NFT_ADDRESS || "";
}

// Common ENS ERC721 collection addresses by chain
// Mainnet .eth Base Registrar: 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85
export const ENS_ERC721_ADDRESSES = {
  1: process.env.REACT_APP_ENS_ERC721_1 || "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
  11155111: process.env.REACT_APP_ENS_ERC721_11155111 || "",
};

export function getEnsErc721ForChain(chainId) {
  const id = Number(chainId || 0);
  return ENS_ERC721_ADDRESSES[id] || process.env.REACT_APP_ENS_ERC721_ADDRESS || "";
}


