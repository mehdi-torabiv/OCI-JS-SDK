import { JsonRpcProvider, type Signer, Wallet } from "ethers";

export class EthersUtilsService {
	public getProvider(rpcURL: string) {
		return new JsonRpcProvider(rpcURL);
	}

	public getSigner(rpcURL: string, privateKey: string): Signer {
		return new Wallet(privateKey, this.getProvider(rpcURL));
	}
}
