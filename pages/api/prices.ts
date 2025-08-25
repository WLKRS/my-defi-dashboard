import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Schema para validar a requisição de preços
const PriceRequestSchema = z.object({
  mints: z.string().transform(val => val.split(',')).refine(arr => arr.every(m => m.length > 0), { message: 'Mints cannot be empty' }),
});

// TODO: Implementar fallback off-chain (CoinGecko) e normalização
// TODO: Implementar debounce e verificação de frescor

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { mints } = PriceRequestSchema.parse(req.query);

    // Exemplo simplificado: buscar preços do Pyth (on-chain)
    // Em um ambiente real, você usaria um SDK Pyth ou faria chamadas RPC para um nó Solana
    // Para este MVP, vamos mockar alguns preços ou usar uma API pública simples

    const prices: { [key: string]: number } = {};
    for (const mint of mints) {
      // Simulação de busca de preço
      if (mint === 'So11111111111111111111111111111111111111112') { // SOL
        prices[mint] = Math.random() * (150 - 100) + 100; // Preço simulado entre 100 e 150
      } else if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapT8G4AV6Whfs5T') { // USDC
        prices[mint] = 1.00;
      } else {
        prices[mint] = Math.random() * 10; // Preço simulado para outros tokens
      }
    }

    // Definir cabeçalhos de segurança
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://quote-api.jup.ag;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

    return res.status(200).json({ prices, timestamp: Date.now() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid request parameters', errors: error.errors });
    }
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}


