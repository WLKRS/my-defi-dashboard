import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

/**
 * Obtém uma cotação de swap da API da Jupiter.
 * @param inputMint Endereço do mint do token de entrada.
 * @param outputMint Endereço do mint do token de saída.
 * @param amount Quantidade do token de entrada (em unidades atômicas).
 * @returns Uma cotação da Jupiter.
 */
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<any> {
  const url = new URL('https://quote-api.jup.ag/v6/quote');
  url.searchParams.set('inputMint', inputMint);
  url.searchParams.set('outputMint', outputMint);
  url.searchParams.set('amount', String(amount));
  url.searchParams.set('slippageBps', '50'); // 0.5% slippage
  url.searchParams.set('onlyDirectRoutes', 'false');

  console.log('Jupiter Quote URL:', url.toString());

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 10000);

  try {
    const res = await fetch(url.toString(), { 
      signal: ctrl.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Jupiter Response Status:', res.status);
    console.log('Jupiter Response Headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      let errorMsg = `Erro na API da Jupiter: ${res.status} - ${res.statusText}`;
      try {
        const errorText = await res.text();
        console.log('Jupiter Error Response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData && errorData.error) {
            errorMsg = `Erro na API da Jupiter: ${errorData.error}`;
          } else if (errorData && errorData.message) {
            errorMsg = `Erro na API da Jupiter: ${errorData.message}`;
          }
        } catch (jsonError) {
          errorMsg = `Erro na API da Jupiter: ${res.status} - ${errorText}`;
        }
      } catch (textError) {
        console.error('Erro ao ler resposta de erro:', textError);
      }
      throw new Error(errorMsg);
    }

    const responseText = await res.text();
    console.log('Jupiter Success Response (first 500 chars):', responseText.substring(0, 500));
    
    const data = JSON.parse(responseText);
    console.log('Jupiter Parsed Data Keys:', Object.keys(data));
    
    // Validação básica manual em vez de Zod
    if (!data.inputMint || !data.outputMint || !data.inAmount || !data.outAmount) {
      throw new Error('Resposta da Jupiter inválida: campos obrigatórios ausentes');
    }

    return data;
  } catch (error) {
    console.error('Erro completo na getJupiterQuote:', error);
    throw error;
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
  quote: any,
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
      wrapUnwrapSOL: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to build swap transaction: ${response.status} - ${errorData.message || response.statusText}`);
  }

  const { swapTransaction } = await response.json();

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
