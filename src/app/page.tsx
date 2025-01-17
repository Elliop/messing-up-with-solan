"use client";
import dynamic from "next/dynamic";

const Walletconnect = dynamic(() => import("../components/ConnectWallet"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Walletconnect />
    </>
  );
}
