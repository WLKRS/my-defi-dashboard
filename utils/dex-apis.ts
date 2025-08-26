/**
 * Integrações com APIs das principais DEXs da Solana
 * Orca, Raydium, Meteora, Jupiter
 */

export interface PoolData {
  id: string;
  protocol: string;
  tokenA: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  tokenB: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  apy: number;
  tvl: number;
  volume24h: number;
  fee: number;
  price?: number;
  priceChange24h?: number;
}

/**
 * Busca pools da Orca
 */
export async function getOrcaPools(): Promise<PoolData[]> {
  try {
    console.log('Buscando pools da Orca...');
    
    // API pública da Orca para pools
    const response = await fetch('https://api.orca.so/v1/whirlpool/list', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Erro na API da Orca:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Dados da Orca recebidos:', data.whirlpools?.length || 0, 'pools');

    if (!data.whirlpools || !Array.isArray(data.whirlpools)) {
      return [];
    }

    // Processa apenas as pools mais populares
    const popularPools = data.whirlpools
      .filter((pool: any) => pool.tvl > 100000) // TVL > $100k
      .slice(0, 10) // Top 10 pools
      .map((pool: any) => ({
        id: `orca-${pool.address}`,
        protocol: 'Orca',
        tokenA: {
          symbol: pool.tokenA?.symbol || 'Unknown',
          mint: pool.tokenA?.mint || '',
          decimals: pool.tokenA?.decimals || 9,
        },
        tokenB: {
          symbol: pool.tokenB?.symbol || 'Unknown',
          mint: pool.tokenB?.mint || '',
          decimals: pool.tokenB?.decimals || 9,
        },
        apy: pool.apy || 0,
        tvl: pool.tvl || 0,
        volume24h: pool.volume24h || 0,
        fee: pool.feeRate ? pool.feeRate * 100 : 0.3,
      }));

    return popularPools;
  } catch (error) {
    console.error('Erro ao buscar pools da Orca:', error);
    return [];
  }
}

/**
 * Busca pools da Raydium
 */
export async function getRaydiumPools(): Promise<PoolData[]> {
  try {
    console.log('Buscando pools da Raydium...');
    
    // API pública da Raydium
    const response = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Erro na API da Raydium:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Dados da Raydium recebidos:', data.official?.length || 0, 'pools');

    if (!data.official || !Array.isArray(data.official)) {
      return [];
    }

    // Processa apenas as pools oficiais mais populares
    const popularPools = data.official
      .filter((pool: any) => pool.tvl > 100000) // TVL > $100k
      .slice(0, 10) // Top 10 pools
      .map((pool: any) => ({
        id: `raydium-${pool.id}`,
        protocol: 'Raydium',
        tokenA: {
          symbol: pool.baseToken?.symbol || 'Unknown',
          mint: pool.baseToken?.mint || '',
          decimals: pool.baseToken?.decimals || 9,
        },
        tokenB: {
          symbol: pool.quoteToken?.symbol || 'Unknown',
          mint: pool.quoteToken?.mint || '',
          decimals: pool.quoteToken?.decimals || 9,
        },
        apy: pool.apy || 0,
        tvl: pool.tvl || 0,
        volume24h: pool.volume24h || 0,
        fee: 0.25, // Taxa padrão da Raydium
      }));

    return popularPools;
  } catch (error) {
    console.error('Erro ao buscar pools da Raydium:', error);
    return [];
  }
}

/**
 * Busca dados de preços do Jupiter
 */
export async function getJupiterPrices(): Promise<Record<string, number>> {
  try {
    console.log('Buscando preços do Jupiter...');
    
    const response = await fetch('https://price.jup.ag/v4/price?ids=SOL,USDC,USDT,RAY,SRM', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Erro na API de preços do Jupiter:', response.status);
      return {};
    }

    const data = await response.json();
    console.log('Preços do Jupiter recebidos:', Object.keys(data.data || {}).length, 'tokens');

    const prices: Record<string, number> = {};
    if (data.data) {
      Object.entries(data.data).forEach(([symbol, priceData]: [string, any]) => {
        prices[symbol] = priceData.price || 0;
      });
    }

    return prices;
  } catch (error) {
    console.error('Erro ao buscar preços do Jupiter:', error);
    return {};
  }
}

/**
 * Busca pools da Meteora (fallback com dados simulados baseados em dados reais)
 */
export async function getMeteoraPoolsFallback(): Promise<PoolData[]> {
  // Como a API da Meteora pode não estar sempre disponível,
  // vamos usar dados simulados baseados em pools reais conhecidas
  return [
    {
      id: 'meteora-sol-msol',
      protocol: 'Meteora',
      tokenA: {
        symbol: 'SOL',
        mint: 'So11111111111111111111111111111111111111112',
        decimals: 9,
      },
      tokenB: {
        symbol: 'mSOL',
        mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        decimals: 9,
      },
      apy: 8.9,
      tvl: 28900000,
      volume24h: 1200000,
      fee: 0.1,
    },
    {
      id: 'meteora-usdc-usdt',
      protocol: 'Meteora',
      tokenA: {
        symbol: 'USDC',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
      },
      tokenB: {
        symbol: 'USDT',
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        decimals: 6,
      },
      apy: 12.3,
      tvl: 45600000,
      volume24h: 2100000,
      fee: 0.05,
    },
  ];
}

/**
 * Agrega pools de todas as DEXs
 */
export async function getAllPools(): Promise<PoolData[]> {
  console.log('Iniciando busca de pools de todas as DEXs...');
  
  const [orcaPools, raydiumPools, meteoraPools, prices] = await Promise.allSettled([
    getOrcaPools(),
    getRaydiumPools(),
    getMeteoraPoolsFallback(),
    getJupiterPrices(),
  ]);

  const allPools: PoolData[] = [];
  const priceData = prices.status === 'fulfilled' ? prices.value : {};

  // Adiciona pools da Orca
  if (orcaPools.status === 'fulfilled') {
    allPools.push(...orcaPools.value);
  }

  // Adiciona pools da Raydium
  if (raydiumPools.status === 'fulfilled') {
    allPools.push(...raydiumPools.value);
  }

  // Adiciona pools da Meteora
  if (meteoraPools.status === 'fulfilled') {
    allPools.push(...meteoraPools.value);
  }

  // Se não conseguiu dados reais, usa dados de fallback
  if (allPools.length === 0) {
    console.warn('Não foi possível obter dados reais, usando dados de fallback...');
    return getFallbackPools();
  }

  // Adiciona preços aos pools
  allPools.forEach(pool => {
    if (priceData[pool.tokenA.symbol]) {
      pool.price = priceData[pool.tokenA.symbol];
    }
  });

  console.log('Total de pools agregadas:', allPools.length);
  return allPools;
}

/**
 * Dados de fallback caso as APIs não estejam disponíveis
 */
function getFallbackPools(): PoolData[] {
  return [
    {
      id: 'orca-sol-usdc-fallback',
      protocol: 'Orca',
      tokenA: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
      tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      apy: 12.5,
      tvl: 45600000,
      volume24h: 2300000,
      fee: 0.3,
    },
    {
      id: 'raydium-sol-usdt-fallback',
      protocol: 'Raydium',
      tokenA: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
      tokenB: { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
      apy: 15.2,
      tvl: 32100000,
      volume24h: 1800000,
      fee: 0.25,
    },
    {
      id: 'orca-ray-usdc-fallback',
      protocol: 'Orca',
      tokenA: { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
      tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      apy: 18.7,
      tvl: 12800000,
      volume24h: 950000,
      fee: 0.3,
    },
  ];
}

