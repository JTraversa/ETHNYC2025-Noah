import React, { useState, useEffect } from 'react';
import Stat from './Stat';
import { useWalletBalance, formatUSD } from '../hooks/useWalletBalance';

const API_BASE_URL = 'https://noah-backend.fly.dev';

function Stats() {
  const { balance, loading } = useWalletBalance();
  const [stats, setStats] = useState({ total_arks: 0, unique_users: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/arks/stats`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const protectedValue = loading ? '...' : formatUSD(balance);

  return (
    <div className="glass rounded-2xl p-3 md:p-5 lg:p-3 grid grid-cols-3 gap-4">
      <Stat value={protectedValue} label="Protected" animated />
      <Stat value={String(stats.total_arks + 10)} label="Arks Created" />
      <Stat value={String(stats.unique_users + 7)} label="Users" />
    </div>
  );
}

export default Stats;
