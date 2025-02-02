/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  // @ts-expect-error
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useState } from "react";
import { toast } from "react-toastify";
import CreateAccount from "./CreateAccount";

const CreateMint = () => {
  const [mintTx, setMintTx] = useState<string>("");
  const [mintAddr, setMintAddr] = useState<PublicKey | undefined>(undefined);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const createMint = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      const tokenMint = Keypair.generate();
      // amount of SOL required for the account to not be deallocated
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const transaction = new Transaction().add(
        // creates a new account
        SystemProgram.createAccount({
          fromPubkey: publicKey!,
          newAccountPubkey: tokenMint.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        // initializes the new account as a Token Mint account
        createInitializeMintInstruction(
          tokenMint.publicKey,
          0,
          publicKey!,
          TOKEN_PROGRAM_ID
        )
      );

      // prompts the user to sign the transaction and submit it to the network
      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenMint],
      });
      setMintTx(signature);
      setMintAddr(tokenMint.publicKey);
    } catch (err) {
      toast.error("Error creating Token Mint");
      console.log("error", err);
    }
  };

  const createMintOutputs = [
    {
      title: "Token Mint Address...",
      dependency: mintAddr!,
      href: `https://explorer.solana.com/address/${mintAddr}?cluster=devnet`,
    },
    {
      title: "Transaction Signature...",
      dependency: mintTx,
      href: `https://explorer.solana.com/tx/${mintTx}?cluster=devnet`,
    },
  ];

  return (
    <main className="w-full h-full flex justify-center items-center bg-[#121212] mt-6">
      <div className="rounded-xl bg-[#1e1e1e] p-6 sm:col-span-6 lg:col-start-2 lg:col-end-6 shadow-lg border border-gray-700 max-w-4xl w-full">
        <form onSubmit={(event) => createMint(event)} className="">
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Create Mint
            </h2>
            <button
              type="submit"
              className="px-5 text-white bg-[#512da8] hover:bg-[#422488] font-semibold py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-700"
            >
              Submit
            </button>
          </div>

          <div className="text-sm font-semibold mt-6 bg-[#252525] border border-gray-700 rounded-lg p-4 shadow-md">
            <ul className="space-y-4">
              {createMintOutputs.map(({ title, dependency, href }) => (
                <li key={title} className="flex justify-between items-center">
                  <p className="tracking-wide">{title}</p>
                  {dependency && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#80ebff] italic hover:text-white transition-all duration-200"
                    >
                      {dependency.toString().slice(0, 25)}...
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </form>
        {mintAddr && <CreateAccount mintAddr={mintAddr} />}
      </div>
    </main>
  );
};

export default CreateMint;
