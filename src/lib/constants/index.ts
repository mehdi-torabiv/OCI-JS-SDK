import { type Chain, optimismSepolia, sepolia } from "viem/chains";

export const attester: { [key: number]: string } = {
	11155111: "0x2d7B3e18D45846DA09D78e3644F15BD4aafa634d",
	11155420: "0x2d7B3e18D45846DA09D78e3644F15BD4aafa634d",
};

export const schemaId: { [key: number]: string } = {
	11155111:
		"0x85e90e3e16d319578888790af3284fea8bca549305071531e7478e3e0b5e7d6d",
	11155420:
		"0xa9b905fd9054be7c680f811167527d2c0b6511c6cce4eb713c855fdfaca920e8",
};

export const SCHEMA_TYPES: { [key: number]: string } = {
	11155111: "bytes32 key, string provider, string secret",
	11155420: "bytes32 key, string provider, string secret, metadata bytes32",
};

export const chainIdToGraphQLEndpoint: { [key: number]: string } = {
	11155111: "https://sepolia.easscan.org/graphql",
	11155420: "https://optimism-sepolia-bedrock.easscan.org/graphql",
	// 1: "https://easscan.org/graphql",
	// 42161: "https://arbitrum.easscan.org/graphql",
	// 42170: "https://arbitrum-nova.easscan.org/graphql",
	// 8453: "https://base.easscan.org/graphql",
	// 84531: "https://base-sepolia.easscan.org/graphql",
	// 10: "https://optimism.easscan.org/graphql",
	// 28528: "https://optimism-sepolia-bedrock.easscan.org/graphql",
	// 534353: "https://scroll.easscan.org/graphql",
	// 137: "https://polygon.easscan.org/graphql",
	// 59144: "https://linea.easscan.org/graphql",
	// 42220: "https://celo.easscan.org/graphql",
};

export const networkConfig: { [chainId: number]: Chain } = {
	11155111: sepolia,
	11155420: optimismSepolia,
};
