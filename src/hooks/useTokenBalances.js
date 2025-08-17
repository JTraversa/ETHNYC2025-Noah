import { useCallback, useMemo, useState } from "react";

/**
 * Simple client for fetching ERC20 balances using Covalent API.
 * Caller provides: chainId (number), address (0x...), apiKey (string)
 */
export function useTokenBalances() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWithCovalent = useCallback(async ({ chainId, address, apiKey }) => {
    setLoading(true);
    setError(null);
    try {
      if (!chainId || !address || !apiKey) throw new Error("Missing chainId/address/apiKey");
      // Debug: log request parameters
      // eslint-disable-next-line no-console
      console.log("[Covalent] Fetch start", { chainId, address });
      const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?nft=false&no-nft-fetch=true&key=${apiKey}`;
      const res = await fetch(url);
      // eslint-disable-next-line no-console
      console.log("[Covalent] HTTP status", res.status);
      if (!res.ok) {
        // If Covalent returns 501, try fallback: Ethereum mainnet for test address
        if (res.status === 501) {
          try {
            const fallbackAddr = '0x3f60008dfd0efc03f476d9b489d6c5b13b3ebf2c';
            const fallbackUrl = `https://api.covalenthq.com/v1/1/address/${fallbackAddr}/balances_v2/?nft=false&no-nft-fetch=true&key=${apiKey}`;
            // eslint-disable-next-line no-console
            console.warn('[Covalent] 501 received. Retrying on Ethereum mainnet for test address', { fallbackAddr });
            const res2 = await fetch(fallbackUrl);
            // eslint-disable-next-line no-console
            console.log('[Covalent] Fallback HTTP status', res2.status);
            if (res2.ok) {
              const data2 = await res2.json();
              const items2 = data2?.data?.items || [];
              const erc20s2 = items2
                .filter((it) => it?.type === 'cryptocurrency' || it?.contract_decimals >= 0)
                .map((it) => ({
                  address: (it?.contract_address || '').toLowerCase(),
                  symbol: it?.contract_ticker_symbol || '',
                  name: it?.contract_name || '',
                  decimals: Number(it?.contract_decimals || 0),
                  balance: it?.balance || '0',
                  logo_url: it?.logo_url || '',
                }))
                .filter((t) => t.address && t.balance !== '0');
              setTokens(erc20s2);
              return erc20s2;
            }
          } catch (fallbackErr) {
            // eslint-disable-next-line no-console
            console.error('[Covalent] Fallback fetch error', fallbackErr);
          }
        }
        throw new Error(`Covalent error ${res.status}`);
      }
      const data = await res.json();
      const items = data?.data?.items || [];
      const erc20s = items
        .filter((it) => it?.type === "cryptocurrency" || it?.contract_decimals >= 0)
        .map((it) => ({
          address: (it?.contract_address || "").toLowerCase(),
          symbol: it?.contract_ticker_symbol || "",
          name: it?.contract_name || "",
          decimals: Number(it?.contract_decimals || 0),
          balance: it?.balance || "0",
          logo_url: it?.logo_url || "",
        }))
        .filter((t) => t.address && t.balance !== "0");
      setTokens(erc20s);
      // eslint-disable-next-line no-console
      console.log("[Covalent] Parsed tokens", { totalItems: items.length, nonZeroErc20s: erc20s.length });
      return erc20s;
    } catch (e) {
      setError(e);
      setTokens([]);
      // eslint-disable-next-line no-console
      console.error("[Covalent] Fetch error", e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ tokens, loading, error, fetchWithCovalent }),
    [tokens, loading, error, fetchWithCovalent]
  );
}


