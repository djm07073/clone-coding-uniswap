import { useState } from "react";
import { TokenData } from "../interfaces/data/token-data.interface";
import { TokenIcon } from "./TokenIcon";
import { ERC20__factory, Multicall2__factory, UniswapV2Factory__factory, UniswapV2Router02__factory} from "../typechain";
import { provider } from "../utils/provider";
import { FACTORY, MULTICALL, ROUTER02} from "../config/address";
import {  MaxUint256, formatUnits} from "ethers";
import { useWalletClient } from "wagmi";
import { JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers";
import { Signature } from "ethers";

const types = {
  Permit: [
    {
      name: "owner",
      type: "address",
    },
    {
      name: "spender",
      type: "address",
    },
    {
      name: "value",
      type: "uint256",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "deadline",
      type: "uint256",
    },
  ],
};
export default function WithdrawLP({
  selectedLP,
  withdrawDone,
  setWithdrawDone
}: {
    selectedLP: { pair: TokenData[]; balance: bigint } | undefined;
    withdrawDone: boolean;
    setWithdrawDone: React.Dispatch<React.SetStateAction<boolean>>;
    }) {
    const { data: client } = useWalletClient();
    const [percent, setPercent] = useState<number>(0);
    const [withdrawableA, setWithdrawableA] = useState<bigint>(0n);
    const [withdrawableB, setWithdrawableB] = useState<bigint>(0n);
    const [withdrawableLP, setWithdrawableLP] = useState<{ address: string, amount: bigint }>();
  const calcWithdraw = async (_percent:string) => {
        const factory = UniswapV2Factory__factory.connect(FACTORY, provider);
        const lpAmount = (selectedLP!.balance * BigInt(_percent)) / 100n;
        const pairAddress = await factory.getPair(selectedLP!.pair[0].address, selectedLP!.pair[1].address);
        const tokenItf = ERC20__factory.createInterface();
        const multicall = Multicall2__factory.connect(MULTICALL, provider);
        const [balanceA , balanceB, total] = await multicall.aggregate([
            {
                target: selectedLP!.pair[0].address,
                callData: tokenItf.encodeFunctionData("balanceOf", [pairAddress]),
            },
            {
                target: selectedLP!.pair[1].address,
                callData: tokenItf.encodeFunctionData("balanceOf", [pairAddress]),
            },
            {
                target: pairAddress,
                callData: tokenItf.encodeFunctionData("totalSupply"),
            },
        ]).then((res) => res[1]);
        const amountA = (BigInt(balanceA) * lpAmount  / BigInt(total));
        const amountB = (BigInt(balanceB) * lpAmount / BigInt(total));
        setWithdrawableA(amountA);
        setWithdrawableB(amountB);
        setWithdrawableLP({ address: pairAddress, amount: lpAmount });
    };
  const removeLiquidityWithPermit = async () => {
        
    if (!client || !withdrawableLP?.amount || !selectedLP) return;

    const signer =
      new JsonRpcSigner(
        new BrowserProvider(client.transport, {
          chainId: client.chain.id,
          name: client.chain.name,
          ensAddress: client.chain.contracts?.ensRegistry?.address,
        }),
        client.account.address
      );
    const lpToken = ERC20__factory.connect(withdrawableLP.address, signer);
    const domain = {
      name: await lpToken.name(),
      version: "1",
      chainId: client.chain.id,
      verifyingContract: withdrawableLP.address,
    };
    const value = {
      owner: client.account.address,
      spender: ROUTER02,
      value: withdrawableLP.amount,
      nonce: await lpToken.nonces(client.account.address),
      deadline: MaxUint256, 
    }
    const { s, r, v } = await signer.signTypedData(domain, types, value).then(Signature.from);
    const rotuer = UniswapV2Router02__factory.connect(ROUTER02, signer);
    await rotuer.removeLiquidityWithPermit(selectedLP.pair[0].address, selectedLP.pair[1].address, withdrawableLP.amount, 0, 0, client.account.address, value.deadline, false, v, r, s).then((tx) => tx.wait()).then(() => setWithdrawDone(true));
  }
  return (
    <div>
      <div className="flex flex-row">
        <button
          onClick={() => {
            setPercent(25);
            selectedLP && calcWithdraw("25");
          }}
        >
          25%
        </button>
        <button
          onClick={() => {
            setPercent(50);
            selectedLP && calcWithdraw("50");
          }}
        >
          50%
        </button>
        <button
          onClick={() => {
            setPercent(75);
            selectedLP && calcWithdraw("75");
          }}
        >
          75%
        </button>
        <button
          onClick={() => {
            setPercent(100);
            selectedLP && calcWithdraw("100");
          }}
        >
          100%
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500 dark:text-gray-300">0%</span>
        <input
          className="flex-grow h-1 bg-gray-300 dark:bg-gray-700 rounded"
          id="lpWithdraw"
          max="100"
          min="0"
          type="range"
          value={percent}
          onChange={(e) => {
            setPercent(Number(e.target.value));
            selectedLP && calcWithdraw(e.target.value);
          }}
        />
        <span className="text-sm text-gray-500 dark:text-gray-300">100%</span>
      </div>
      {selectedLP && (
        <div>
          <div>Expected to receive</div>
          <div className="flex flex-row">
            <TokenIcon token={selectedLP.pair[0]} size="md" />
            {formatUnits(withdrawableA, selectedLP.pair[0].decimals)}
          </div>
          <div className="flex flex-row">
            <TokenIcon token={selectedLP.pair[1]} size="md" />
            {formatUnits(withdrawableB, selectedLP.pair[1].decimals)}
          </div>
        </div>
      )}

      {!withdrawDone ? (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
          onClick={removeLiquidityWithPermit}
        >
          Withdraw
        </button>
      ) : (
        <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded">
          Done 🎉
        </div>
      )}
    </div>
  );
}

