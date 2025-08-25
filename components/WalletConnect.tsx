import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

const WalletConnect: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const getBalance = async () => {
      if (connected && publicKey) {
        try {
          const lamports = await connection.getBalance(publicKey);
          setBalance(lamports / 10 ** 9); // Convert lamports to SOL
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        }
      }
    };
    getBalance();
  }, [connected, publicKey, connection]);

  return (
    <WalletModalProvider>
      <div className="flex flex-col items-center space-y-4">
        <WalletMultiButton />
        {connected && publicKey && (
          <div className="text-center">
            <p>Connected: {publicKey.toBase58()}</p>
            {balance !== null ? (
              <p>Balance: {balance.toFixed(4)} SOL</p>
            ) : (
              <p>Fetching balance...</p>
            )}
          </div>
        )}
      </div>
    </WalletModalProvider>
  );
};

export default WalletConnect;