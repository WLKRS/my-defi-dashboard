import React from 'react';
import WalletConnect from '../components/WalletConnect';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        DeFi Dashboard Solana
      </h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Conecte sua carteira para começar a gerenciar suas posições DeFi.
      </p>
      
      <WalletConnect />
      
      {/* Botão para acessar pools */}
      <div className="mt-6">
        <Link href="/pools">
          <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
            🚀 Ver Pools de Liquidez
          </button>
        </Link>
      </div>

      <div className="mt-12 text-gray-500 text-sm text-center">
        <p>Este é um projeto MVP. Funcionalidades adicionais serão implementadas.</p>
        <p className="text-red-400 font-bold mt-2">
          Aviso: Este site é non-custodial. Suas chaves privadas nunca são acessadas. 
          Revise sempre as transações na sua carteira.
        </p>
      </div>
    </div>
  );
};

export default Home;
