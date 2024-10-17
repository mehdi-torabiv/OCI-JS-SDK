import dotenv from "dotenv";
dotenv.config();

import { getAccountFromPrivateKey } from "./helpers";
import { AttestationService } from "./services/eas";
import { OIDPermissionManagerService } from "./services/oid";

const networkChainId = 11155111;
const defaultRecipientAddress = "0x026B727b60D336806B87d60e95B6d7FAd2443dD6";

const developerPrivateKey = process.env.DEFAULT_APP_DEVELOPER_PRIVATE_KEY;

const discordUserId = "973993299281076285";

const attestationService = new AttestationService(networkChainId);

async function fetchAndValidateRecipient() {
	try {
		const recipientWalletAddress =
			await attestationService.findRecipientWalletAddress(
				discordUserId,
				"discord",
			);
		console.log("Recipient Wallet Address:", recipientWalletAddress);

		if (!recipientWalletAddress) throw new Error("Recipient not found");

		const attestationResults =
			await attestationService.fetchAttestationsByRecipient(
				recipientWalletAddress,
			);
		console.log("Attestation Results:", attestationResults);

		const attestationIds = attestationResults.map(
			(attestation) => attestation.id,
		);

		const permissionManager = new OIDPermissionManagerService(networkChainId);
		console.log("Permission Manager Instance:", permissionManager);

		if (!developerPrivateKey)
			throw new Error("Developer private key not found");

		const developerAccount = getAccountFromPrivateKey(developerPrivateKey);
		console.log("Developer Account:", developerAccount);

		const hasPermission = await permissionManager.hasPermission(
			attestationIds[1],
			developerAccount.address,
		);
		console.log("Has Permission:", hasPermission);
	} catch (error) {
		console.error("Error during recipient validation:", error);
	}
}

fetchAndValidateRecipient();
