import { AttestationService } from "./services/eas";

const chainId = 11155111;
const recipient = "0x026B727b60D336806B87d60e95B6d7FAd2443dD6";

const discordId = "973993299281076285";

const attestationService = new AttestationService(chainId);

async function fetchRecipient() {
	try {
		const recipient = await attestationService.findRecipientWalletAddress(
			discordId,
			"discord",
		);
		console.log(recipient);
		if (!recipient) throw new Error("Recipient not found");
		const res =
			await attestationService.fetchAttestationsByRecipient(recipient);
		console.log({ res });
	} catch (error) {
		console.error("Error fetching recipient:", error);
	}
}

fetchRecipient();
