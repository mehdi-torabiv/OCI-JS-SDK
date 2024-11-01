import AttestationService from "./services/eas/attestationService";
import { OciClient } from "./services/oci";

export * from "./services/eas";
export * from "./services/ethers";
export * from "./services/lit";
export * from "./services/oid";
export * from "./services/oci";
export * from "./services/fetch";

async function fetchAttestations() {
	const ociClient = new OciClient({
		chainId: 11155111,
		appPrivateKey:
			"0x1c1bca6747c0673525739b2318bef79eed53542c2928edfdbd30ff8bc2626192",
	});
	const result = await ociClient.getUserProfiles(
		"address",
		"0x026B727b60D336806B87d60e95B6d7FAd2443dD6",
	);

	console.log({ result });
}

fetchAttestations();
