import { toast } from "react-toastify";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const SendWallet = () => {
  const [txSig, setTxSig] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const getInfo = async () => {
    if (connection && publicKey) {
      const info = await connection.getAccountInfo(publicKey);
      setBalance(info?.lamports ? info.lamports / web3.LAMPORTS_PER_SOL : 0);
      console.log(balance);
      console.log(info?.lamports ? info.lamports / web3.LAMPORTS_PER_SOL : 0);
    } else {
      setBalance(null);
    }
  };

  useEffect(() => {
    getInfo();
  }, [connection, publicKey]);

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  const sendSol = async (event: any) => {
    event.preventDefault();

    if (!publicKey) {
      console.error("Wallet not connected");
      toast.error("Wallet not connected");
      return;
    }

    try {
      const recipientPubKey = new web3.PublicKey(
        event.currentTarget.recipient.value
      );

      const transaction = new web3.Transaction();
      const sendSolInstruction = web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubKey,
        lamports: 0.1 * web3.LAMPORTS_PER_SOL,
      });

      transaction.add(sendSolInstruction);

      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);
      await getInfo();
      toast.success("Transaction successful");
    } catch (error) {
      console.error("Transaction failed", error);
      toast.error("Transaction failed");
    }
  };

  return (
    <>
      {publicKey && (
        <div className="w-full h-full flex justify-center items-center bg-[#121212]">
          <div className="bg-[#1e1e1e] text-gray-300 p-6 rounded-xl shadow-lg border border-gray-700 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-semibold text-white ">
                Wallet Transaction
              </h1>
              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  onClick={toggleTooltip}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                  aria-label="Information"
                >
                  ℹ️
                </button>
                {showTooltip && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginTop: "8px",
                      padding: "8px 12px",
                      backgroundColor: "rgba(0, 0, 0, 0.75)",
                      color: "#fff",
                      borderRadius: "4px",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      zIndex: 1000,
                    }}
                  >
                    {`If you don't know a recipient's public key, you can use this one
                7zMGX8abib3pdiDqJjUBg64NCrWkj4KXmEwKPPNFNaKg`}
                  </div>
                )}
              </div>
            </div>

            <p className="text-lg mb-6">
              <span className="font-semibold text-gray-400">
                Connected Wallet:
              </span>{" "}
              <span
                className={`${
                  publicKey ? "text-green-400" : "text-red-500"
                } font-mono break-words`}
              >
                {publicKey ? publicKey.toBase58() : "Not connected"}
              </span>
            </p>
            <p className="text-lg mb-6">
              <span className="font-semibold text-gray-400">Balance:</span>{" "}
              <span
                className={`${balance ? "text-green-400 " : "text-gray-400 "}`}
              >
                {balance || 0} SOL
              </span>
            </p>

            <form onSubmit={sendSol} className="space-y-4">
              <div>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-[#121212] border border-gray-600 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#512da8]"
                  name="recipient"
                  placeholder="Recipient Public Key"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#512da8] hover:bg-[#422488] text-white font-semibold py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-700"
              >
                Send 0.1 SOL
              </button>
            </form>
            <div className="text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
              <ul className="p-2">
                <li className={`flex justify-between items-center`}>
                  <p className="tracking-wider w-[13rem]">
                    Transaction Signature:
                  </p>
                  {txSig && (
                    <a
                      href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex text-[#80ebff] truncate italic ${
                        txSig && "hover:text-white"
                      } transition-all duration-200`}
                    >
                      {txSig.toString()}
                    </a>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SendWallet;
