import { ethers } from "ethers";
import { polygon } from "viem/chains";


export const signer = await new ethers.AlchemyProvider(polygon, import.meta.env.VITE_ALCHEMY_KEY
).getSigner();
