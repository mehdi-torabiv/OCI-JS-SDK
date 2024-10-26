import dotenv from "dotenv";
dotenv.config();

import { getAccountFromPrivateKey } from "./helpers";
import { AttestationService } from "./services/eas";
import { EthersUtilsService } from "./services/ethers";
import { LitProtocol } from "./services/lit";
import { OIDPermissionManagerService } from "./services/oid";

const networkChainId = 11155111;
const defaultRecipientAddress = "0x026B727b60D336806B87d60e95B6d7FAd2443dD6";

const developerPrivateKey = process.env
	.DEFAULT_APP_DEVELOPER_PRIVATE_KEY as `0x${string}`;

const discordUserId = "973993299281076285";

const attestationService = new AttestationService(networkChainId);

/**
 * Fetch and validate recipient, check permissions, and decrypt attestation data.
 */
async function fetchAndProcessRecipientAttestation() {
	try {
		// Fetch the recipient's wallet address based on discord user ID
		const recipientWalletAddress =
			await attestationService.findRecipientWalletAddress(
				discordUserId,
				"discord",
			);
		console.log("Recipient Wallet Address:", recipientWalletAddress);

		if (!recipientWalletAddress) throw new Error("Recipient not found");

		// Fetch attestations related to the recipient wallet address
		const attestationResults =
			await attestationService.fetchAttestationsByRecipient(
				recipientWalletAddress,
			);
		console.log("Attestation Results:", attestationResults);

		const attestationIds = attestationResults.map(
			(attestation) => attestation.id,
		);

		// Initialize the permission manager and validate permissions
		const permissionManager = new OIDPermissionManagerService(networkChainId);
		console.log("Permission Manager Instance:", permissionManager);

		if (!developerPrivateKey)
			throw new Error("Developer private key not found");

		const developerAccount = getAccountFromPrivateKey(developerPrivateKey);
		console.log("Developer Account:", developerAccount);

		// Check if the developer account has permission to access the attestation
		const hasPermission = await permissionManager.hasPermission(
			attestationIds[1],
			developerAccount.address,
		);
		console.log("Has Permission:", hasPermission);

		// Initialize services
		const ethersUtilsService = new EthersUtilsService();
		const litProtocol = new LitProtocol(ethersUtilsService);

		// Decode the attestation data
		const decodedAttestationData =
			attestationService.decodeAttestationSchemaData(
				attestationResults[0].data,
			);
		console.log("Decoded Attestation Data:", decodedAttestationData);

		// Extract the secret from the decoded attestation data
		const attestationSecret = decodedAttestationData[2].value.value;
		console.log("Attestation Secret:", attestationSecret);

		// Decrypt the attestation using LitProtocol
		const decryptedData = await litProtocol.decryptAttestationFromJson(
			networkChainId,
			developerPrivateKey,
			attestationSecret,
		);

		console.log("Decrypted Data:", decryptedData);
	} catch (error) {
		console.error("Error during recipient validation and processing:", error);
	}
}

fetchAndProcessRecipientAttestation();
