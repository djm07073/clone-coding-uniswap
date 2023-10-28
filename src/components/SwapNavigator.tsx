import { ROUTER02 } from "../config/address";
import { UniswapV2Router02__factory } from "../typechain";

export default function SwapNavigator() {
  //TODO: getAmountOut function
  const getAmountOut = async (path: `0x${string}`[], amountIn: bigint) => {
    const router = UniswapV2Router02__factory.connect(ROUTER02);
    const result: bigint[] = await router.getAmountsOut(amountIn, path);
    return result[result.length - 1];
  };
  return <div></div>;
}
