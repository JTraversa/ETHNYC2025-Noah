import { getPublicClient, writeContract } from 'wagmi/actions';
import { parseAbi } from 'viem';
import { wagmiConfig } from './wagmi';

const ABI = parseAbi([
  'function buildArk(address,uint256,address[],bool,bool)',
  'function getArk(address) view returns (address,uint256,uint256,address[],bool,bool)',
  'function pingArk()',
  'function addPassengers(address[])',
  'function removePassenger(address)',
  'function updateDeadlineDuration(uint256)',
  'function updateBeneficiary(address)',
  'function updateAuctionPreference(bool)',
  'function updateTargetCurrencyPreference(bool)',
  'function fernOfframp(address,address,uint256)',
  'function flood(address)'
]);

export async function getArk(noahAddress, user) {
  const client = getPublicClient();
  return client.readContract({
    address: noahAddress,
    abi: ABI,
    functionName: 'getArk',
    args: [user]
  });
}

export async function buildArk(noahAddress, beneficiary, duration, tokens, useDA, usePYUSD) {
  // eslint-disable-next-line no-console
  console.log('[Noah] buildArk start', { noahAddress, beneficiary, duration, tokensCount: tokens?.length || 0, useDA, usePYUSD });
  const hash = await writeContract(wagmiConfig, {
    address: noahAddress,
    abi: ABI,
    functionName: 'buildArk',
    args: [beneficiary, BigInt(duration), tokens, useDA, usePYUSD]
  });
  // eslint-disable-next-line no-console
  console.log('[Noah] buildArk tx', hash);
  return hash;
}

export async function pingArk(noahAddress) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'pingArk' });
}

export async function addPassengers(noahAddress, tokens) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'addPassengers', args: [tokens] });
}

export async function removePassenger(noahAddress, token) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'removePassenger', args: [token] });
}

export async function updateDeadlineDuration(noahAddress, duration) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'updateDeadlineDuration', args: [BigInt(duration)] });
}

export async function updateBeneficiary(noahAddress, newBeneficiary) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'updateBeneficiary', args: [newBeneficiary] });
}

export async function updateAuctionPreference(noahAddress, value) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'updateAuctionPreference', args: [value] });
}

export async function updateTargetCurrencyPreference(noahAddress, value) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'updateTargetCurrencyPreference', args: [value] });
}

export async function fernOfframp(noahAddress, token, to, amount) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'fernOfframp', args: [token, to, BigInt(amount)] });
}

export async function flood(noahAddress, user) {
  return writeContract(wagmiConfig, { address: noahAddress, abi: ABI, functionName: 'flood', args: [user] });
}


