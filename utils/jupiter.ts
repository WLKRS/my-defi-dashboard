import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { z } from 'zod';

// Schema para validar a resposta da API de cotação da Jupiter
export const JupiterQuoteSchema = z.object({
  inputMint: z.string(),
  inAmount: z.string(),
  outputMint: z.string(),
  outAmount: z.string(),
  slippageBps: z.number(),
  priceImpactPct: z.number(),
  swapMode: z.string(),
  // Adicione outras propriedades relevantes da cotação da Jupiter
  // https://jup.ag/api/docs/static/index.html#/quote-api/getQuote
});

// Schema para validar a resposta da API de transação da Jupiter
export const JupiterSwapTransactionSchema = z.object({
  swapTransaction: z.string(), // Base64 encoded transaction
  // Adicione outras propriedades relevantes da transação da Jupiter
});

/**
 * Obtém uma cotação de swap da API da Jupiter.
 * @param inputMint Endereço do mint do token de entrada.
 * @param outputMint Endereço do mint do token de saída.
 * @param amount Quantidade do token de entrada (em unidades atômicas).
 * @returns Uma cotação validada pela JupiterQuoteSchema.
 */
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<z.infer<typeof JupiterQuoteSchema>> {
  const url = new URL('https://quote-api.jup.ag/v6/quote');
  url.searchParams.set('inputMint', inputMint);
  url.searchParams.set('outputMint', outputMint);
  url.searchParams.set('amount', String(amount));
  url.searchParams.set('slippageBps', '50'); // Exemplo: 0.5% slippage
  url.searchParams.set('onlyDirectRoutes', 'false');

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);

  try {
    const res = await fetch(url.toString(), { signal: ctrl.signal });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Quote failed: ${res.status} - ${errorData.message || res.statusText}`);
    }
    const data = await res.json();
    return JupiterQuoteSchema.parse(data); // Valida com Zod
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Constrói uma transação de swap usando a API da Jupiter.
 * @param quote A cotação obtida de getJupiterQuote.
 * @param userPublicKey A chave pública do usuário.
 * @returns Uma transação Solana pronta para ser assinada.
 */
export async function buildJupiterSwapTransaction(
  quote: z.infer<typeof JupiterQuoteSchema>,
  userPublicKey: PublicKey
): Promise<VersionedTransaction> {
  const url = 'https://quote-api.jup.ag/v6/swap';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: userPublicKey.toBase58(),
      wrapUnwrapSOL: true, // Permite que a Jupiter lide com wSOL
      // dynamicComputeUnitLimit: true, // Opcional: ajusta o limite de CU dinamicamente
      // prioritizeFee: true, // Opcional: prioriza a taxa para execução mais rápida
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to build swap transaction: ${response.status} - ${errorData.message || response.statusText}`);
  }

  const { swapTransaction } = JupiterSwapTransactionSchema.parse(await response.json());

  // Desserializa a transação da string base64
  const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  return transaction;
}

/**
 * Envia e confirma uma transação na rede Solana.
 * @param transaction A transação a ser enviada.
 * @param wallet O objeto wallet do @solana/wallet-adapter-react.
 * @param connection A conexão com a rede Solana.
 * @returns A assinatura da transação.
 */
export async function sendAndConfirmTransaction(
  transaction: VersionedTransaction,
  wallet: WalletContextState,
  connection: Connection
): Promise<string> {
  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support signing transactions');
  }

  // Assina a transação
  const signedTransaction = await wallet.signTransaction(transaction);

  // Envia a transação
  const rawTransaction = signedTransaction.serialize();
  const signature = await connection.sendRawTransaction(rawTransaction, { skipPreflight: false });

  // Confirma a transação
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature,
  });

  return signature;
}

// TODO: Adicionar funções para Orca, Raydium, Meteora (listar pools, criar/gerenciar/fechar posição)
// TODO: Adicionar funções para Pyth/Switchboard (preços on-chain)


