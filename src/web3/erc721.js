import { getPublicClient, writeContract } from 'wagmi/actions';
import { parseAbi, zeroAddress } from 'viem';
import { wagmiConfig } from './wagmi';

const ERC721_ABI = parseAbi([
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)'
]);

export async function isApprovedForAll(collection, owner, operator) {
  const client = getPublicClient();
  return client.readContract({ address: collection, abi: ERC721_ABI, functionName: 'isApprovedForAll', args: [owner, operator] });
}

export async function getApproved(collection, tokenId) {
  const client = getPublicClient();
  try {
    return client.readContract({ address: collection, abi: ERC721_ABI, functionName: 'getApproved', args: [BigInt(tokenId)] });
  } catch (_e) {
    return zeroAddress;
  }
}

export async function setApprovalForAll(collection, operator, approved) {
  return writeContract(wagmiConfig, { address: collection, abi: ERC721_ABI, functionName: 'setApprovalForAll', args: [operator, approved] });
}

export async function approve(collection, to, tokenId) {
  return writeContract(wagmiConfig, { address: collection, abi: ERC721_ABI, functionName: 'approve', args: [to, BigInt(tokenId)] });
}


