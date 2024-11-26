import {
	convertUnit8ArrayToJson,
	getAccountFromPrivateKey,
	isValidAddress,
} from "../../helpers";
import AttestationService from "../../services/eas/attestationService";
import EthersUtilsService from "../../services/ethers/ethersUtilsService";
import LitProtocol from "../../services/lit/litProtocolService";
import OIDPermissionManagerService from "../../services/oid/oidPermissionManagerService";
import type { UserAttestation } from "./types";

interface OciClientConfig {
	chainId: number;
	appPrivateKey?: `0x${string}`;
	rpcUrl?: string;
}

export default class OciClient {
	private attestationService?: AttestationService;
	private ethersUtilsService?: EthersUtilsService;
	private litProtocol?: LitProtocol;
	private permissionManager?: OIDPermissionManagerService;
	private developerAccount?: { address: string };

	/**
	 * Initializes the OCI Client with the specified configuration.
	 * Automatically initializes required services and dependencies.
	 *
	 * @param config - Configuration object containing `chainId`, optional `appPrivateKey`, and `rpcUrl`.
	 */
	constructor(private config: OciClientConfig) {
		const { chainId, appPrivateKey, rpcUrl } = config;

		if (appPrivateKey?.startsWith("0x")) {
			this.developerAccount = getAccountFromPrivateKey(appPrivateKey);
		}

		this.attestationService = new AttestationService(chainId);
		this.ethersUtilsService = new EthersUtilsService();
		this.litProtocol = new LitProtocol(this.ethersUtilsService);
		this.permissionManager = new OIDPermissionManagerService(chainId, rpcUrl);
	}

	/**
	 * Checks if the app private key is initialized.
	 * @throws Error if the app private key is not initialized.
	 */
	private checkAppPrivateKey() {
		if (!this.config.appPrivateKey) {
			throw new Error(
				"Initialization failed: App private key is missing in configuration.",
			);
		}
	}

	/**
	 * Checks if the attestation service is initialized.
	 * @throws Error if the attestation service is not initialized.
	 */
	private checkAttestationService() {
		if (!this.attestationService) {
			throw new Error(
				"Service error: Attestation service was not initialized.",
			);
		}
	}

	/**
	 * Checks if the permission manager is initialized.
	 * @throws Error if the permission manager is not initialized.
	 */
	private checkPermissionManager() {
		if (!this.permissionManager) {
			throw new Error(
				"Service error: Permission manager was not initialized. Please check configuration.",
			);
		}
	}

	/**
	 * Checks if the Lit protocol is initialized.
	 * @throws Error if the Lit protocol is not initialized.
	 */
	private checkLitProtocol() {
		if (!this.litProtocol) {
			throw new Error(
				"Service error: Lit protocol was not initialized. Ensure the necessary configuration is provided.",
			);
		}
	}

	/**
	 * Checks if the account ID is valid if the provider is "address".
	 * @param provider - The provider type.
	 * @param accountId - The account ID to validate.
	 * @throws Error if the provider is "address" and the account ID is invalid.
	 */
	private checkValidAddress(
		provider: "discord" | "google" | "address",
		accountId: string | `0x${string}`,
	) {
		if (provider === "address" && !isValidAddress(accountId)) {
			throw new Error(
				"Validation error: The provided account ID is not a valid wallet address.",
			);
		}
	}

	/**
	 * Checks if the developer account is initialized.
	 * @throws Error if the developer account is not initialized.
	 */
	private checkDeveloperAccount() {
		if (!this.developerAccount) {
			throw new Error(
				"Configuration error: Developer account is missing. Please provide a valid app private key.",
			);
		}
	}

	/**
	 * Extracts a specified item from the decoded attestation data by key.
	 * @param data - Encoded attestation data as a string.
	 * @param key - The key of the item to extract (e.g., "provider", "secret").
	 * @returns The value of the item as a string, or undefined if not found.
	 */
	private extractItemFromData(data: string, key: string): string | undefined {
		const decodedData =
			this.attestationService?.decodeAttestationSchemaData(data);
		return decodedData?.find((item) => item.name === key)?.value?.value as
			| string
			| undefined;
	}

