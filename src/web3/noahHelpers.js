import { getPublicClient, getWalletClient } from 'wagmi/actions';
import { parseAbi } from 'viem';

const ABI = parseAbi([
  'function buildArk(address,uint256,address[],bool,bool)',
  'function getArk(address) view returns (address,uint256,uint256,address[],bool,bool)',
  'function pingArk()',
  'function addPassengers(address[])',
  'function removePassenger(address)',
  'function updateDeadlineDuration(uint256)',
  'function updateAuctionPreference(bool)',
  'function updateTargetCurrencyPreference(bool)',
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
  const wallet = await getWalletClient();
  return wallet.writeContract({
    address: noahAddress,
    abi: ABI,
    functionName: 'buildArk',
    args: [beneficiary, BigInt(duration), tokens, useDA, usePYUSD]
  });
}

export async function pingArk(noahAddress) {
  const wallet = await getWalletClient();
  return wallet.writeContract({ address: noahAddress, abi: ABI, functionName: 'pingArk' });
}

export async function addPassengers(noahAddress, tokens) {
  const wallet = await getWalletClient();
  return wallet.writeContract({ address: noahAddress, abi: ABI, functionName: 'addPassengers', args: [tokens] });
}

export async function removePassenger(noahAddress, token) {
  const wallet = await getWalletClient();
  return wallet.writeContract({ address: noahAddress, abi: ABI, functionName: 'removePassenger', args: [token] });
}

export async function updateDeadlineDuration(noahAddress, duration) {
  const wallet = await getWalletClient();
  return wallet.writeContract({ address: noahAddress, abi: ABI, functionName: 'updateDeadlineDuration', args: [BigInt(duration)] });
}

export async function updateAuctionPreference(noahAddress, value) {
  const wallet = await getWalletClient();
  return wallet.writeContract({ address: noahAddress, abi: ABI, functionName: 'updateAuctionPreference', args: [value] });
}

export async function updateTargetCurrencyPreference(noahAddress, value) {
  const wallet = await getWalletClient();
  return wallet.writeContract({ address: noahAddress, abi: ABI, functionName: 'updateTargetCurrencyPreference', args: [value] });
}

export async function flood(noahAddress, user) {
  const wallet = await getWalletClient();
  return wallet.writeContract({ address: noahAddress, abi: ABI, functionName: 'flood', args: [user] });
}


