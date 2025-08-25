import React, { useState } from 'react';
import { getJupiterQuote } from '../utils/jupiter'; // Assumindo que getJupiterQuote está em utils

const Swap: React.FC = () => {
  const [inputMint, setInputMint] = useState('');
  const [outputMint, setOutputMint] = useState('');
  const [amount, setAmount] = useState(0);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Adicionar validação de input com Zod
      const fetchedQuote = await getJupiterQuote(inputMint, outputMint, amount);
      setQuote(fetchedQuote);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Realizar Swap (Jupiter)</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="inputMint" className="block text-sm font-medium text-gray-300">Input Mint Address</label>
          <input
            type="text"
            id="inputMint"
            value={inputMint}
            onChange={(e) => setInputMint(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., So11111111111111111111111111111111111111112 (SOL)"
          />
        </div>
        <div>
          <label htmlFor="outputMint" className="block text-sm font-medium text-gray-300">Output Mint Address</label>
          <input
            type="text"
            id="outputMint"
            value={outputMint}
            onChange={(e) => setOutputMint(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., EPjFWdd5AufqSSqeM2qN1xzybapT8G4AV6Whfs5T (USDC)"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., 1"
          />
        </div>
        <button
          onClick={handleGetQuote}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Getting Quote...' : 'Get Swap Quote'}
        </button>

        {error && <p className="text-red-500 mt-4">Error: {error}</p>}

        {quote && (
          <div className="mt-6 p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-bold mb-2">Quote Details</h2>
            <p><strong>Input Amount:</strong> {quote.inAmount}</p>
            <p><strong>Output Amount:</strong> {quote.outAmount}</p>
            <p><strong>Slippage BPS:</strong> {quote.slippageBps}</p>
            <p><strong>Price Impact:</strong> {(quote.priceImpactPct * 100).toFixed(2)}%</p>
            {/* TODO: Adicionar botão para executar o swap após simulação e confirmação */}
            <button
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Execute Swap (Simulated)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Swap;


