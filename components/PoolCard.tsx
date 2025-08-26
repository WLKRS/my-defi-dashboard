import { PoolData } from '../utils/dex-apis-realtime';

interface PoolCardProps {
  pool: PoolData;
}

const PoolCard: React.FC<PoolCardProps> = ({ pool }) => {
  const getNativeUrl = () => {
    switch (pool.protocol.toLowerCase()) {
      case 'orca':
        return `https://www.orca.so/liquidity/pools/${pool.address || pool.id.replace('orca-', '')}`;
      case 'raydium':
        return `https://raydium.io/liquidity/add/?coin0=${pool.tokenA.mint}&coin1=${pool.tokenB.mint}`;
      case 'meteora':
        return `https://app.meteora.ag/pools`;
      default:
        return '#';
    }
  };

  const nativeUrl = getNativeUrl();

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white">
          {pool.tokenA.symbol}/{pool.tokenB.symbol}
        </h3>
        <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
          {pool.protocol}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-gray-300">
        <p>TVL: ${pool.tvl.toLocaleString()}</p>
        <p>Volume 24h: ${pool.volume24h.toLocaleString()}</p>
        <p>APR: {pool.apy.toFixed(2)}%</p>
        <p>Taxa: {pool.fee}%</p>
      </div>

      <div className="space-y-2">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
          Adicionar Liquidez
        </button>
        
        {nativeUrl && (
          <a
            href={nativeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            🔗 Ver no {pool.protocol}
          </a>
        )}
      </div>
    </div>
  );
};

export default PoolCard;