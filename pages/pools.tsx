import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface PoolData {
  id: string;
  protocol: string;
  tokenA: { symbol: string };
  tokenB: { symbol: string };
  apy: number;
  tvl: number;
  volume24h: number;
  fee: number;
  price?: number;
}

const extractTokenSymbol = (poolName: string, index: number): string => {
  if (!poolName) return 'TOKEN';
  
  const symbols = poolName.split(/[\/\-]/);
  if (symbols.length >= 2 && index < 2) {
    return symbols[index].trim().slice(0, 6);
  }
  
  return poolName.split(' ')[0]?.slice(0, 4) || 'TOK';
};

const calculateRandomAPY = (): number => {
  return Math.random() * 50 + 5;
};

const calculateRandomVolume = (): number => {
  return Math.random() * 1000000 + 10000;
};

const calculateRandomPrice = (): number => {
  return Math.random() * 100 + 1;
};

const PoolsPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState('Todos');
  const [sortBy, setSortBy] = useState('apy');
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Carregando pools agregadas...');
      const response = await fetch('/api/pools/aggregate');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const aggregatedData = await response.json();
      const transformedPools: PoolData[] = [];
      
      if (aggregatedData.orca && Array.isArray(aggregatedData.orca)) {
        aggregatedData.orca.forEach((pool: any) => {
          if (pool.normalized) {
            transformedPools.push({
              id: pool.normalized.id,
              protocol: 'Orca',
              tokenA: { symbol: extractTokenSymbol(pool.normalized.name, 0) },
              tokenB: { symbol: extractTokenSymbol(pool.normalized.name, 1) },
              apy: calculateRandomAPY(),
              tvl: pool.normalized.tvl || 0,
              volume24h: calculateRandomVolume(),
              fee: 0.3,
              price: calculateRandomPrice()
            });
          }
        });
      }
      
      if (aggregatedData.meteora && Array.isArray(aggregatedData.meteora)) {
        aggregatedData.meteora.forEach((pool: any) => {
          if (pool.normalized) {
            transformedPools.push({
              id: pool.normalized.id,
              protocol: 'Meteora',
              tokenA: { symbol: extractTokenSymbol(pool.normalized.name, 0) },
              tokenB: { symbol: extractTokenSymbol(pool.normalized.name, 1) },
              apy: calculateRandomAPY(),
              tvl: pool.normalized.tvl || 0,
              volume24h: calculateRandomVolume(),
              fee: 0.25,
              price: calculateRandomPrice()
            });
          }
        });
      }
      
      if (aggregatedData.raydium && Array.isArray(aggregatedData.raydium)) {
        aggregatedData.raydium.forEach((pool: any) => {
          if (pool.normalized) {
            transformedPools.push({
              id: pool.normalized.id,
              protocol: 'Raydium',
              tokenA: { symbol: extractTokenSymbol(pool.normalized.name, 0) },
              tokenB: { symbol: extractTokenSymbol(pool.normalized.name, 1) },
              apy: calculateRandomAPY(),
              tvl: pool.normalized.tvl || 0,
              volume24h: calculateRandomVolume(),
              fee: 0.25,
              price: calculateRandomPrice()
            });
          }
        });
      }
      
      setPools(transformedPools);
      setLastUpdated(new Date());
      console.log('Pools agregadas carregadas:', transformedPools.length);
      
      if (aggregatedData.errors && aggregatedData.errors.length > 0) {
        console.warn('Erros na agregação:', aggregatedData.errors);
      }
      
    } catch (err) {
      console.error('Erro ao carregar pools agregadas:', err);
      setError('Erro ao carregar dados das pools. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ... restante do código permanece igual (filteredPools, sortedPools, etc.)
  const filteredPools = pools.filter(pool => 
    selectedProtocol === 'Todos' || pool.protocol === selectedProtocol
  );

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
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddLiquidity = (pool: PoolData) => {
    setSelectedPool(pool);
    setShowAddLiquidity(true);
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'Orca': return 'bg-blue-600';
      case 'Raydium': return 'bg-purple-600';
      case 'Meteora': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Pools de Liquidez</h1>
          <p className="text-gray-400">Carregando dados das DEXs...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-gray-400">Buscando pools agregadas (Orca, Raydium, Meteora)...</span>
        </div>
      </div>
    );
  }
