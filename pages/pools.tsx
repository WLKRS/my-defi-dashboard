import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAllPoolsRealTime, PoolData } from '../utils/dex-apis-realtime';

const PoolsPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  
  const [allPools, setAllPools] = useState<PoolData[]>([]);
  const [safePools, setSafePools] = useState<PoolData[]>([]);
  const [filteredPools, setFilteredPools] = useState<PoolData[]>([]);
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
      console.log('Carregando pools em tempo real...');
      const poolsData = await getAllPoolsRealTime();
      
      const safeTokens = ['SOL', 'USDC', 'USDT', 'ETH', 'BTC'];
      const safePoolsFiltered = poolsData.filter(pool => 
        safeTokens.includes(pool.tokenA.symbol) && 
        safeTokens.includes(pool.tokenB.symbol)
      ).slice(0, 5);

      setAllPools(poolsData);
      setSafePools(safePoolsFiltered);
      setFilteredPools(poolsData);
      setLastUpdated(new Date());
      console.log('Pools carregadas:', poolsData.length);
      console.log('Pools seguras:', safePoolsFiltered.length);
      
    } catch (err) {
      console.error('Erro ao carregar pools:', err);
      setError('Erro ao carregar dados das pools. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleProtocolFilter = (protocol: string) => {
    setSelectedProtocol(protocol);
    if (protocol === 'Todos') {
      setFilteredPools(allPools);
    } else {
      setFilteredPools(allPools.filter(pool => pool.protocol === protocol));
    }
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    const sorted = [...filteredPools].sort((a, b) => {
      switch (sortType) {
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
    setFilteredPools(sorted);
  };

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
    if (pool.nativeUrl) {
      window.open(pool.nativeUrl, '_blank', 'noopener,noreferrer');
    }
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Pools de Liquidez</h1>
        </div>
        <div className="p-6 bg-red-600 rounded-lg">
          <p className="text-white">{error}</p>
          <button
            onClick={loadPools}
            className="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pools de Liquidez</h1>
            <p className="text-gray-400">
              Forneça liquidez para ganhar taxas de trading e recompensas de farming.
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={loadPools}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              🔄 Atualizar
            </button>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-2">
                Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {safePools.length > 0 && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-900 to-blue-900 border-2 border-green-400 rounded-xl">
            <h2 className="text-2xl font-bold text-green-300 mb-4">🛡️ Pools Seguras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safePools.map((pool) => (
                <div key={pool.id} className="bg-gray-800 rounded-lg p-4 border border-green-400">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">
                      {pool.tokenA.symbol}/{pool.tokenB.symbol}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs text-white ${getProtocolColor(pool.protocol)}`}>
                      {pool.protocol}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <p>TVL: ${pool.tvl.toLocaleString()}</p>
                    <p>APR: {pool.apy.toFixed(2)}%</p>
                    <p>Volume: ${pool.volume24h.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddLiquidity(pool)}
                      disabled={!connected}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      + Liquidez
                    </button>
                    
                    {pool.nativeUrl && (
                      <a
                        href={pool.nativeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 Ver no {pool.protocol}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-400">Total de pools:</span>
          <span className="font-semibold">{allPools.length}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">Protocolos:</span>
          <div className="flex space-x-2">
            {['Orca', 'Raydium', 'Meteora'].map(protocol => {
              const count = allPools.filter(p => p.protocol === protocol).length;
              return count > 0 ? (
                <span key={protocol} className={`px-2 py-1 rounded text-xs text-white ${getProtocolColor(protocol)}`}>
                  {protocol}: {count}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {!connected && (
        <div className="mb-6 p-4 bg-yellow-600 rounded-lg">
          <p className="text-sm">Conecte sua carteira para interagir com as pools de liquidez.</p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Protocolo:</label>
          <select
            value={selectedProtocol}
            onChange={(e) => handleProtocolFilter(e.target.value)}
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
            onChange={(e) => handleSort(e.target.value)}
            className="p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="apy">APY</option>
            <option value="tvl">TVL</option>
            <option value="volume">Volume 24h</option>
          </select>
        </div>

        <div className="text-sm text-gray-400">
          Mostrando {filteredPools.length} de {allPools.length} pools
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Nenhuma pool encontrada com os filtros selecionados.</p>
          </div>
        ) : (
          filteredPools.map((pool) => (
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
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs text-white ${getProtocolColor(pool.protocol)}`}>
                          {pool.protocol}
                        </span>
                        {pool.price && (
                          <span className="text-xs text-gray-400">
                            ${pool.price.toFixed(2)}
                          </span>
                        )}
                      </div>
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

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleAddLiquidity(pool)}
                      disabled={!connected}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Adicionar Liquidez
                    </button>
                    
                    {pool.nativeUrl && (
                      <a
                        href={pool.nativeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-center bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 Ver no {pool.protocol}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                <p className="text-sm">Protocolo: <span className={`font-semibold text-white px-2 py-1 rounded text-xs ${getProtocolColor(selectedPool.protocol)}`}>{selectedPool.protocol}</span></p>
                <p className="text-sm">TVL: <span className="font-semibold">{formatCurrency(selectedPool.tvl)}</span></p>
              </div>

              <button
                onClick={() => {
                  alert(`Funcionalidade de adicionar liquidez no ${selectedPool.protocol} em desenvolvimento. Esta é uma simulação.`);
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

      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong>Dados em tempo real:</strong> As informações são obtidas diretamente das APIs da Orca, Raydium e Meteora. 
          Os dados podem variar conforme a disponibilidade das APIs. 
          Sempre faça sua própria pesquisa antes de fornecer liquidez.
        </p>
      </div>
    </div>
  );
};

export default PoolsPage;
