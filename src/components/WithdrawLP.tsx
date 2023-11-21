import { useState } from "react";
import { TokenData } from "../interfaces/data/token-data.interface";
import { TokenIcon } from "./TokenIcon";
import { ERC20__factory, UniswapV2Factory__factory} from "../typechain";
import { provider } from "../utils/provider";
import { FACTORY,} from "../config/address";
import { formatUnits } from "ethers";

export default function WithdrawLP({
  selectedLP,
}: {
  selectedLP: { pair: TokenData[]; balance: bigint } | undefined;
    }) {
    const [percent, setPercent] = useState<number>(0);
    const [withdrawableA, setWithdrawableA] = useState<bigint>(0n);
    const [withdrawableB, setWithdrawableB] = useState<bigint>(0n);
    const calcWithdraw = async () => {
        const factory = UniswapV2Factory__factory.connect(FACTORY, provider);
        const lpAmount = (selectedLP!.balance * BigInt(percent)) / 100n;
        const pairAddress = await factory.getPair(selectedLP!.pair[0].address, selectedLP!.pair[1].address);
        const lpToken = ERC20__factory.connect(pairAddress, provider);
        const total = await lpToken.totalSupply();
        const balanceA = await ERC20__factory.connect(selectedLP!.pair[0].address, provider).balanceOf(pairAddress);
        const balanceB = await ERC20__factory.connect(selectedLP!.pair[1].address, provider).balanceOf(pairAddress);
        const amountA = (balanceA * lpAmount  / total);
        const amountB = (balanceB * lpAmount) / total;
        console.log(amountA, amountB)
        setWithdrawableA(amountA);
        setWithdrawableB(amountB);
    };
  return (
    <div>
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

