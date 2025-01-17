"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

const Walletconnect = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey) {
        const info = await connection.getAccountInfo(publicKey);
        setBalance(info?.lamports ? info.lamports / LAMPORTS_PER_SOL : 0);
      } else {
        setBalance(null);
      }
    };

    getInfo();
  }, [connection, publicKey]);

  return (
    <main className="min-h-screen bg-[#121212] text-gray-300">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        <div className="col-span-1 lg:col-start-2 lg:col-end-4 rounded-xl bg-[#1e1e1e] shadow-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-white">
              Account Info
            </h2>
            <WalletMultiButton className="!bg-blue-600 !text-white !rounded-lg hover:!bg-blue-500 transition-transform duration-200 transform hover:scale-105" />
          </div>

          <div className="mt-6 bg-[#252525] border border-gray-700 rounded-lg p-4 shadow-md">
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <p className="text-lg tracking-wide">Wallet is connected...</p>
                <p
                  className={`italic font-semibold ${
                    publicKey ? "text-green-400" : "text-red-500"
                  }`}
                >
                  {publicKey ? "Yes" : "No"}
                </p>
              </li>

              <li className="flex justify-between items-center">
                <p className="text-lg tracking-wide">Balance:</p>
                <p className="text-helius-orange italic font-semibold text-yellow-400">
                  {balance !== null ? `${balance.toFixed(2)} SOL` : "0.00 SOL"}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Walletconnect;
