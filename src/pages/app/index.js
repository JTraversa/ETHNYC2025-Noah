import React, { useMemo, useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta } from "../../content_option";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import * as Noah from '../../web3/noahHelpers';
import { getNoahAddressForChain } from '../../web3/addresses';
import * as Fern from '../../fiat/fern';

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
  const [beneficiary, setBeneficiary] = useState("");
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [tokensCsv, setTokensCsv] = useState("");
  const [covalentKey] = useState(process.env.REACT_APP_COVALENT_KEY || "");

  // Derive Noah address based on chain
  React.useEffect(() => {
    const addr = getNoahAddressForChain(chainId);
    setNoahAddress(addr);
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

  const inWizard = showBuild || showManage;
  const goHome = () => { setShowBuild(false); setShowManage(false); };

  // Randomized last check-in between 0.25s and 12s, up to three decimals
  const lastCheckInSeconds = useMemo(() => {
    const min = 0.25;
    const max = 12;
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(3));
  }, []);

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
    if (!noahAddress || !account) return;
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
    } catch {}
  };

  const handleBuildArk = async () => {
    if (!noahAddress || !account) return;
    try {
      setStatus("Building Ark...");
      const durationSec = Math.max(1, Number(deadlineDays)) * 24 * 60 * 60;
      const tokens = Array.isArray(selectedTokenAddresses) ? selectedTokenAddresses : [];
      // If USD (fiat) is selected, we still persist on-chain as USDC (usePYUSD=false),
      // and manage off-ramp details separately via Fern. The contract remains unchanged.
      const onChainUsePYUSD = useUSD ? false : usePYUSD;
      await Noah.buildArk(noahAddress, beneficiary, durationSec, tokens, useDutchAuction, onChainUsePYUSD);
      setStatus("Ark built");
      await fetchArk();
    } catch (e) {
      setStatus(e?.reason || e?.message || "Build failed");
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
                  <h1 className="display-4 mb-4">Noah App</h1>
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
                        <div className="mb-2">
                          <label className="form-label">Beneficiary</label>
                          <input className="form-control" value={beneficiary} onChange={e=>setBeneficiary(e.target.value)} placeholder="0x..." />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Deadline (days)</label>
                          <input type="number" min="1" className="form-control" value={deadlineDays} onChange={e=>setDeadlineDays(e.target.value)} />
                        </div>
                        {/* Manual token input removed; selection will come from Covalent list */}
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
                              {ownedTokens.map((t) => (
                                <label key={t.address} className="list-group-item d-flex align-items-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    checked={selectedTokenAddresses.includes(t.address)}
                                    onChange={() => toggleSelectToken(t.address)}
                                  />
                                  <span className="me-2">{t.symbol || t.name || 'Token'}</span>
                                  <small className="text-muted">{t.address}</small>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        {(!ownedTokens || ownedTokens.length === 0) && (
                          <div className="mb-3">
                            <small className="text-muted">No tokens detected yet. Click "Load Owned Tokens" above to fetch balances.</small>
                          </div>
                        )}
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
                              Flow follows Fern first-party offramps: create customer, create external bank payment account, then quoting/transactions.
                            </small>
                          </div>
                        )}
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
                        <button className="btn btn-primary" disabled={!noahAddress || !isConnected} onClick={handleBuildArk}>Build Ark</button>
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
                        <div className="mb-2">
                          <label className="form-label">Tokens CSV</label>
                          <input className="form-control" value={tokensCsv} onChange={e=>setTokensCsv(e.target.value)} placeholder="For add/remove" />
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <button className="btn btn-outline-secondary" onClick={pingArk} disabled={!noahAddress || !isConnected}>Ping</button>
                          <button className="btn btn-outline-secondary" onClick={updateDeadline} disabled={!noahAddress || !isConnected}>Update Deadline</button>
                          <button className="btn btn-outline-secondary" onClick={addPassengers} disabled={!noahAddress || !isConnected}>Add Passengers</button>
                          <button className="btn btn-outline-secondary" onClick={removePassenger} disabled={!noahAddress || !isConnected}>Remove Passenger</button>
                          <button className="btn btn-outline-secondary" onClick={toggleAuctionPref} disabled={!noahAddress || !isConnected}>Toggle Auction Pref</button>
                          <button className="btn btn-outline-secondary" onClick={toggleCurrencyPref} disabled={!noahAddress || !isConnected}>Toggle Currency Pref</button>
                          <button className="btn btn-danger" onClick={triggerFlood} disabled={!noahAddress || !account}>Trigger Flood</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {status && <div className="alert alert-info">{status}</div>}
                    {ark && (
                      <div className="card mb-4">
                        <div className="card-body">
                          <h5 className="card-title">Ark</h5>
                          <div>Beneficiary: {ark.beneficiary}</div>
                          <div>Deadline: {ark.deadline}</div>
                          <div>Duration: {ark.deadlineDuration}s</div>
                          <div>Tokens: {ark.tokens?.join(", ")}</div>
                          <div>Use Dutch Auction: {String(ark.useDutchAuction)}</div>
                          <div>Use PYUSD: {String(ark.usePYUSD)}</div>
                        </div>
                      </div>
                    )}
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

