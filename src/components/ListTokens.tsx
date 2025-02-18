/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { struct, u8 } from "@solana/buffer-layout";
// @ts-expect-error
import { u64, publicKey } from "@solana/buffer-layout-utils";

// Define the layout for a token account
const TokenAccountLayout = struct([
  publicKey("mint"), // Mint address
  publicKey("owner"), // Owner address
  u64("amount"), // Token balance
  u8("state"), // Account state
]);

type Token = {
  address: string;
  mint: string;
  balance: string;
  owner: string;
};

const ListTokens = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);

  const listTokens = async () => {
    try {
      if (!publicKey) {
        toast.error("Wallet not connected");
        return;
      }

      const tokenAccounts = await connection.getTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      // Parse the token accounts
      const tokens = tokenAccounts.value.map((account) => {
        const accountInfo = account.account;
        const parsedAccountInfo = TokenAccountLayout.decode(
          accountInfo.data
        ) as {
          mint: Uint8Array;
          owner: Uint8Array;
          amount: bigint;
          state: number;
        };

        return {
          address: account.pubkey.toString(), // Token account address
          mint: new PublicKey(parsedAccountInfo.mint).toString(), // Mint address of the token
          balance: parsedAccountInfo.amount.toString(),
          owner: new PublicKey(parsedAccountInfo.owner).toString(),
        };
      });

      setTokens(tokens);
      toast.success("Tokens fetched successfully!");
    } catch (err) {
      toast.error("Error fetching token accounts");
      console.log("error", err);
    }
  };

  useEffect(() => {
    if (publicKey) {
      listTokens();
    }
  }, [publicKey]);

  return (
    <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg border border-gray-700 text-gray-300 max-w-4xl mx-auto mt-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-white mb-4">My Tokens:</h3>
          <button
            onClick={listTokens}
            className="px-5 text-white bg-[#512da8] hover:bg-[#422488] font-semibold py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-700"
          >
            Refresh Tokens
          </button>
        </div>
        <ul className="space-y-4">
          {tokens.map((token, index) => (
            <li
              key={index}
              className="bg-[#252525] p-4 rounded-lg border border-gray-600"
            >
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Mint:</span>
                <span className="text-[#80ebff]">{token.mint}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="font-semibold">Balance:</span>
                <span>{token.balance}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="font-semibold">Account Address:</span>
                <span className="text-[#80ebff]">{token.address}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListTokens;
