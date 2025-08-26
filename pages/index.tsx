import { useState, useEffect } from 'react';
import Head from 'next/head';
import PoolCard from '../components/PoolCard';
import { aggregatePools, getSafePools } from '../utils/dex-apis-realtime';

export default function Home() {
  const [pools, setPools] = useState<any[]>([]);
  const [safePools, setSafePools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadPools = async () => {
      const { pools: aggregatedPools, errors: aggregationErrors } = await aggregatePools();
      setPools(aggregatedPools);
      setSafePools(getSafePools(aggregatedPools));
      setErrors(aggregationErrors);
      setIsLoading(false);
    };
    loadPools();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>My DeFi Dashboard</title>
      </Head>

      <h1 className="text-3xl font-bold text-center mb-8">My DeFi Dashboard</h1>

      {isLoading ? (
        <div className="text-center">Carregando pools...</div>
      ) : (
        <>
          {/* Seção Pools Seguras */}
          {safePools.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-xl">
              <h2 className="text-2xl font-bold text-green-800 mb-4">🛡️ Pools Seguras</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {safePools.map((pool) => (
                  <PoolCard key={pool.address} pool={pool} />
                ))}
              </div>
            </div>
          )}

          {/* Todas as Pools */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Todas as Pools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pools.map((pool) => (
                <PoolCard key={pool.address} pool={pool} />
              ))}
            </div>
          </div>
        </>
      )}

      {errors.length > 0 && (
        <div className="mt-8 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-bold text-red-800">Erros encontrados:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index} className="text-red-600">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
