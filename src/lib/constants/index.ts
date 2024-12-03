import {
	type Chain,
	arbitrum,
	baseSepolia,
	optimismSepolia,
	sepolia,
} from "viem/chains";

export const attester: { [key: number]: string } = {
	11155111: "0x2d7B3e18D45846DA09D78e3644F15BD4aafa634d",
	11155420: "0xC2539c70dE7b24b9124e4E897083Ccc72e83c7c7",
	84532: "0xC2539c70dE7b24b9124e4E897083Ccc72e83c7c7",
	42161: "0xC2539c70dE7b24b9124e4E897083Ccc72e83c7c7",
};

export const schemaId: { [key: number]: string } = {
	11155111:
		"0x85e90e3e16d319578888790af3284fea8bca549305071531e7478e3e0b5e7d6d",
	11155420:
		"0x2c988095892ea57c600e5cc6fb62531502bc0c8d038ac39dc3fab161b6f122db",
	84532: "0xe8c59f8de4cdf61c8ebefa3ed83d714acc767dda3bbff00623e73f5a8bf5255f",
	42161: "0x6b5b50f2de8b387664838bd3c751e21f6b9aac7cf4bf5b2fb86e760b89a8a22d",
};

export const SCHEMA_TYPES =
	"bytes32 key, string provider, string secret, string metadata";

export const chainIdToGraphQLEndpoint: { [key: number]: string } = {
	11155111: "https://sepolia.easscan.org/graphql",
	11155420: "https://optimism-sepolia-bedrock.easscan.org/graphql",
	84532: "https://base-sepolia.easscan.org/graphql",
	42161: "https://arbitrum.easscan.org/graphql",
	// 1: "https://easscan.org/graphql",
	// 42170: "https://arbitrum-nova.easscan.org/graphql",
	// 8453: "https://base.easscan.org/graphql",
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
	84532: baseSepolia,
	42161: arbitrum,
};
