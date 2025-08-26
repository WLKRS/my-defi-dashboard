import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Dados mock de pools populares (em um cenário real, viriam de APIs das DEXs)
const MOCK_POOLS = [
  {
    id: 'orca-sol-usdc',
    protocol: 'Orca',
    tokenA: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
    tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    apy: 12.5,
    tvl: 45600000,
    volume24h: 2300000,
    fee: 0.3,
  },
  {
    id: 'raydium-sol-usdt',
    protocol: 'Raydium',
    tokenA: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
    tokenB: { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
    apy: 15.2,
    tvl: 32100000,
    volume24h: 1800000,
    fee: 0.25,
  },
  {
    id: 'orca-ray-usdc',
    protocol: 'Orca',
    tokenA: { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
    tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    apy: 18.7,
    tvl: 12800000,
    volume24h: 950000,
    fee: 0.3,
  },
  {
    id: 'meteora-sol-msolana',
    protocol: 'Meteora',
    tokenA: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
    tokenB: { symbol: 'mSOL', mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So' },
    apy: 8.9,
    tvl: 28900000,
    volume24h: 1200000,
    fee: 0.1,
  },
  {
    id: 'raydium-usdc-usdt',
    protocol: 'Raydium',
    tokenA: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    tokenB: { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
    apy: 5.3,
    tvl: 67200000,
    volume24h: 3400000,
    fee: 0.05,
  },
];

const PoolsPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  
  const [pools, setPools] = useState(MOCK_POOLS);
  const [selectedProtocol, setSelectedProtocol] = useState('Todos');
  const [sortBy, setSortBy] = useState('apy');
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);

  // Filtrar pools por protocolo
  const filteredPools = pools.filter(pool => 
    selectedProtocol === 'Todos' || pool.protocol === selectedProtocol
  );

  // Ordenar pools
  const sortedPools = [...filteredPools].sort((a, b) => {
    switch (sortBy) {
      case 'apy':
        return b.apy - a.apy;
      case 'tvl':
        return b.tvl - a.tvl;
      case 'volume':
        return b.volume24h - a.volume24h;
      default:
        return 0;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddLiquidity = (pool: any) => {
    setSelectedPool(pool);
    setShowAddLiquidity(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Pools de Liquidez</h1>
        <p className="text-gray-400">
          Forneça liquidez para ganhar taxas de trading e recompensas de farming.
        </p>
      </div>

      {!connected && (
        <div className="mb-6 p-4 bg-yellow-600 rounded-lg">
          <p className="text-sm">Conecte sua carteira para interagir com as pools de liquidez.</p>
        </div>
      )}

      {/* Filtros e Ordenação */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Protocolo:</label>
          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            className="p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="Todos">Todos</option>
            <option value="Orca">Orca</option>
            <option value="Raydium">Raydium</option>
            <option value="Meteora">Meteora</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="apy">APY</option>
            <option value="tvl">TVL</option>
            <option value="volume">Volume 24h</option>
          </select>
        </div>
      </div>

      {/* Lista de Pools */}
      <div className="grid gap-4">
        {sortedPools.map((pool) => (
          <div key={pool.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {pool.tokenA.symbol[0]}
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {pool.tokenB.symbol[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {pool.tokenA.symbol}/{pool.tokenB.symbol}
                    </h3>
                    <p className="text-sm text-gray-400">{pool.protocol}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-sm text-gray-400">APY</p>
                  <p className="font-bold text-green-400">{pool.apy.toFixed(1)}%</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">TVL</p>
                  <p className="font-semibold">{formatCurrency(pool.tvl)}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">Volume 24h</p>
                  <p className="font-semibold">{formatCurrency(pool.volume24h)}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">Taxa</p>
                  <p className="font-semibold">{pool.fee}%</p>
                </div>

                <button
                  onClick={() => handleAddLiquidity(pool)}
                  disabled={!connected}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Adicionar Liquidez
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Adicionar Liquidez */}
      {showAddLiquidity && selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Adicionar Liquidez - {selectedPool.tokenA.symbol}/{selectedPool.tokenB.symbol}
              </h2>
              <button
                onClick={() => setShowAddLiquidity(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantidade de {selectedPool.tokenA.symbol}:
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantidade de {selectedPool.tokenB.symbol}:
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Informações da Pool:</p>
                <p className="text-sm">APY: <span className="text-green-400 font-semibold">{selectedPool.apy}%</span></p>
                <p className="text-sm">Taxa: <span className="font-semibold">{selectedPool.fee}%</span></p>
                <p className="text-sm">Protocolo: <span className="font-semibold">{selectedPool.protocol}</span></p>
              </div>

              <button
                onClick={() => {
                  alert('Funcionalidade de adicionar liquidez em desenvolvimento. Esta é uma simulação.');
                  setShowAddLiquidity(false);
                }}
                className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Adicionar Liquidez (Simulação)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aviso */}
      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong>Aviso:</strong> Esta é uma versão MVP com dados simulados. 
          Em produção, os dados seriam obtidos em tempo real das APIs das DEXs (Orca, Raydium, Meteora). 
          Sempre faça sua própria pesquisa antes de fornecer liquidez.
        </p>
      </div>
    </div>
  );
};

export default PoolsPage;
