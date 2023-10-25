import { ethers } from "ethers";
import { polygon } from "viem/chains";
import { apikey } from "../App";

export const provider = new ethers.AlchemyProvider(polygon, apikey);
