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
	 * Initializes the OIDPermissionManagerService with the specified chainId.
	 * @param chainId - The ID of the blockchain network.
	 * @throws Will throw an error if the specified chainId is not supported.
	 */
	constructor(chainId: number) {
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

		this.client = createPublicClient({
			chain,
			transport: http("https://rpc.sepolia.org"),
		});
	}

	/**
	 * Checks if the specified account has permission for the given UID.
	 * @param uid - The attestation unique identifier (UID) to check.
	 * @param account - The account address to check the permission for.
	 * @returns A promise that resolves to true if the account has permission, otherwise false.
	 */
	public async hasPermission(uid: Address, account: Address): Promise<boolean> {
		try {
			const result = await this.client.readContract({
				address: this.contractAddress as Address,
				abi: this.contractABI,
				functionName: "hasPermission",
				args: [uid, account],
			});
			return result as boolean;
		} catch (error) {
			console.error("Error checking permission:", error);
			throw new Error("Failed to check permission");
		}
	}
}
