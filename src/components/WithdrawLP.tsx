import { ChangeEvent, useState } from "react";
import { TokenData } from "../interfaces/data/token-data.interface";
import { TokenIcon } from "./TokenIcon";
import { UniswapV2Router02__factory } from "../typechain";
import { provider } from "../utils/provider";
import { ROUTER02 } from "../config/address";
import { useWalletClient } from "wagmi";
import { formatUnits } from "ethers";

export default function WithdrawLP({
  selectedLP,
}: {
  selectedLP: { pair: TokenData[]; balance: bigint } | undefined;
    }) {
    const { data: client } = useWalletClient();
    const [percent, setPercent] = useState<number>(0);
    const [balanceA, setBalanceA] = useState<bigint>(0n);
    const [balanceB, setBalanceB] = useState<bigint>(0n);
    const handleWithdraw = async (e: ChangeEvent<HTMLInputElement>) => {
        setPercent(Number(e.target.value));
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
          onChange={handleWithdraw}
        />
        <span className="text-sm text-gray-500 dark:text-gray-300">100%</span>
      </div>
      {selectedLP && (
        <div>
          <div>Expected to receive</div>
          <div className="flex flex-row">
            <TokenIcon token={selectedLP.pair[0]} size="md" />
            {formatUnits(balanceA, selectedLP.pair[0].decimals)} //TODO: 를
            가져오는 함수를 만들어야 함.
          </div>
          <div className="flex flex-row">
            <TokenIcon token={selectedLP.pair[1]} size="md" />
            {formatUnits(balanceA, selectedLP.pair[0].decimals)}//TODO:
            balance를 가져오는 함수를 만들어야 함.
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

