import { writeContract } from 'wagmi/actions';
import { parseAbi } from 'viem';
import { wagmiConfig } from './wagmi';

const ERC20_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)'
]);

export async function approveToken(tokenAddress, spenderAddress) {
  // eslint-disable-next-line no-console
  console.log('[Approve] start', { tokenAddress, spenderAddress });
  const maxUint256 = (1n << 256n) - 1n;
  const amt = maxUint256;
  const txHash = await writeContract(wagmiConfig, {
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spenderAddress, amt]
  });
  // eslint-disable-next-line no-console
  console.log('[Approve] tx submitted', txHash);
  return txHash;
}


