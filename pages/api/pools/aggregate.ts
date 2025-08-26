import type { NextApiRequest, NextApiResponse } from 'next';

interface PoolData {
  id: string;
  name: string;
  tvl?: number;
  normalized?: {
    id: string;
    name: string;
    tvl?: number;
  };
}

interface ApiResponse {
  orca: PoolData[];
  meteora: PoolData[];
  raydium: PoolData[];
  solscan?: PoolData[];
  errors: string[];
  cached: boolean;
  timestamp: number;
}

const CACHE_TTL = 30000;
let cache: ApiResponse | null = null;
let cacheTimestamp = 0;

const SOLSCAN_KEY = process.env.SOLSCAN_KEY;

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'My-DeFi-Dashboard/1.0',
          ...options.headers,
        },
      });

      if (response.ok) return response;
      
      if (response.status === 429 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
        continue;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

function normalizeOrcaPool(pool: any): PoolData {
  return {
    id: pool.pubkey,
    name: pool.name,
    tvl: pool.tvl,
    normalized: {
      id: pool.pubkey,
      name: pool.name,
      tvl: pool.tvl
    }
  };
}

function normalizeMeteoraPool(pool: any): PoolData {
  return {
    id: pool.address,
    name: pool.name || `Meteora Pool ${pool.address.slice(0, 8)}`,
    tvl: pool.tvl,
    normalized: {
      id: pool.address,
      name: pool.name || `Meteora Pool ${pool.address.slice(0, 8)}`,
      tvl: pool.tvl
    }
  };
}

function normalizeRaydiumPool(pool: any): PoolData {
  return {
    id: pool.id || pool.pair_id,
    name: pool.name || pool.pair,
    tvl: pool.tvl,
    normalized: {
      id: pool.id || pool.pair_id,
      name: pool.name || pool.pair,
      tvl: pool.tvl
    }
  };
}

function normalizeSolscanPool(pool: any): PoolData {
  return {
    id: pool.pool_address,
    name: pool.pool_name || `Solscan Pool ${pool.pool_address.slice(0, 8)}`,
    tvl: pool.tvl,
    normalized: {
      id: pool.pool_address,
      name: pool.pool_name || `Solscan Pool ${pool.pool_address.slice(0, 8)}`,
      tvl: pool.tvl
    }
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string }>
) {
  try {
    // Check cache
    const now = Date.now();
    if (cache && now - cacheTimestamp < CACHE_TTL) {
      return res.status(200).json({ ...cache, cached: true });
    }

    const errors: string[] = [];
    const results: Partial<ApiResponse> = {
      orca: [],
      meteora: [],
      raydium: [],
      errors: [],
      cached: false,
      timestamp: now
    };

    // Fetch Orca pools
    try {
      const orcaResponse = await fetchWithRetry('https://api.orca.so/allPools');
      const orcaData = await orcaResponse.json();
      results.orca = orcaData.map(normalizeOrcaPool);
    } catch (error) {
      errors.push(`Orca: ${error.message}`);
    }

    // Fetch Meteora pools
    try {
      const meteoraResponse = await fetchWithRetry('https://dlmm-api.meteora.ag/pair/all');
      const meteoraData = await meteoraResponse.json();
      results.meteora = meteoraData.map(normalizeMeteoraPool);
    } catch (error) {
      errors.push(`Meteora: ${error.message}`);
    }

    // Fetch Raydium pools (try v3 first, then fallback to pairs)
    try {
      const raydiumResponse = await fetchWithRetry('https://api-v3.raydium.io/pools');
      const raydiumData = await raydiumResponse.json();
      results.raydium = raydiumData.data?.map(normalizeRaydiumPool) || [];
    } catch (error) {
      try {
        const raydiumFallback = await fetchWithRetry('https://api-v3.raydium.io/pairs');
        const raydiumData = await raydiumFallback.json();
        results.raydium = raydiumData.data?.map(normalizeRaydiumPool) || [];
      } catch (fallbackError) {
        errors.push(`Raydium: ${error.message}, Fallback: ${fallbackError.message}`);
      }
    }

    // Fetch Solscan Pro (optional)
    if (SOLSCAN_KEY) {
      try {
        const solscanResponse = await fetchWithRetry(
          'https://pro-api.solscan.io/v2.0/amm/pools?limit=100',
          {
            headers: {
              'token': SOLSCAN_KEY,
              'Accept': 'application/json'
            }
          }
        );
        const solscanData = await solscanResponse.json();
        results.solscan = solscanData.data?.map(normalizeSolscanPool) || [];
      } catch (error) {
        errors.push(`Solscan: ${error.message}`);
      }
    }

    results.errors = errors;

    // Update cache
    cache = results as ApiResponse;
    cacheTimestamp = now;

    res.status(200).json(results as ApiResponse);
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}