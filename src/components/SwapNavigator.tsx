import { ChangeEvent, useState } from "react";
import { ROUTER02 } from "../config/address";
import { UniswapV2Router02__factory } from "../typechain";
import { BsFillArrowDownCircleFill } from "react-icons/bs";
import { TokenSelect } from "./TokenSelect";
import { provider } from "../utils/provider";
import { TokenData } from "../interfaces/data/token-data.interface";
import { formatUnits, parseUnits } from "viem";
import { MaxUint256, ZeroAddress } from "ethers";
import { TokenDataList } from "../data/tokens";
import { signer } from "../utils/signer";
import { useAccount } from "wagmi";

export default function SwapNavigator() {
  const {address:user} = useAccount();
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [selectedInputToken, setSelectedInputToken] = useState<TokenData>();
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenData>();
  const [isInputNative, setIsInputNative] = useState<boolean>(false);

  const getAmountOut = async (
    path: `0x${string}`[],
    amountIn: bigint
  ): Promise<bigint> => {
    const router = UniswapV2Router02__factory.connect(ROUTER02, provider);
    const result: bigint[] = await router.getAmountsOut(amountIn, path);
    return result[result.length - 1];
  };
  const getAmountIn = async (
    path: `0x${string}`[],
    amountOut: bigint
  ): Promise<bigint> => {
    const router = UniswapV2Router02__factory.connect(ROUTER02, provider);
    
    const result: bigint[] = await router.getAmountsIn(amountOut, path);
    return result[0];
  };
  const handleSwap = async () => { 
    const router = UniswapV2Router02__factory.connect(ROUTER02, signer);
    if (isInputNative ) {
      user && await router.swapExactETHForTokens(
        (BigInt(outputValue) * 9n) / 10n, // 10% slippage
        [
          selectedInputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (selectedInputToken!.address as `0x${string}`),
          selectedOutputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (selectedOutputToken!.address as `0x${string}`),
        ],
        user,
        MaxUint256
      ).then((tx) => tx.wait());
    } 
    
  }
  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    selectedInputToken?.address && setInputValue(event.target.value);

    if (selectedOutputToken?.address && event.target.value !== "0") {
      if (Number(event.target.value) !== 0) {
        if (selectedInputToken!.address === ZeroAddress) setIsInputNative(true);
          const amountOut = await getAmountOut(
            [
              selectedInputToken!.address === ZeroAddress
                ? (TokenDataList[137][1].address as `0x${string}`)
                : (selectedInputToken!.address as `0x${string}`),
              selectedOutputToken!.address === ZeroAddress
                ? (TokenDataList[137][1].address as `0x${string}`)
                : (selectedOutputToken!.address as `0x${string}`),
            ],
            parseUnits(event.target.value, selectedInputToken!.decimals)
          );

        setOutputValue(formatUnits(amountOut, selectedOutputToken!.decimals));
      } else {
        setOutputValue("0");
      }
    }
  };
  const handleOutputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    selectedInputToken?.address && setOutputValue(event.target.value);
    if (selectedInputToken?.address) {
      if (Number(event.target.value) !== 0) {
        const amountIn = await getAmountIn(
          [
            selectedInputToken!.address as `0x${string}`,
            selectedOutputToken!.address as `0x${string}`,
          ],
          parseUnits(event.target.value, selectedOutputToken!.decimals)
        );
        setInputValue(formatUnits(amountIn, selectedInputToken!.decimals));
      } else {
        setInputValue("0");
      }
    }
  };
  const toggleTokens = async () => {
    const t1 = selectedInputToken;
    const t2 = inputValue;
    setSelectedInputToken(selectedOutputToken);
    setSelectedOutputToken(t1);
    setInputValue(outputValue);
    setOutputValue(t2);
  };
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex flex-row justify-center m-4">
        <input
          type="text"
          className="border border-gray-300 rounded-lg p-2"
          placeholder="0"
          value={inputValue}
          onChange={handleInputChange}
        />
        <TokenSelect
          setSelectedToken={setSelectedInputToken}
          selectedToken={selectedInputToken}
          blockSelectedToken={selectedOutputToken}
        />
      </div>

      <BsFillArrowDownCircleFill onClick={toggleTokens} />
      <div className="flex flex-row justify-center m-4">
        <input
          type="text"
          className="border border-gray-300 rounded-lg p-2"
          placeholder="0"
          value={outputValue}
          onChange={handleOutputChange}
        />
        <TokenSelect
          setSelectedToken={setSelectedOutputToken}
          selectedToken={selectedOutputToken}
          blockSelectedToken={selectedInputToken}
        />
      </div>

      <div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-36 rounded"
        onClick ={handleSwap}>
          Swap
        </button>
      </div>
    </div>
  );
}
