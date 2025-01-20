"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Walletconnect = () => {
  return (
    <main className="bg-[#121212] text-gray-300 w-full flex justify-center items-center">
      <div className="py-8 max-w-4xl w-full">
        <div className="col-span-1 lg:col-start-2 lg:col-end-4 rounded-xl bg-[#1e1e1e] shadow-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl lg:text-3xl font-semibold text-white">
              Connecte your wallet
            </h2>
            <WalletMultiButton className="!bg-blue-600 !text-white !rounded-lg hover:!bg-blue-500 transition-transform duration-200 transform hover:scale-105" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Walletconnect;
