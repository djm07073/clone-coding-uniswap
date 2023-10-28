import { useAccount, useNetwork } from "wagmi";
import { chainDataList } from "../data/chains";
import { TokenIcon } from "./TokenIcon";

export default function Portfolio() {
  const { address: user } = useAccount();
  const { chain: currentChain } = useNetwork();

  // TODO: TokenIcon listing
  return user ? <div></div> : <div> 지갑 연결해라 🤬</div>;
}
