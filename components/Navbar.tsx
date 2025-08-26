import Link from 'next/link';
import React from 'react';
import WalletConnect from './WalletConnect';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <p className="text-white text-2xl font-bold cursor-pointer">DeFi Dashboard</p>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/pools">
            <p className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">Pools</p>
          </Link>
          <Link href="/positions">
            <p className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">Posições</p>
          </Link>
          <Link href="/swap">
            <p className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer">Swap</p>
          </Link>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


