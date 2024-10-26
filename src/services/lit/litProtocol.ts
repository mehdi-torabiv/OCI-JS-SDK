import {
	LitAbility,
	LitAccessControlConditionResource,
	createSiweMessage,
	generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LIT_CHAINS, type LitNetwork } from "@lit-protocol/constants";
import {
	LitNodeClientNodeJs,
	decryptFromJson,
} from "@lit-protocol/lit-node-client-nodejs";
import {
	SUPPORTED_CHAINS,
	type SupportedChainId,
	networks,
} from "../../lib/constants/lit";
import type { EthersUtilsService } from "../ethers";

export class LitProtocol {
	private litNodeClient: LitNodeClientNodeJs | null = null;
	private network: LitNetwork | undefined;

	constructor(private readonly ethersUtilsService: EthersUtilsService) {
		console.log("LitProtocol initialized");
	}

	/**
	 * Maps chainId to the appropriate LitNetwork
	 * @param chainId - The chainId to map to a LitNetwork
	 * @returns LitNetwork or undefined
	 */
	private chainIdToLitNetwork(chainId: SupportedChainId): LitNetwork {
		if (SUPPORTED_CHAINS.includes(chainId)) {
			const networkName = this.getNetworkName(chainId);
			return networks[networkName].clientConfig.litNetwork;
		}

		// Fallback to LIT_CHAINS lookup
		for (const [name, chain] of Object.entries(LIT_CHAINS)) {
			if (chain.chainId === chainId) {
				return name as LitNetwork;
			}
		}

		throw new Error(`No matching LitNetwork found for chainId: ${chainId}`);
	}

	/**
	 * Maps chainId to LitChain (used in session signature generation)
	 * @param chainId - The chainId to map to a LitChain
	 */
	private chainIdToLitChainName(chainId: SupportedChainId): string {
		for (const [name, chain] of Object.entries(LIT_CHAINS)) {
			if (chain.chainId === chainId) {
				return name;
			}
		}
		throw new Error(`No matching chain found for chainId: ${chainId}`);
	}

	/**
	 * Determines the network name based on chainId
	 * @param chainId - The chainId to determine the network name
	 * @returns The network name ("datil-dev" or "datil-test")
	 */
	private getNetworkName(chainId: SupportedChainId): keyof typeof networks {
		return chainId === 11155111 ? "datil-dev" : "datil-test";
	}

	/**
	 * Generates the network configuration based on chainId
	 * @param chainId - The chainId to generate the config for
	 * @returns The network configuration object
	 */
	private getNetworkConfig(chainId: SupportedChainId) {
		const networkName = this.getNetworkName(chainId);
		return networks[networkName].clientConfig;
	}

	private getNetworkRpc(chainId: SupportedChainId) {
		const networkName = this.getNetworkName(chainId);
		return networks[networkName].rpc;
	}

	/**
	 * Connects to the Lit Network based on the provided chainId
	 * @param chainId - The chainId to connect to
	 */
	async connect(chainId: SupportedChainId) {
		this.network = this.chainIdToLitNetwork(chainId);

		if (!this.network) {
			throw new Error("No matching LitNetwork found for chainId");
		}

		const networkConfig = this.getNetworkConfig(chainId);

		this.litNodeClient = new LitNodeClientNodeJs(networkConfig);

		try {
			await this.litNodeClient.connect();
		} catch (error) {
			console.error(`Failed to connect to LitNetwork: ${this.network}`, error);
			throw new Error("Failed to connect to LitNodeClient");
		}
	}

	/**
	 * Disconnects from the Lit Network
	 */
	async disconnect() {
		if (this.litNodeClient) {
			try {
				await this.litNodeClient.disconnect();
				this.litNodeClient = null;
			} catch (error) {
				console.error(
					`Failed to disconnect from LitNetwork: ${this.network}`,
					error,
				);
				throw new Error("Failed to disconnect from LitNodeClient");
			}
		} else {
			console.warn("No active LitNodeClient connection to disconnect from.");
		}
	}

	/**
	 * Generates session signatures via AuthSig for the given chainId and private key
	 */
	async getSessionSigsViaAuthSig(
		chainId: SupportedChainId,
		privateKey: `0x${string}`,
	) {
		if (!this.network) {
			throw new Error("Network not connected. Call connect() first.");
		}

		const networkRpc = this.getNetworkRpc(chainId);

		const signer = this.ethersUtilsService.getSigner(networkRpc, privateKey);

		const expiration = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

		const resourceAbilityRequests = [
			{
				resource: new LitAccessControlConditionResource("*"),
				ability: LitAbility.AccessControlConditionDecryption,
			},
		];

		if (!this.litNodeClient) {
			throw new Error("LitNodeClient not initialized");
		}

		const authNeededCallback = async (params: {
			uri?: string;
			expiration?: string;
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			resourceAbilityRequests?: any;
		}) => {
			const toSign = await createSiweMessage({
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				uri: params.uri!,
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				expiration: params.expiration!,
				resources: params.resourceAbilityRequests,
				walletAddress: await signer.getAddress(),
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				nonce: await this.litNodeClient!.getLatestBlockhash(),
				litNodeClient: this.litNodeClient,
			});

			return await generateAuthSig({
				signer: signer,
				toSign,
			});
		};

		return await this.litNodeClient.getSessionSigs({
			chain: this.chainIdToLitChainName(chainId),
			expiration,
			resourceAbilityRequests,
			authNeededCallback: authNeededCallback,
		});
	}

	async decryptAttestationFromJson(
		chainId: SupportedChainId,
		privateKey: `0x${string}`,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		secret: any,
	) {
		if (!this.litNodeClient) {
			await this.connect(chainId);
		}

		const sessionSigs = await this.getSessionSigsViaAuthSig(
			chainId,
			privateKey,
		);

		try {
			if (!this.litNodeClient) {
				throw new Error("LitNodeClient not initialized");
			}

			return await decryptFromJson({
				litNodeClient: this.litNodeClient,
				parsedJsonData: JSON.parse(secret),
				sessionSigs,
			});
		} catch (error) {
			console.log("Error decrypting from JSON", error);
		}
	}
}
