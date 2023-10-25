import { ethers } from "ethers";
import { polygon } from "viem/chains";
import { apikey } from "../App";

export const signer = new ethers.AlchemyProvider(polygon, apikey).getSigner();
