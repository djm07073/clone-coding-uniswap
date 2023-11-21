import { useState } from "react";
import { TokenData } from "../interfaces/data/token-data.interface";
import { TokenIcon } from "./TokenIcon";

export default function WithdrawLP({ selectedLP }: { selectedLP: TokenData[] | undefined }) {
    const [percent, setPercent] = useState<number>(0);  
    //TODO: withdraw LP token UI 구현
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
            onChange={(e) => setPercent(Number(e.target.value))}
          />
          <span className="text-sm text-gray-500 dark:text-gray-300">100%</span>
        </div>
        {selectedLP && (
          <div>
            <div>Withdraw</div>
            <div className="flex flex-row">
              <TokenIcon token={selectedLP[0]} size="md" />
              balance
            </div>
            <div className="flex flex-row">
              <TokenIcon token={selectedLP[1]} size="md" />
              balance
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

