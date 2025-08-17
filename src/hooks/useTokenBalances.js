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
      if (!res.ok) throw new Error(`Covalent error ${res.status}`);
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


