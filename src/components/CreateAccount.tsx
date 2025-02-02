/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ACCOUNT_SIZE,
  createInitializeAccountInstruction,
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

const CreateAccount = ({ mintAddr }: { mintAddr: PublicKey }) => {
  const [accTx, setAccTx] = useState<string>("");
  const [accAddr, setAccAddr] = useState<PublicKey | undefined>(undefined);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // create transaction to create a token account fo the mint created on the blockchain
  const createAccount = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      // Token Accounts are accounts which hold tokens of a given mint.
      const tokenAccount = Keypair.generate();
      const space = ACCOUNT_SIZE;
      const lamports = await connection.getMinimumBalanceForRentExemption(
        space
      );
      const programId = TOKEN_PROGRAM_ID;

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey!,
          newAccountPubkey: tokenAccount.publicKey,
          space,
          lamports,
          programId,
        }),
        createInitializeAccountInstruction(
          tokenAccount.publicKey,
          mintAddr!,
          publicKey!, // owner of new account
          TOKEN_PROGRAM_ID // spl token program account
        )
      );

      // prompts the user to sign the transaction and submit it to the network
      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenAccount],
      });
      setAccTx(signature);
      setAccAddr(tokenAccount.publicKey);
    } catch (err) {
      toast.error("Error creating Token Account");
      console.log("error", err);
    }
  };

  const createAccountOutputs = [
    {
      title: "Token Account Address...",
      dependency: accAddr!,
      href: `https://explorer.solana.com/address/${accAddr}?cluster=devnet`,
    },
    {
      title: "Transaction Signature...",
      dependency: accTx,
      href: `https://explorer.solana.com/tx/${accTx}?cluster=devnet`,
    },
  ];

  return (
    <form onSubmit={(event) => createAccount(event)} className="mt-8">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          Create Account
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
          {createAccountOutputs.map(({ title, dependency, href }) => (
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
  );
};

export default CreateAccount;
