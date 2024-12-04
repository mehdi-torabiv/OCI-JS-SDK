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
import type EthersUtilsService from "../../services/ethers/ethersUtilsService";

/**
 * Class for interacting with the Lit Protocol, enabling network connection,
 * session signature generation, and data decryption.
 */
export default class LitProtocol {
	private litNodeClient: LitNodeClientNodeJs | null = null;
	private network: LitNetwork | undefined;

	/**
	 * Initializes a new instance of the LitProtocol class.
	 * @param ethersUtilsService - An instance of EthersUtilsService for creating signers.
	 */
	constructor(private readonly ethersUtilsService: EthersUtilsService) {}

	/**
	 * Maps a chainId to the appropriate LitNetwork.
	 * @param chainId - The chainId to map to a LitNetwork.
	 * @returns The LitNetwork corresponding to the chainId, or throws an error if none is found.
	 * @throws Will throw an error if no matching LitNetwork is found for the specified chainId.
	 */
	private chainIdToLitNetwork(chainId: SupportedChainId): LitNetwork {
		if (SUPPORTED_CHAINS.includes(chainId)) {
			const networkName = this.getNetworkName(chainId);
			return networks[networkName].clientConfig.litNetwork;
		}

		for (const [name, chain] of Object.entries(LIT_CHAINS)) {
			if (chain.chainId === chainId) {
				return name as LitNetwork;
			}
		}

		throw new Error(`No matching LitNetwork found for chainId: ${chainId}`);
	}

	/**
	 * Maps a chainId to the corresponding LitChain name.
	 * @param chainId - The chainId to map to a LitChain.
	 * @returns The LitChain name as a string.
	 * @throws Will throw an error if no matching chain is found for the specified chainId.
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
	 * Determines the network name based on the chainId.
	 * @param chainId - The chainId to determine the network name for.
	 * @returns The network name as "datil-dev" or "datil-test".
	 */
	private getNetworkName(chainId: SupportedChainId): keyof typeof networks {
		const networkMap: Record<SupportedChainId, keyof typeof networks> = {
			11155111: "datil",
			84532: "datil",
			42161: "datil",
		};

		return networkMap[chainId] || "datil-test";
	}

	/**
	 * Retrieves the network configuration for a specified chainId.
	 * @param chainId - The chainId to generate the config for.
	 * @returns The network configuration object.
	 */
	private getNetworkConfig(chainId: SupportedChainId) {
		const networkName = this.getNetworkName(chainId);
		return networks[networkName].clientConfig;
	}

	/**
	 * Retrieves the RPC URL for a specified chainId.
	 * @param chainId - The chainId to retrieve the RPC URL for.
	 * @returns The RPC URL as a string.
	 */
	private getNetworkRpc(chainId: SupportedChainId) {
		const networkName = this.getNetworkName(chainId);
		return networks[networkName].rpc;
	}

	/**
	 * Connects to the Lit Network based on the specified chainId.
	 * @param chainId - The chainId to connect to.
	 * @throws Will throw an error if the connection to the Lit Network fails.
	 */
	public async connect(chainId: SupportedChainId) {
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
	 * Disconnects from the Lit Network.
	 * @throws Will throw an error if disconnection fails.
	 */
	public async disconnect() {
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
	 * Generates session signatures via AuthSig for the given chainId and private key.
	 * @param chainId - The chainId for generating the session signatures.
	 * @param privateKey - The private key to use for signing the session signature.
	 * @returns The session signatures generated via AuthSig.
	 * @throws Will throw an error if the LitNodeClient is not initialized or if the network is not connected.
	 */
	public async getSessionSigsViaAuthSig(
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

	/**
	 * Decrypts JSON data using the Lit Protocol session signatures.
	 * @param chainId - The chainId for the decryption process.
	 * @param privateKey - The private key to use for generating session signatures.
	 * @param secret - The encrypted data in JSON format to be decrypted.
	 * @returns The decrypted data.
	 * @throws Will throw an error if decryption fails or the LitNodeClient is not initialized.
	 */
	public async decryptAttestationFromJson(
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
			throw new Error("Failed to decrypt JSON data");
		}
	}
}
