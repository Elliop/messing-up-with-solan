"use client";
import SendWallet from "@/components/SendWallet";
import dynamic from "next/dynamic";

const Walletconnect = dynamic(() => import("../components/ConnectWallet"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] text-gray-300">
      <Walletconnect />
      <SendWallet />
    </div>
  );
}
