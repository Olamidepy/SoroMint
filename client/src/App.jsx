import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Coins, Plus, List, ArrowRight, ShieldCheck } from 'lucide-react';
import { SkeletonList, SkeletonTokenForm } from './components/Skeleton';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [address, setAddress] = useState('');
  const [tokens, setTokens] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 7
  });
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder for Wallet Connection (Freighter/Albedo)
  const connectWallet = async () => {
    // In a real app, use @stellar/freighter-api
    const mockAddress = 'GB...' + Math.random().toString(36).substring(7).toUpperCase();
    setAddress(mockAddress);
    fetchTokens(mockAddress);
  };

  const fetchTokens = async (userAddress) => {
    try {
      setIsLoading(true);
      const resp = await axios.get(`${API_BASE}/tokens/${userAddress}`);
      setTokens(resp.data);
    } catch (err) {
      console.error('Error fetching tokens', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!address) return alert('Connect wallet first');
    
    setIsMinting(true);
    try {
      // Logic for Minting:
      // 1. Sign transaction on client (Freighter)
      // 2. Submit to Soroban RPC
      // 3. Save metadata to server
      const mockContractId = 'C' + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const resp = await axios.post(`${API_BASE}/tokens`, {
        ...formData,
        contractId: mockContractId,
        ownerPublicKey: address
      });

      setTokens([...tokens, resp.data]);
      setFormData({ name: '', symbol: '', decimals: 7 });
      alert('Token Minted Successfully!');
    } catch (err) {
      alert('Minting failed: ' + err.message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <div className="bg-stellar-blue p-2 rounded-xl">
            <Coins className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Soro<span className="text-stellar-blue">Mint</span></h1>
        </div>
        
        <button 
          onClick={connectWallet}
          className="flex items-center gap-2 btn-primary"
        >
          <Wallet size={18} />
          {address ? `${address.substring(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mint Form */}
        <section className="lg:col-span-1">
          <div className="glass-card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-stellar-blue" />
              Mint New Token
            </h2>
            {isLoading ? (
              <SkeletonTokenForm />
            ) : (
              <form onSubmit={handleMint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Token Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. My Stellar Asset"
                  className="w-full input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
                <input 
                  type="text" 
                  placeholder="e.g. MSA"
                  className="w-full input-field"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Decimals</label>
                <input 
                  type="number" 
                  className="w-full input-field"
                  value={formData.decimals}
                  onChange={(e) => setFormData({...formData, decimals: parseInt(e.target.value)})}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isMinting}
                className="w-full btn-primary mt-4 flex justify-center items-center gap-2"
              >
                {isMinting ? 'Deploying...' : 'Mint Token'}
                {!isMinting && <ArrowRight size={18} />}
              </button>
            </form>
            )}
          </div>
        </section>

        {/* Assets Table */}
        <section className="lg:col-span-2">
          <div className="glass-card min-h-[400px]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <List size={20} className="text-stellar-blue" />
              My Assets
            </h2>
            
            {!address ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <ShieldCheck size={48} className="mb-4 opacity-20" />
                <p>Connect your wallet to see your assets</p>
              </div>
            ) : isLoading ? (
              <div className="py-8">
                <SkeletonList count={5} />
              </div>
            ) : tokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <p>No tokens minted yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-sm">
                      <th className="pb-4 font-medium">Name</th>
                      <th className="pb-4 font-medium">Symbol</th>
                      <th className="pb-4 font-medium">Contract ID</th>
                      <th className="pb-4 font-medium">Decimals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tokens.map((token, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-medium">{token.name}</td>
                        <td className="py-4 text-slate-300">{token.symbol}</td>
                        <td className="py-4 font-mono text-sm text-stellar-blue truncate max-w-[120px]">
                          {token.contractId}
                        </td>
                        <td className="py-4 text-slate-400">{token.decimals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <footer className="mt-16 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2026 SoroMint Platform. Built on Soroban.</p>
      </footer>
    </div>
  );
}

export default App;
