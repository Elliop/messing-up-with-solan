"use client";
import dynamic from "next/dynamic";

const Walletconnect = dynamic(() => import("../components/WalletConnect"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Walletconnect />
    </>
  );
}
