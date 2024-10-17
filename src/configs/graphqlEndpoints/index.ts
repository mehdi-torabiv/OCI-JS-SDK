const chainIdToGraphQLEndpoint: { [key: number]: string } = {
	1: "https://easscan.org/graphql",
	11155111: "https://sepolia.easscan.org/graphql",
	42161: "https://arbitrum.easscan.org/graphql",
	42170: "https://arbitrum-nova.easscan.org/graphql",
	8453: "https://base.easscan.org/graphql",
	84531: "https://base-sepolia.easscan.org/graphql",
	10: "https://optimism.easscan.org/graphql",
	28528: "https://optimism-sepolia-bedrock.easscan.org/graphql",
	534353: "https://scroll.easscan.org/graphql",
	137: "https://polygon.easscan.org/graphql",
	59144: "https://linea.easscan.org/graphql",
	42220: "https://celo.easscan.org/graphql",
};

export default chainIdToGraphQLEndpoint;
