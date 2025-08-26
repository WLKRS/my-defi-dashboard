import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getJupiterQuote } from '../utils/jupiter';

// Lista de tokens populares na Solana com suas casas decimais corretas
const POPULAR_TOKENS = [
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', name: 'Solana', decimals: 9 },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', name: 'Tether USD', decimals: 6 },
  { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', name: 'Raydium', decimals: 6 },
  { symbol: 'SRM', mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', name: 'Serum', decimals: 6 },
];

const SwapPage: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  const [fromToken, setFromToken] = useState(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState(POPULAR_TOKENS[1]);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetQuote = async () => {
    if (!amount || !fromToken || !toToken) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!connected) {
      setError('Por favor, conecte sua carteira');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Converte o amount para unidades atômicas usando as casas decimais corretas do token
      const amountInAtomicUnits = Math.floor(parseFloat(amount) * Math.pow(10, fromToken.decimals));
      const quoteResponse = await getJupiterQuote(fromToken.mint, toToken.mint, amountInAtomicUnits);
      setQuote(quoteResponse);
    } catch (err) {
      console.error('Erro ao obter cotação:', err);
      setError('Erro ao obter cotação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setQuote(null);
    setError(null);
  };

  const handleExecuteSwap = () => {
    alert('Funcionalidade de execução de swap em desenvolvimento. Esta é uma simulação.');
  };

  // Função para converter unidades atômicas para decimais usando as casas decimais corretas
  const formatTokenAmount = (atomicAmount: string, token: any): string => {
    const amount = parseInt(atomicAmount) / Math.pow(10, token.decimals);
    return amount.toFixed(token.decimals === 9 ? 6 : 2); // SOL com 6 casas, outros com 2
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Swap de Tokens</h1>
        
        <div className="space-y-4">
          {/* Token De */}
          <div>
            <label className="block text-sm font-medium mb-2">De:</label>
            <select
              value={fromToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setFromToken(token);
                setQuote(null);
              }}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium mb-2">Quantidade:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setQuote(null);
              }}
              placeholder="0.00"
              step="0.000001"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Botão de Troca */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapTokens}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              ↕️
            </button>
          </div>

          {/* Token Para */}
          <div>
            <label className="block text-sm font-medium mb-2">Para:</label>
            <select
              value={toToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setToToken(token);
                setQuote(null);
              }}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botão Obter Cotação */}
          <button
            onClick={handleGetQuote}
            disabled={loading || !connected || !amount}
            className="w-full p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {loading ? 'Obtendo...' : 'Obter Cotação'}
          </button>

          {/* Exibir Erro */}
          {error && (
            <div className="p-3 bg-red-600 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Exibir Cotação */}
          {quote && (
            <div className="p-4 bg-gray-700 rounded-lg space-y-2">
              <h3 className="font-semibold">Cotação:</h3>
              <p className="text-sm">
                Você receberá aproximadamente: <span className="font-bold">{formatTokenAmount(quote.outAmount, toToken)} {toToken.symbol}</span>
              </p>
              <p className="text-sm text-gray-400">
                Taxa de câmbio: 1 {fromToken.symbol} = {(parseFloat(formatTokenAmount(quote.outAmount, toToken)) / parseFloat(amount)).toFixed(6)} {toToken.symbol}
              </p>
              {quote.priceImpactPct && (
                <p className="text-sm text-gray-400">
                  Impacto no preço: {(parseFloat(quote.priceImpactPct) * 100).toFixed(4)}%
                </p>
              )}
              
              <button
                onClick={handleExecuteSwap}
                className="w-full mt-4 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Executar Swap
              </button>
            </div>
          )}

          {/* Aviso */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-400">
              <strong>Aviso:</strong> Esta é uma versão MVP. Sempre revise as transações na sua carteira antes de confirmar. As cotações são obtidas da Jupiter Exchange e podem variar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
