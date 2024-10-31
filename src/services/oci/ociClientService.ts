import {
	convertUnit8ArrayToJson,
	getAccountFromPrivateKey,
} from "../../helpers";
import { AttestationService } from "../eas";
import { EthersUtilsService } from "../ethers";
import { LitProtocol } from "../lit";
import { OIDPermissionManagerService } from "../oid";

interface OciClientConfig {
	chainId: number;
	appPrivateKey: `0x${string}`;
}

export class OciClient {
	private attestationService?: AttestationService;
	private ethersUtilsService?: EthersUtilsService;
	private litProtocol?: LitProtocol;
	private permissionManager?: OIDPermissionManagerService;
	private developerAccount: { address: string };

	/**
	 * Initializes the OCI Client with the specified configuration.
	 * Automatically initializes required services and dependencies.
	 * @param config - Contains `chainId` and `appPrivateKey` for initializing dependencies.
	 */
	constructor(private config: OciClientConfig) {
		const { chainId, appPrivateKey } = config;

		this.developerAccount = getAccountFromPrivateKey(appPrivateKey);

		this.attestationService = new AttestationService(chainId);
		this.ethersUtilsService = new EthersUtilsService();
		this.litProtocol = new LitProtocol(this.ethersUtilsService);
		this.litProtocol.connect(chainId);
		this.litProtocol.getSessionSigsViaAuthSig(chainId, appPrivateKey);
		this.permissionManager = new OIDPermissionManagerService(chainId);

		console.log("OciClient initialized with chainId:", chainId);
	}

	public async getUserProfiles(provider: "discord" | "google", userId: string) {
		if (!this.attestationService) {
			throw new Error("Attestation service is not initialized.");
		}

		if (!this.permissionManager) {
			throw new Error("Permission manager is not initialized.");
		}

		if (!this.litProtocol) {
			throw new Error("Lit protocol is not initialized.");
		}

		const recipientAddress =
			await this.attestationService.findRecipientWalletAddress(
				userId,
				provider,
			);

		if (!recipientAddress) {
			throw new Error("Recipient wallet address not found.");
		}

		const attestations =
			await this.attestationService.fetchAttestationsByRecipient(
				recipientAddress,
			);

		if (attestations.length === 0) {
			throw new Error("No attestations found.");
		}

		const userProfiles = [];

		for (const attestation of attestations) {
			const hasPermission = await this.permissionManager.hasPermission(
				attestation.id,
				this.developerAccount.address as `0x${string}`,
			);

			if (!hasPermission) {
				console.log(
					`No permission for attestation ${attestation.id}. Skipping decryption.`,
				);
				continue;
			}

			const decodedData = this.attestationService.decodeAttestationSchemaData(
				attestation.data,
			);

			const secret = decodedData.find((item) => item.name === "secret")?.value
				?.value;

			if (!secret) {
				throw new Error("Attestation secret not found.");
			}

			const decryptedData = await this.litProtocol.decryptAttestationFromJson(
				this.config.chainId,
				this.config.appPrivateKey,
				secret,
			);

			const { id, provider } = convertUnit8ArrayToJson(decryptedData);

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
}
