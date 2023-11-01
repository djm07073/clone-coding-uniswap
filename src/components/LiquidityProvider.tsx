import { useState } from "react";
import { TokenSelect } from "./TokenSelect";
import { TokenData } from "../interfaces/data/token-data.interface";

export default function LiquidityProvider() {
    const [amount0Value, setAmount0Value] = useState("");
    const [amount1Value, setAmount1Value] = useState("");
    const [token0, setToken0] = useState<TokenData>();
    const [token1, setToken1] = useState<TokenData>();
    const handleAmount0 = (e: React.ChangeEvent<HTMLInputElement>) => { 
        setAmount0Value(e.target.value);
        // TODO MISSION 6
    };
    const handleAmount1 = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount1Value(e.target.value);
      // TODO MISSION 6
    };
    const addLiquidity = () => {
      // TODO MISSION 6
    };
    
    return (
      <div>
        <div className="flex flex-row">
          <div className="w-1/2 pr-2">
            <TokenSelect
              setSelectedToken={setToken0}
              selectedToken={token0}
              blockSelectedToken={token1}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              onChange={handleAmount0}
              value={amount0Value}
            />
          </div>
          <div className="w-1/2 pl-2">
            <TokenSelect
              setSelectedToken={setToken1}
              selectedToken={token1}
              blockSelectedToken={token0}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              onChange={handleAmount1}
              value={amount1Value}
            />
          </div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-40 rounded"
          onClick={addLiquidity}
        >
          Add Liquidity
        </button>
      </div>
    );
}

