import {
	http,
	type Address,
	type PublicClient,
	createPublicClient,
} from "viem";
import { oidPermissionManagerConfig } from "../../configs/oidPermissionManagerConfig";
import { networkConfig } from "../../lib/constants";
import type { oidPermissionManagerABI } from "../../lib/contracts/oid";

export default class OIDPermissionManagerService {
	private readonly client: PublicClient;
	private readonly contractAddress: Address;
	private readonly contractABI: typeof oidPermissionManagerABI;

	/**
	 * Initializes the OIDPermissionManagerService with the specified chainId and optional RPC URL.
	 * @param chainId - The ID of the blockchain network.
	 * @param rpcUrl - An optional RPC URL to override the default RPC URL for the specified chain.
	 *                 If provided, it will be used to connect to the blockchain network;
	 *                 otherwise, the default RPC URL from the chain configuration will be used.
	 * @throws Will throw an error if the specified chainId is not supported or if chain configuration is missing.
	 */
	constructor(chainId: number, rpcUrl?: string) {
		const config = oidPermissionManagerConfig[chainId];

		if (!config) {
			throw new Error(`Unsupported chainId: ${chainId}`);
		}

		this.contractAddress = config.contractAddress;
		this.contractABI = config.contractABI;

		const chain = networkConfig[chainId];

		if (!chain) {
			throw new Error(`Chain configuration not found for chainId: ${chainId}`);
		}

		const transportUrl = rpcUrl || chain?.rpcUrls?.default?.http[0];

		this.client = createPublicClient({
			chain,
			transport: http(transportUrl),
		});
	}

	/**
	 * Checks if the specified account has permission for the given UID.
	 * @param key - The key to check the permission for.
	 * @param account - The account address to check the permission for.
	 * @returns A promise that resolves to true if the account has permission, otherwise false.
	 * @throws Will throw an error if there is an issue reading the contract or checking permissions.
	 */
	public async hasPermission(key: Address, account: Address): Promise<boolean> {
		try {
			const result = await this.client.readContract({
				address: this.contractAddress as Address,
				abi: this.contractABI,
				functionName: "hasPermission",
				args: [key, account],
			});
			return result as boolean;
		} catch (error) {
			console.error("Error checking permission:", error);
			throw new Error("Failed to check permission");
		}
	}
}
