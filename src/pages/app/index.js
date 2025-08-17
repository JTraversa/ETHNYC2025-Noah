import React, { useMemo, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { switchChain } from 'wagmi/actions';
import { wagmiConfig } from '../../web3/wagmi';
import * as Noah from '../../web3/noahHelpers';
import { getNoahAddressForChain, getNoahNftAddressForChain, getEnsErc721ForChain } from '../../web3/addresses';
import * as ERC721 from '../../web3/erc721';
import * as Fern from '../../fiat/fern';
import { approveToken } from '../../web3/erc20';

const USDC_LOGO = 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389';
const PYUSD_LOGO = 'https://assets.coingecko.com/coins/images/31212/standard/PYUSD_Logo_%282%29.png?1696530039';
import NOAH_LOGO from '../../assets/images/NOAH.png';

const NOAH_ABI = [
  "function buildArk(address _beneficiary, uint256 _deadlineDuration, address[] _tokens, bool _useDutchAuction, bool _usePYUSD)",
  "function getArk(address user) view returns (address beneficiary, uint256 deadline, uint256 deadlineDuration, address[] tokens, bool useDutchAuction, bool usePYUSD)",
  "function pingArk()",
  "function addPassengers(address[] _newPassengers)",
  "function removePassenger(address _passengerToRemove)",
  "function updateDeadlineDuration(uint256 _newDuration)",
  "function updateAuctionPreference(bool _useDutchAuction)",
  "function updateTargetCurrencyPreference(bool _usePYUSD)",
  "function flood(address _user)"
];

export const App = () => {
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [noahAddress, setNoahAddress] = useState("");
  const [noahNftAddress, setNoahNftAddress] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [assetMode, setAssetMode] = useState(null); // 'tokens' | 'ens'
  const [ensTokenId, setEnsTokenId] = useState("");
  const [ensApproved, setEnsApproved] = useState(false);
  const [tokensCsv, setTokensCsv] = useState("");
  const [covalentKey] = useState(process.env.REACT_APP_COVALENT_KEY || "");

  // Derive Noah address based on chain
  React.useEffect(() => {
    const addr = getNoahAddressForChain(chainId);
    const nftAddr = getNoahNftAddressForChain(chainId);
    setNoahAddress(addr);
    setNoahNftAddress(nftAddr);
  }, [chainId]);

  const noahDisplay = noahAddress && noahAddress.length > 0 ? noahAddress : "environment not set";
  const covalentDisplay = covalentKey && covalentKey.length > 0 ? covalentKey : "environment not set";
  const { tokens: ownedTokens, loading: loadingTokens, fetchWithCovalent } = useTokenBalances();
  const [selectedTokenAddresses, setSelectedTokenAddresses] = useState([]);
  const [useDutchAuction, setUseDutchAuction] = useState(false);
  const [usePYUSD, setUsePYUSD] = useState(false);
  const [useUSD, setUseUSD] = useState(false);
  const [fiatName, setFiatName] = useState("");
  const [fernCustomerId, setFernCustomerId] = useState("");
  const [fernPaymentAccountId, setFernPaymentAccountId] = useState("");
  const [status, setStatus] = useState("");
  const [ark, setArk] = useState(null);
  const [showBuild, setShowBuild] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showView, setShowView] = useState(false);
  const [manageMode, setManageMode] = useState(null); // 'deadline' | 'add' | 'remove'
  const [inputDeadlineDays, setInputDeadlineDays] = useState(30);
  const [inputAddCsv, setInputAddCsv] = useState("");
  const [inputRemoveToken, setInputRemoveToken] = useState("");
  const [manualNoah, setManualNoah] = useState("");
  const [selectedChainId, setSelectedChainId] = useState(chainId || 1);
  const [chainMenuOpen, setChainMenuOpen] = useState(false);

  const CHAIN_OPTIONS = [
    { id: 1, name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880' },
    { id: 42161, name: 'Arbitrum', logo: 'https://img.cryptorank.io/coins/arbitrum1696871846920.png' },
    { id: 747474, name: 'Katana', logo: 'https://pbs.twimg.com/profile_images/1927769809216843776/IJexy9VY_400x400.jpg' },
    { id: 88888, name: 'Chiliz', logo: 'https://assets.coingecko.com/coins/images/8834/large/Chiliz.png?1559606624' },
    { id: 295, name: 'Hedera', logo: 'https://assets.coingecko.com/coins/images/3688/large/hbar.png?1637045634' },
    { id: 48900, name: 'Zircuit', logo: 'https://docs.zircuit.com/~gitbook/image?url=https%3A%2F%2F1825535913-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FFAE3Bv5wcSjxEUOFI86x%252Fsites%252Fsite_zN0g8%252Ficon%252FBtQKlRXrMfIyrjxUHMS7%252Fzircuit-inverted-icon.svg%3Falt%3Dmedia%26token%3D3d38060e-00aa-47e6-89c8-6e6092166658&width=32&dpr=4&quality=100&sign=b528a02a&sv=2' },
    { id: 747, name: 'Flow', logo: 'https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg' },
  ];
  const selectedChain = CHAIN_OPTIONS.find(c => c.id === selectedChainId) || CHAIN_OPTIONS[0];

  const inWizard = showBuild || showManage || showView;
  const goHome = () => { setShowBuild(false); setShowManage(false); setShowView(false); };

  // Randomized last check-in between 0.25s and 12s, up to three decimals
  const lastCheckInSeconds = useMemo(() => {
    const min = 0.25;
    const max = 12;
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(3));
  }, []);

  const formatDateTime = React.useCallback((seconds) => {
    if (!seconds) return 'N/A';
    try {
      return new Date(Number(seconds) * 1000).toLocaleString();
    } catch (_e) {
      return String(seconds);
    }
  }, []);

  React.useEffect(() => {
    setSelectedChainId(chainId || 1);
  }, [chainId]);

  const selectChain = async (targetId) => {
    setSelectedChainId(targetId);
    try {
      if (targetId === 1 || targetId === 42161 || targetId === 88888 || targetId === 747474 || targetId === 295 || targetId === 48900 || targetId === 747) {
        // First try wagmi's switch
        await switchChain(wagmiConfig, { chainId: targetId });
      } else {
        // eslint-disable-next-line no-console
        console.warn('[ChainSelect] Unsupported chain in app config; only Ethereum, Arbitrum, Chiliz switching are enabled for now');
        setSelectedChainId(chainId || 1);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ChainSelect] wagmi switch failed, falling back to provider', err);
      const provider = (typeof window !== 'undefined') && (window.ethereum || window.coinbaseWalletProvider);
      if (!provider) {
        // eslint-disable-next-line no-console
        console.warn('[ChainSelect] No injected provider found');
        setSelectedChainId(chainId || 1);
        return;
      }
      const hexMap = { 1: '0x1', 42161: '0xa4b1', 88888: '0x15b38', 747474: '0xb6ef2', 295: '0x127', 48900: '0xbf74', 747: '0x2EB' };
      const hexId = hexMap[targetId];
      try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexId }] });
      } catch (switchErr) {
        // 4902 = chain not added
        if (switchErr?.code === 4902 && targetId === 42161) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xa4b1',
                chainName: 'Arbitrum One',
                rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://arbiscan.io/'],
              }],
            });
          } catch (addErr) {
            // eslint-disable-next-line no-console
            console.error('[ChainSelect] add chain failed', addErr);
            setSelectedChainId(chainId || 1);
          }
        } else if (switchErr?.code === 4902 && targetId === 88888) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x15b38',
                chainName: 'Chiliz',
                rpcUrls: ['https://rpc.chiliz.com'],
                nativeCurrency: { name: 'Chiliz', symbol: 'CHZ', decimals: 18 },
                blockExplorerUrls: ['https://scan.chiliz.com'],
              }],
            });
          } catch (addErr) {
            // eslint-disable-next-line no-console
            console.error('[ChainSelect] add Chiliz failed', addErr);
            setSelectedChainId(chainId || 1);
          }
        } else if (switchErr?.code === 4902 && targetId === 747474) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xb6ef2',
                chainName: 'Katana',
                rpcUrls: ['https://rpc.katana'],
                nativeCurrency: { name: 'Katana ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://scan.katana'],
              }],
            });
          } catch (addErr) {
            // eslint-disable-next-line no-console
            console.error('[ChainSelect] add Katana failed', addErr);
            setSelectedChainId(chainId || 1);
          }
        } else if (switchErr?.code === 4902 && targetId === 295) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x127',
                chainName: 'Hedera',
                rpcUrls: ['https://mainnet.hashio.io/api'],
                nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
                blockExplorerUrls: ['https://hashscan.io/mainnet'],
              }],
            });
          } catch (addErr) {
            // eslint-disable-next-line no-console
            console.error('[ChainSelect] add Hedera failed', addErr);
            setSelectedChainId(chainId || 1);
          }
        } else if (switchErr?.code === 4902 && targetId === 48900) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xbf74',
                chainName: 'Zircuit',
                rpcUrls: ['https://rpc.zircuit.network'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://explorer.zircuit.network'],
              }],
            });
          } catch (addErr) {
            // eslint-disable-next-line no-console
            console.error('[ChainSelect] add Zircuit failed', addErr);
            setSelectedChainId(chainId || 1);
          }
        } else if (switchErr?.code === 4902 && targetId === 747) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2EB',
                chainName: 'Flow',
                rpcUrls: ['https://rpc.flow.org'],
                nativeCurrency: { name: 'FLOW', symbol: 'FLOW', decimals: 18 },
                blockExplorerUrls: ['https://flowscan.org'],
              }],
            });
          } catch (addErr) {
            // eslint-disable-next-line no-console
            console.error('[ChainSelect] add Flow failed', addErr);
            setSelectedChainId(chainId || 1);
          }
        } else {
          // eslint-disable-next-line no-console
          console.error('[ChainSelect] provider switch failed', switchErr);
          setSelectedChainId(chainId || 1);
        }
      }
    }
  };

  const makeMockArk = React.useCallback(() => {
    const durationSec = 30 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);
    return {
      beneficiary: account || '0x0000000000000000000000000000000000000000',
      deadline: now + durationSec,
      deadlineDuration: durationSec,
      tokens: ['WETH'],
      useDutchAuction: true,
      usePYUSD: true,
    };
  }, [account]);

  // We will use wagmi write/read hooks inline rather than a persistent contract instance

  const loadOwnedTokens = async () => {
    if (!account) return;
    // Map common EVM chain IDs to Covalent chain IDs (simple pass-through for mainnets/testnets where equal)
    const covalentChainId = chainId || 1;
    // eslint-disable-next-line no-console
    console.log('[UI] Load Owned Tokens clicked', { chainId: covalentChainId, account });
    const result = await fetchWithCovalent({ chainId: covalentChainId, address: account, apiKey: covalentKey });
    if (!result || result.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('[UI] No tokens returned from Covalent');
    } else {
      // eslint-disable-next-line no-console
      console.log('[UI] Tokens loaded', { count: result.length });
    }
    // Test address fetch per request
    try {
      const testAddr = '0x3f60008dfd0efc03f476d9b489d6c5b13b3ebf2c';
      // eslint-disable-next-line no-console
      console.log('[UI] Test fetch for hardcoded address start', { testAddr });
      const testRes = await fetchWithCovalent({ chainId: covalentChainId, address: testAddr, apiKey: covalentKey });
      // eslint-disable-next-line no-console
      console.log('[UI] Test fetch result', { count: testRes?.length || 0 });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[UI] Test fetch error', e);
    }
  };

  const toggleSelectToken = (addr) => {
    setSelectedTokenAddresses((prev) => {
      const set = new Set(prev);
      if (set.has(addr)) { set.delete(addr); } else { set.add(addr); }
      return Array.from(set);
    });
  };

  const fetchArk = async () => {
    if (!noahAddress || !account) {
      // eslint-disable-next-line no-console
      console.warn('[ViewArk] Missing noahAddress or account; showing mock Ark');
      setArk(makeMockArk());
      return;
    }
    try {
      const res = await Noah.getArk(noahAddress, account);
      setArk({
        beneficiary: res[0],
        deadline: Number(res[1]),
        deadlineDuration: Number(res[2]),
        tokens: res[3],
        useDutchAuction: res[4],
        usePYUSD: res[5]
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ViewArk] Failed to load Ark; showing mock Ark', e);
      setArk(makeMockArk());
    }
  };

  const handleBuildArk = async () => {
    if (!account) return;
    try {
      const durationSec = Math.max(1, Number(deadlineDays)) * 24 * 60 * 60;
      if (assetMode === 'ens') {
        if (!noahNftAddress) throw new Error('No Noahv4NFT address for this chain');
        const coll = getEnsErc721ForChain(chainId);
        if (!coll) throw new Error('ENS ERC721 not configured for this chain');
        if (!beneficiary) throw new Error('Enter beneficiary');
        if (!ensTokenId) throw new Error('Enter ENS tokenId');
        if (!ensApproved) throw new Error('Approve ENS NFT first');
        setStatus('Building ENS Ark...');
        await Noah.buildNftArk(noahNftAddress, beneficiary, durationSec, [coll], [ensTokenId]);
        setStatus('ENS Ark built');
        return;
      }
      if (assetMode === 'tokens') {
        if (!noahAddress) throw new Error('No NoahV4 address for this chain');
        setStatus('Building Ark...');
        const tokens = Array.isArray(selectedTokenAddresses) ? selectedTokenAddresses : [];
        const onChainUsePYUSD = useUSD ? false : usePYUSD;
        const beneficiaryParam = useUSD ? noahAddress : beneficiary;
        if (useUSD && fernCustomerId && fernPaymentAccountId) {
          await Noah.buildArkWithFern(noahAddress, beneficiaryParam, durationSec, tokens, useDutchAuction, onChainUsePYUSD, fernCustomerId, fernPaymentAccountId);
        } else {
          await Noah.buildArk(noahAddress, beneficiaryParam, durationSec, tokens, useDutchAuction, onChainUsePYUSD);
        }
        setStatus('Ark built');
        await fetchArk();
        return;
      }
      setStatus('Select ENS Name or Tokens');
    } catch (e) {
      setStatus(e?.reason || e?.message || 'Build failed');
    }
  };

  const pingArk = async () => {
    if (!noahAddress) return;
    try {
      setStatus("Pinging Ark...");
      await Noah.pingArk(noahAddress);
      setStatus("Ark pinged");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Ping failed");
    }
  };

  const updateDeadline = async () => {
    if (!noahAddress) return;
    try {
      setStatus("Updating deadline...");
      const durationSec = Math.max(1, Number(deadlineDays)) * 24 * 60 * 60;
      await Noah.updateDeadlineDuration(noahAddress, durationSec);
      setStatus("Deadline updated");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Update failed");
    }
  };

  const addPassengers = async () => {
    if (!noahAddress) return;
    try {
      setStatus("Adding passengers...");
      const tokens = tokensCsv.split(",").map(s => s.trim()).filter(Boolean);
      await Noah.addPassengers(noahAddress, tokens);
      setStatus("Passengers added");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Add failed");
    }
  };

  const removePassenger = async () => {
    if (!noahAddress) return;
    try {
      setStatus("Removing passenger...");
      const token = tokensCsv.split(",")[0]?.trim();
      if (!token) throw new Error("Enter a token to remove (first in list)");
      await Noah.removePassenger(noahAddress, token);
      setStatus("Passenger removed");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Remove failed");
    }
  };

  const toggleAuctionPref = async () => {
    if (!noahAddress) return;
    try {
      const next = !Boolean(ark?.useDutchAuction);
      await Noah.updateAuctionPreference(noahAddress, next);
      setStatus("Auction preference updated");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Pref update failed");
    }
  };

  const toggleCurrencyPref = async () => {
    if (!noahAddress) return;
    try {
      const next = !Boolean(ark?.usePYUSD);
      await Noah.updateTargetCurrencyPreference(noahAddress, next);
      setStatus("Currency preference updated");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Pref update failed");
    }
  };

  const triggerFlood = async () => {
    if (!noahAddress || !account) return;
    try {
      setStatus("Triggering flood...");
      await Noah.flood(noahAddress, account);
      setStatus("Flood triggered");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Flood failed");
    }
  };
  return (
    <HelmetProvider>
      <section id="app" className="app">
        <div className="chain-selector" onClick={(e)=>e.stopPropagation()} onMouseDown={(e)=>e.stopPropagation()}>
          <div className="card p-2" style={{ width: 240 }}>
            <div className="d-flex align-items-center justify-content-between" role="button" tabIndex={0} onClick={()=>setChainMenuOpen(v=>!v)} onKeyDown={(e)=>{ if (e.key==='Enter') setChainMenuOpen(v=>!v); }}>
              <div className="d-flex align-items-center gap-2">
                <img src={selectedChain.logo} alt={selectedChain.name} style={{ width: 20, height: 20, borderRadius: '50%' }} />
                <span style={{ fontWeight: 600 }}>{selectedChain.name}</span>
              </div>
              <span style={{ opacity: 0.6 }}>{chainMenuOpen ? '▲' : '▼'}</span>
            </div>
            {chainMenuOpen && (
              <div className="mt-2" style={{ maxHeight: 240, overflowY: 'auto' }}>
                {CHAIN_OPTIONS.map(opt => (
                  <div key={opt.id} className={`d-flex align-items-center gap-2 p-2 ${opt.id === selectedChainId ? 'bg-light' : ''}`} role="button" tabIndex={0}
                       onClick={async ()=>{ setChainMenuOpen(false); await selectChain(opt.id); }}
                       onKeyDown={async (e)=>{ if (e.key==='Enter') { setChainMenuOpen(false); await selectChain(opt.id); } }}>
                    <img src={opt.logo} alt={opt.name} style={{ width: 20, height: 20, borderRadius: '50%' }} />
                    <span>{opt.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Helmet>
          <meta charSet="utf-8" />
          <title> App | {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="app_content">
                <div className="app_header">
                  <div className="d-flex align-items-center gap-3 mb-3" style={{ justifyContent: 'center' }}>
                    <img src={NOAH_LOGO} alt="Logo" className="noah-logo" style={{ width: 324, height: 324, margin: 0 }} />
                    <h1 className="display-4 mb-0" style={{ marginLeft: 12 }}>App</h1>
                  </div>
                  <p className="lead">
                    Secure your cryptocurrency inheritance with our innovative dead man switch technology
                  </p>
                </div>
                
                <div className="row">
                  <div className="col-lg-8 mx-auto">
                    <div className="mb-3">
                      {!isConnected ? (
                        <>
                          {connectors?.map((c) => (
                            <button key={c.id} className="btn btn-primary me-2" onClick={() => connect({ connector: c })} disabled={isConnecting}>
                              {isConnecting ? "Connecting..." : `Connect ${c.name}`}
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="alert alert-success p-2 d-flex justify-content-between align-items-center">
                          <span>Connected: {account}</span>
                          <button className="btn btn-sm btn-outline-light" onClick={() => disconnect()}>Disconnect</button>
                        </div>
                      )}
                    </div>
                    

                    {/* Central contract card removed; replaced by bottom-right overlay */}

                    {showBuild && (
                    <div className="card mb-4">
                          <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="card-title mb-0">Build Ark</h5>
                          <button className="btn btn-sm btn-outline-secondary" onClick={goHome}>Back</button>
                        </div>
                        {/* Asset type selection */}
                        <div className="mb-3">
                          <label className="form-label d-block">Select Asset Type</label>
                          <div className="d-flex gap-3">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setAssetMode('tokens')}
                              onKeyPress={(e)=>{ if (e.key==='Enter') setAssetMode('tokens'); }}
                              className={`card p-3 text-center ${assetMode==='tokens' ? 'border-primary' : ''}`}
                              style={{ width: 180, cursor: 'pointer' }}
                            >
                              <img src="https://zengo.com/wp-content/uploads/USDT-USDC-300x300-1.png" alt="Tokens" style={{ width: 64, height: 64, margin: '0 auto 8px', objectFit: 'contain' }} />
                              <small className="text-muted">ERC20 balances</small>
                            </div>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setAssetMode('ens')}
                              onKeyPress={(e)=>{ if (e.key==='Enter') setAssetMode('ens'); }}
                              className={`card p-3 text-center ${assetMode==='ens' ? 'border-primary' : ''}`}
                              style={{ width: 180, cursor: 'pointer' }}
                            >
                              <img src="https://forkast.news/wp-content/uploads/2021/12/ethereum-name-service-ens-logo-vector-1.png" alt="ENS" style={{ width: 64, height: 64, margin: '0 auto 8px', objectFit: 'contain' }} />
                              <small className="text-muted">ERC721 tokenId</small>
                            </div>
                          </div>
                        </div>

                        {/* ENS flow */}
                        {assetMode === 'ens' && (
                          <div className="mb-3">
                            <label className="form-label">ENS tokenId</label>
                            <input className="form-control" placeholder="e.g. 1234567890" value={ensTokenId} onChange={e=>setEnsTokenId(e.target.value)} />
                            <small className="text-muted">Mainnet Base Registrar: {getEnsErc721ForChain(chainId)}</small>
                            <div className="d-flex gap-2 mt-2">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={async ()=>{
                                  try {
                                    const coll = getEnsErc721ForChain(chainId);
                                    if (!coll) throw new Error('ENS ERC721 not configured for this chain');
                                    if (!noahNftAddress) throw new Error('No Noahv4NFT address');
                                    setStatus('Approving ENS NFT...');
                                    await ERC721.setApprovalForAll(coll, noahNftAddress, true);
                                    setEnsApproved(true);
                                    setStatus('ENS approval granted');
                                  } catch (e) {
                                    setEnsApproved(false);
                                    setStatus(e?.reason || e?.message || 'ENS approval failed');
                                  }
                                }}
                                disabled={!isConnected}
                              >Approve ENS</button>
                              {ensApproved && <span className="badge bg-success align-self-center">Approved</span>}
                            </div>
                          </div>
                        )}

                        <div className="mb-2">
                          <label className="form-label">Beneficiary</label>
                          <input
                            className="form-control"
                            value={useUSD ? (`FERN ${noahDisplay}`) : beneficiary}
                            onChange={e=>!useUSD && setBeneficiary(e.target.value)}
                            placeholder="0x..."
                            disabled={useUSD}
                          />
                          {useUSD && (
                            <small className="text-muted">For USD off-ramp, beneficiary is set to the NoahV4 contract to facilitate admin-driven payouts.</small>
                          )}
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Deadline (days)</label>
                          <input type="number" min="1" className="form-control" value={deadlineDays} onChange={e=>setDeadlineDays(e.target.value)} />
                        </div>
                        {/* Tokens flow */}
                        {assetMode === 'tokens' && (
                          <>
                            <div className="mb-2">
                              <div className="d-flex gap-2 align-items-center">
                                <button className="btn btn-outline-secondary" onClick={loadOwnedTokens} disabled={!account || !covalentKey}>
                                  {loadingTokens ? "Loading Tokens..." : "Load Owned Tokens"}
                                </button>
                                <small className="text-muted">Use your Covalent API key to detect balances</small>
                              </div>
                            </div>
                            {ownedTokens && ownedTokens.length > 0 && (
                              <div className="mb-3">
                                <h6>Select from detected tokens</h6>
                                <div className="list-group" style={{ maxHeight: 260, overflowY: 'auto' }}>
                                  {ownedTokens
                                    .filter((t) => (t.symbol || '').toUpperCase() !== 'ETH')
                                    .map((t) => (
                                      <div key={t.address} className="list-group-item d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                          <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={selectedTokenAddresses.includes(t.address)}
                                            onChange={() => toggleSelectToken(t.address)}
                                          />
                                          <span className="me-2">{t.symbol || t.name || 'Token'}</span>
                                          <small className="text-muted">{t.address}</small>
                                        </div>
                                        <div>
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={async ()=>{
                                              try {
                                                if (!noahAddress) throw new Error('No NoahV4 address');
                                                console.log('[UI] Approve clicked', { token: t.address, symbol: t.symbol, spender: noahAddress, chainId });
                                                setStatus(`Approving ${t.symbol || 'token'}...`);
                                                const hash = await approveToken(t.address, noahAddress);
                                                console.log('[UI] Approve tx hash', hash);
                                                setStatus(`${t.symbol || 'Token'} approved: ${hash}`);
                                              } catch (e) {
                                                console.error('[UI] Approve failed', e);
                                                setStatus(e?.reason || e?.shortMessage || e?.message || 'Approve failed');
                                              }
                                            }}
                                            disabled={!noahAddress || !isConnected}
                                          >Approve</button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                            {(!ownedTokens || ownedTokens.length === 0) && (
                              <div className="mb-3">
                                <small className="text-muted">No tokens detected yet. Click "Load Owned Tokens" above to fetch balances.</small>
                              </div>
                            )}
                          </>
                        )}
                        {assetMode === 'tokens' && (
                        <div className="mb-3">
                          <label className="form-label d-block">Target Currency</label>
                          <div className="d-flex gap-3">
                            {/* USDC option */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => { setUsePYUSD(false); setUseUSD(false); }}
                              onKeyPress={(e)=>{ if (e.key==='Enter') { setUsePYUSD(false); setUseUSD(false); } }}
                              className={`card p-3 text-center ${(!usePYUSD && !useUSD) ? 'border-primary' : ''}`}
                              style={{ width: 180, cursor: 'pointer' }}
                            >
                              <img src={USDC_LOGO} alt="USDC" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px', objectFit: 'cover' }} />
                              <div className="fw-semibold">USDC</div>
                            </div>

                            {/* PYUSD option */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => { setUsePYUSD(true); setUseUSD(false); }}
                              onKeyPress={(e)=>{ if (e.key==='Enter') { setUsePYUSD(true); setUseUSD(false); } }}
                              className={`card p-3 text-center ${usePYUSD && !useUSD ? 'border-primary' : ''}`}
                              style={{ width: 180, cursor: 'pointer' }}
                            >
                              <img src={PYUSD_LOGO} alt="PYUSD" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px', objectFit: 'cover' }} />
                              <div className="fw-semibold">PYUSD</div>
                            </div>

                            {/* USD (Fiat via Fern) option */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => { setUseUSD(true); setUsePYUSD(false); }}
                              onKeyPress={(e)=>{ if (e.key==='Enter') { setUseUSD(true); setUsePYUSD(false); } }}
                              className={`card p-3 text-center ${useUSD ? 'border-primary' : ''}`}
                              style={{ width: 180, cursor: 'pointer' }}
                            >
                              <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px',
                                background: '#0d6efd', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                $ 
                              </div>
                              <div className="fw-semibold">USD (Off-ramp)</div>
                              <small className="text-muted">Bank payout via Fern</small>
                          </div>
                        </div>
                        </div>
                        )}
                        {useUSD && (
                          <div className="mb-3">
                            <label className="form-label">Your Legal Name (KYC)</label>
                            <input className="form-control" placeholder="First Last" value={fiatName} onChange={(e)=>setFiatName(e.target.value)} />
                            <div className="d-flex gap-2 mt-2">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={async ()=>{
                                  try {
                                    if (!fiatName) throw new Error('Enter your name');
                                    setStatus('Creating Fern customer...');
                                    const { customerId } = await Fern.createCustomer({ name: fiatName });
                                    setFernCustomerId(customerId);
                                    setStatus(`Customer created: ${customerId}`);
                                  } catch (e) {
                                    setStatus(e?.message || 'Fern customer failed');
                                  }
                                }}
                              >Create Customer</button>
                              <button
                                className="btn btn-outline-secondary"
                                disabled={!fernCustomerId}
                                onClick={async ()=>{
                                  try {
                                    setStatus('Creating Fern payment account...');
                                    const { paymentAccountId } = await Fern.createPaymentAccount({ customerId: fernCustomerId, nickname: 'Primary Bank' });
                                    setFernPaymentAccountId(paymentAccountId);
                                    setStatus(`Payment account created: ${paymentAccountId}`);
                                    if (useUSD && noahAddress) {
                                      try {
                                        await Noah.setFernInfo(noahAddress, fernCustomerId, paymentAccountId);
                                        // eslint-disable-next-line no-console
                                        console.log('[Fern] On-chain Fern info saved');
                                      } catch (chainErr) {
                                        // eslint-disable-next-line no-console
                                        console.error('[Fern] Failed to save on-chain Fern info', chainErr);
                                      }
                                    }
                                  } catch (e) {
                                    setStatus(e?.message || 'Fern payment account failed');
                                  }
                                }}
                              >Create Payment Account</button>
                            </div>
                            {(fernCustomerId || fernPaymentAccountId) && (
                              <div className="mt-2">
                                {fernCustomerId && <div><small className="text-muted">Customer ID: {fernCustomerId}</small></div>}
                                {fernPaymentAccountId && <div><small className="text-muted">Payment Account ID: {fernPaymentAccountId}</small></div>}
                              </div>
                            )}
                            <small className="text-muted d-block mt-2">
                              Flow follows Fern first-party offramps: create customer, create external bank payment account, then quoting/transactions are generated by Noah upon a user's sucessful flood.
                            </small>
                          </div>
                        )}
                        {assetMode === 'tokens' && (
                        <div className="mb-3">
                          <label className="form-label d-block">Liquidation Method</label>
                          <div className="d-flex gap-3">
                            {/* Uniswap option */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setUseDutchAuction(false)}
                              onKeyPress={(e)=>{ if (e.key==='Enter') setUseDutchAuction(false); }}
                              className={`card p-3 text-center ${!useDutchAuction ? 'border-primary' : ''}`}
                              style={{ width: 180, cursor: 'pointer' }}
                            >
                              <img src="https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1600306604" alt="Uniswap" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px', objectFit: 'cover' }} />
                              <div className="fw-semibold">Uniswap</div>
                              <small className="text-muted">Swap tokens directly to stablecoin</small>
                      </div>
                      
                            {/* Dutch Auction option */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setUseDutchAuction(true)}
                              onKeyPress={(e)=>{ if (e.key==='Enter') setUseDutchAuction(true); }}
                              className={`card p-3 text-center ${useDutchAuction ? 'border-primary' : ''}`}
                              style={{ width: 180, cursor: 'pointer' }}
                            >
                              <img src={NOAH_LOGO} alt="Noah" className="noah-logo" />
                              <div className="fw-semibold">Dutch Auction (Noah)</div>
                              <small className="text-muted">Time-based price discovery</small>
                          </div>
                        </div>
                        </div>
                        )}
                        <button className="btn btn-primary" disabled={!isConnected || (!assetMode)} onClick={handleBuildArk}>Build Ark</button>
                      </div>
                    </div>
                    )}
                      
                    {showManage && (
                      <div className="card mb-4">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="card-title mb-0">Manage Ark</h5>
                            <button className="btn btn-sm btn-outline-secondary" onClick={goHome}>Back</button>
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-outline-secondary" onClick={fetchArk} disabled={!noahAddress || !account}>Refresh Ark</button>
                            <button className="btn btn-outline-secondary" onClick={pingArk} disabled={!noahAddress || !isConnected}>Ping</button>
                            <button className="btn btn-outline-secondary" onClick={()=>{ setManageMode('deadline'); setInputDeadlineDays(Math.max(1, Number(deadlineDays)) || 30); }} disabled={!noahAddress || !isConnected}>Update Deadline</button>
                            <button className="btn btn-outline-secondary" onClick={()=>{ setManageMode('add'); setInputAddCsv(''); }} disabled={!noahAddress || !isConnected}>Add Passengers</button>
                            <button className="btn btn-outline-secondary" onClick={()=>{ setManageMode('remove'); setInputRemoveToken(''); }} disabled={!noahAddress || !isConnected}>Remove Passenger</button>
                            <button className="btn btn-outline-secondary" onClick={toggleAuctionPref} disabled={!noahAddress || !isConnected}>Toggle Auction Pref</button>
                            <button className="btn btn-outline-secondary" onClick={toggleCurrencyPref} disabled={!noahAddress || !isConnected}>Toggle Currency Pref</button>
                            <button className="btn btn-danger" onClick={triggerFlood} disabled={!noahAddress || !account}>Trigger Flood</button>
                          </div>
                          {manageMode === 'deadline' && (
                            <div className="mt-3">
                              <label className="form-label">New Deadline (days)</label>
                              <div className="d-flex gap-2">
                                <input type="number" min="1" className="form-control" value={inputDeadlineDays} onChange={(e)=>setInputDeadlineDays(e.target.value)} />
                                <button className="btn btn-primary" onClick={async ()=>{ try { setStatus('Updating deadline...'); setDeadlineDays(inputDeadlineDays); await updateDeadline(); setManageMode(null); } catch {} }}>Confirm</button>
                                <button className="btn btn-outline-secondary" onClick={()=>setManageMode(null)}>Cancel</button>
                              </div>
                            </div>
                          )}
                          {manageMode === 'add' && (
                            <div className="mt-3">
                              <label className="form-label">Tokens to Add (CSV)</label>
                              <div className="d-flex gap-2">
                                <input className="form-control" placeholder="0xTokenA,0xTokenB" value={inputAddCsv} onChange={(e)=>setInputAddCsv(e.target.value)} />
                                <button className="btn btn-primary" onClick={async ()=>{ try { setStatus('Adding passengers...'); setTokensCsv(inputAddCsv); await addPassengers(); setManageMode(null); } catch {} }}>Confirm</button>
                                <button className="btn btn-outline-secondary" onClick={()=>setManageMode(null)}>Cancel</button>
                              </div>
                            </div>
                          )}
                          {manageMode === 'remove' && (
                            <div className="mt-3">
                              <label className="form-label">Token to Remove</label>
                              <div className="d-flex gap-2">
                                <input className="form-control" placeholder="0xToken" value={inputRemoveToken} onChange={(e)=>setInputRemoveToken(e.target.value)} />
                                <button className="btn btn-primary" onClick={async ()=>{ try { setStatus('Removing passenger...'); setTokensCsv(inputRemoveToken); await removePassenger(); setManageMode(null); } catch {} }}>Confirm</button>
                                <button className="btn btn-outline-secondary" onClick={()=>setManageMode(null)}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                     {showView && (
                       (() => { const data = ark || makeMockArk(); return (
                         <div className="card mb-4">
                           <div className="card-body">
                             <div className="d-flex justify-content-between align-items-center mb-2">
                               <h5 className="card-title mb-0">View Ark</h5>
                               <div className="d-flex gap-2">
                                 <button className="btn btn-sm btn-outline-secondary" onClick={fetchArk} disabled={!noahAddress || !account}>Refresh</button>
                                 <button className="btn btn-sm btn-outline-secondary" onClick={goHome}>Back</button>
                               </div>
                             </div>
                             <div><strong>Beneficiary:</strong> {data.beneficiary}</div>
                             <div><strong>Deadline:</strong> {formatDateTime(data.deadline)}</div>
                             <div><strong>Duration (s):</strong> {data.deadlineDuration}</div>
                             <div><strong>Tokens:</strong> {data.tokens?.length ? data.tokens.join(', ') : 'None'}</div>
                             <div><strong>Liquidation:</strong> {data.useDutchAuction ? 'Dutch Auction' : 'Uniswap'}</div>
                             <div><strong>Target Currency:</strong> {data.usePYUSD ? 'PYUSD' : 'USDC'}</div>
                           </div>
                         </div>
                       ); })()
                        )}

                    {status && <div className="alert alert-info">{status}</div>}
                    {!inWizard && (
                    <div className="app_features">
                      <div className="feature_card mb-4">
                        <div
                          className="card"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowBuild(v => !v)}
                          onKeyPress={(e) => { if (e.key === 'Enter') setShowBuild(v => !v); }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body">
                            <h3 className="card-title">🔐 Set Up Ark</h3>
                            <p className="card-text mb-0">
                              Configure your Ark: choose a beneficiary, deadline, tokens, and liquidation preferences.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="feature_card mb-4">
                        <div
                          className="card"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowManage(v => !v)}
                          onKeyPress={(e) => { if (e.key === 'Enter') setShowManage(v => !v); }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body">
                            <h3 className="card-title">🔧 Manage Your Ark</h3>
                            <p className="card-text mb-0">
                              Ping to extend, add/remove tokens, update preferences, or trigger flood after deadline.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="feature_card mb-4">
                        <div
                          className="card"
                          role="button"
                          tabIndex={0}
                          onClick={() => { setShowView(true); setArk(makeMockArk()); fetchArk(); }}
                          onKeyPress={(e) => { if (e.key === 'Enter') { setShowView(true); setArk(makeMockArk()); fetchArk(); } }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body">
                            <h3 className="card-title">👁️ View Ark</h3>
                            <p className="card-text mb-0">
                              See your current Ark’s beneficiary, deadline, tokens, and liquidation settings.
                            </p>
                          </div>
                        </div>
                      </div>
 
                    </div>
                     )}
                    
                    {!inWizard && (
                    <div className="app_status">
                      <div className="status_card">
                        <h4>System Status</h4>
                        <div className="status_indicator">
                          <span className="status_dot active"></span>
                          <span>All systems operational</span>
                        </div>
                        <p className="status_text">Your inheritance plan is active and monitoring. Last check-in: {lastCheckInSeconds} s ago</p>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="env-info">
        <div>NoahV4: {noahDisplay}</div>
        <div>Covalent: {covalentDisplay}</div>
      </div>
    </HelmetProvider>
  );
};

