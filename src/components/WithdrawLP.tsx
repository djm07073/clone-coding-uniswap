import { useState } from "react";
import { TokenData } from "../interfaces/data/token-data.interface";
import { TokenIcon } from "./TokenIcon";
import { ERC20__factory, Multicall2__factory, UniswapV2Factory__factory} from "../typechain";
import { provider } from "../utils/provider";
import { FACTORY, MULTICALL,} from "../config/address";
import { formatUnits } from "ethers";

export default function WithdrawLP({
  selectedLP,
}: {
  selectedLP: { pair: TokenData[]; balance: bigint } | undefined;
    }) {
    const [percent, setPercent] = useState<number>(0);
    const [withdrawableA, setWithdrawableA] = useState<bigint>(0n);
    const [withdrawableB, setWithdrawableB] = useState<bigint>(0n);
    const [withdrawableLP, setWithdrawableLP] = useState<bigint>(0n);
    const calcWithdraw = async () => {
        const factory = UniswapV2Factory__factory.connect(FACTORY, provider);
        const lpAmount = (selectedLP!.balance * BigInt(percent)) / 100n;
        console.log(lpAmount)
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
        console.log(amountA, amountB)
        setWithdrawableA(amountA);
        setWithdrawableB(amountB);
        setWithdrawableLP(lpAmount);
    };
    
  return (
    <div>
      <div className="flex flex-row">
        <button onClick={() => {
            setPercent(25);
            calcWithdraw();
        }}>25%</button>
        <button onClick = {() => {
          setPercent(50);
          calcWithdraw();
        }}>50%</button>
        <button onClick = {() => {
          setPercent(75);
          calcWithdraw();
        }}>75%</button>
        <button onClick={() => {
            setPercent(100);
            calcWithdraw();
        }}>100%</button>
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
            selectedLP && calcWithdraw();
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

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
        //   onClick={withdraw}
      >
        Withdraw
      </button>
    </div>
  );
}