	/**
	 * Retrieves user profiles based on the specified provider and account ID.
	 * This method checks if the developer has permission to access each attestation
	 * and decrypts data as required.
	 *
	 * @param provider - Specifies the type of account ID (`discord`, `google`, or `address`).
	 * @param accountId - Identifier of the account; can be a social media ID or wallet address.
	 *
	 * @returns A promise that resolves to an array of user profiles, each containing:
	 *          - `attestationId`: Unique ID of the attestation.
	 *          - `profile`: An object with `provider` and decrypted `id`.
	 **/
	public async getUserProfiles(
		provider: "discord" | "google" | "address",
		accountId: string | `0x${string}`,
	) {
		this.checkAppPrivateKey();
		this.checkAttestationService();
		this.checkPermissionManager();
		this.checkLitProtocol();
		this.checkValidAddress(provider, accountId);

		const recipientAddress =
			provider === "address"
				? accountId
				: await this.attestationService?.findRecipientWalletAddress?.(
						accountId,
						provider,
					);

		if (!recipientAddress) {
			throw new Error(
				`Lookup error: Unable to find recipient wallet address for provider ${provider} and account ID ${accountId}.`,
			);
		}

		const attestations =
			(await this.attestationService?.fetchAttestationsByRecipient?.(
				recipientAddress,
			)) ?? [];

		if (attestations.length === 0) {
			return [];
		}

		const userProfiles = [];

		this.checkDeveloperAccount();

		for (const attestation of attestations) {
			const key = this.extractItemFromData(attestation.data, "key");

			const hasPermission = await this.permissionManager?.hasPermission?.(
				key as `0x${string}`,
				this.developerAccount?.address as `0x${string}`,
			);

			if (!hasPermission) {
				console.log(
					`Permission denied: No access to attestation ${attestation.id}. Skipping decryption.`,
				);
				continue;
			}

			const secret = this.extractItemFromData(attestation.data, "secret");

			if (!secret) {
				throw new Error(
					`Data error: Attestation ${attestation.id} does not contain a valid 'secret' field.`,
				);
			}

			await this.litProtocol?.connect(this.config.chainId);
			await this.litProtocol?.getSessionSigsViaAuthSig(
				this.config.chainId,
				this.config.appPrivateKey as `0x${string}`,
			);

			const decryptedData =
				await this.litProtocol?.decryptAttestationFromJson?.(
					this.config.chainId,
					this.config.appPrivateKey as `0x${string}`,
					secret,
				);

			const { id, provider } = decryptedData
				? convertUnit8ArrayToJson(decryptedData)
				: {};

			userProfiles.push({
				attestationId: attestation.id,
				profile: {
					provider,
					id,
				},
			});
		}

		return userProfiles;
	}

	/**
	 * Fetches attestations for a specified recipient's wallet address,
	 * providing information on the attestation provider and a flag indicating
	 * whether the app developer has access permissions for each attestation.
	 *
	 * @param recipientAddress - The wallet address of the recipient (must start with `0x`)
	 *                           to retrieve attestations for.
	 * @param appPublicAddress - The public address of the app developer (must start with `0x`),
	 *                           used to verify access permissions for each attestation.
	 * @returns A promise that resolves to an array of user attestations, where each attestation contains:
	 *          - `attestationId`: The unique identifier of the attestation.
	 *          - `provider`: The provider information extracted from the attestation data.
	 *          - `hasAccess`: A boolean indicating whether the app developer has permission to access this attestation.
	 */
	public async getUserProfileWithAppPermissions(
		recipientAddress: `0x${string}`,
		appPublicAddress: `0x${string}`,
	): Promise<UserAttestation[]> {
		this.checkAttestationService();

		const attestations =
			(await this.attestationService?.fetchAttestationsByRecipient?.(
				recipientAddress,
			)) ?? [];

		if (attestations.length === 0) {
			return [];
		}

		const userAttestations: UserAttestation[] = [];

		for (const attestation of attestations) {
			const key = this.extractItemFromData(attestation.data, "key");
			const provider = this.extractItemFromData(attestation.data, "provider");

			const hasAccess =
				(await this.permissionManager?.hasPermission?.(
					key as `0x${string}`,
					appPublicAddress,
				)) ?? false;

			userAttestations.push({
				attestationId: attestation.id,
				key: key as `0x${string}`,
				provider: provider as string,
				hasAccess,
			});
		}

		return userAttestations;
	}
}
