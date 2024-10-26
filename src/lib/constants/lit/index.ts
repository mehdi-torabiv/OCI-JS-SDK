import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import type { AccsDefaultParams } from "@lit-protocol/types";

export const networks = {
	"datil-dev": {
		clientConfig: {
			alertWhenUnauthorized: false,
			litNetwork: LitNetwork.DatilDev,
			debug: true,
		},
		contractConfig: {
			network: LitNetwork.DatilDev,
			debug: true,
		},
		rpc: LIT_RPC.CHRONICLE_YELLOWSTONE,
	},
	"datil-test": {
		clientConfig: {
			alertWhenUnauthorized: false,
			litNetwork: LitNetwork.DatilTest,
			debug: true,
		},
		contractConfig: {
			network: LitNetwork.DatilTest,
			debug: true,
		},
		rpc: LIT_RPC.CHRONICLE_YELLOWSTONE,
	},
};

export const SUPPORTED_CHAINS = [11155111];

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number];
export type LitChain = AccsDefaultParams["chain"];
