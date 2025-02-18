/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ACCOUNT_SIZE,
  createInitializeAccountInstruction,
  createMintToInstruction,
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
  const [tokenCount, setTokenCount] = useState<number>(10);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(event.target.value)); // Ensure the value is at least 1
    setTokenCount(value);
  };

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

  // minting tokens to the token account created
  const mintTokens = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      // Create the mintTo instruction
      const mintToInstruction = createMintToInstruction(
        mintAddr!, // The mint address
        accAddr!, // The token account address to mint tokens to
        publicKey!, // The mint authority (the account that has permission to mint tokens)
        tokenCount, // The amount of tokens to mint
        [], // Additional signers (if any)
        TOKEN_PROGRAM_ID // The SPL Token program ID
      );

      // Create a new transaction and add the mintTo instruction
      const transaction = new Transaction().add(mintToInstruction);

      // Send the transaction
      const signature = await sendTransaction(transaction, connection, {
        signers: [], // No additional signers needed if the mint authority is the wallet owner
      });

      console.log("Mint Tokens Transaction Signature:", signature);
      toast.success("Tokens minted successfully!");
    } catch (err) {
      toast.error("Error minting tokens");
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
    <>
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
      {accAddr && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex justify-between items-center w-full space-x-4">
            <label
              htmlFor="tokenCount"
              className="text-lg sm:text-xl font-semibold text-white"
            >
              Mint Tokens:
            </label>
            <input
              id="tokenCount"
              type="number"
              className="bg-[#2a302f] flex-1 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#512da8]"
              placeholder="Number of tokens"
              min="1"
              value={tokenCount}
              onChange={handleInputChange}
            />
            <button
              onClick={mintTokens}
              className="px-5 text-white bg-[#512da8] hover:bg-[#422488] font-semibold py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-700"
            >
              Mint
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAccount;
