import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getJupiterQuote } from '../utils/jupiter';

// Lista de tokens populares na Solana
const POPULAR_TOKENS = [
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', name: 'Solana' },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin' },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', name: 'Tether USD' },
  { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', name: 'Raydium' },
  { symbol: 'SRM', mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', name: 'Serum' },
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
      const amountInLamports = Math.floor(parseFloat(amount) * Math.pow(10, 9)); // Assumindo 9 decimais
      const quoteResponse = await getJupiterQuote(fromToken.mint, toToken.mint, amountInLamports);
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
  };

  const executeSwap = async () => {
    if (!quote || !connected || !publicKey) {
      setError('Cotação não disponível ou carteira não conectada');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Aqui você implementaria a lógica para executar a transação
      // Por enquanto, apenas simulamos
      alert('Funcionalidade de swap em desenvolvimento. Esta é uma simulação.');
      setQuote(null);
      setAmount('');
    } catch (err) {
      console.error('Erro ao executar swap:', err);
      setError('Erro ao executar swap. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Swap de Tokens</h1>
        
        {!connected && (
          <div className="mb-4 p-4 bg-yellow-600 rounded-lg">
            <p className="text-sm">Conecte sua carteira para usar a funcionalidade de swap.</p>
          </div>
        )}

        {/* Token de origem */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">De:</label>
          <div className="flex space-x-2">
            <select
              value={fromToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setFromToken(token);
              }}
              className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantidade */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quantidade:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            step="0.000001"
            min="0"
          />
        </div>

        {/* Botão de troca */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleSwapTokens}
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Token de destino */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Para:</label>
          <div className="flex space-x-2">
            <select
              value={toToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setToToken(token);
              }}
              className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão de cotação */}
        <button
          onClick={handleGetQuote}
          disabled={loading || !connected}
          className="w-full mb-4 p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {loading ? 'Obtendo cotação...' : 'Obter Cotação'}
        </button>

        {/* Exibição da cotação */}
        {quote && (
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2">Cotação:</h3>
            <p className="text-sm">
              Você receberá aproximadamente: <span className="font-bold">{(parseInt(quote.outAmount) / Math.pow(10, 9)).toFixed(6)} {toToken.symbol}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Taxa de câmbio: 1 {fromToken.symbol} ≈ {((parseInt(quote.outAmount) / Math.pow(10, 9)) / parseFloat(amount)).toFixed(6)} {toToken.symbol}
            </p>
            
            <button
              onClick={executeSwap}
              disabled={loading}
              className="w-full mt-3 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? 'Executando...' : 'Executar Swap'}
            </button>
          </div>
        )}

        {/* Exibição de erro */}
        {error && (
          <div className="mb-4 p-4 bg-red-600 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Aviso */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-400">
            <strong>Aviso:</strong> Esta é uma versão MVP. Sempre revise as transações na sua carteira antes de confirmar. 
            As cotações são obtidas da Jupiter Exchange e podem variar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;

