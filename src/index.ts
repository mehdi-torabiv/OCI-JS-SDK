import dotenv from "dotenv";
import { OciClient } from "./services/oci";
dotenv.config();

const ociClient = new OciClient({
	chainId: 11155111,
	appPrivateKey: process.env.DEFAULT_APP_DEVELOPER_PRIVATE_KEY as `0x${string}`,
});

async function fetchUserProfiles() {
	try {
		const profiles = await ociClient.getUserProfiles(
			"discord",
			"973993299281076285",
		);
		console.log({ profiles });
	} catch (error) {
		console.error("Error fetching user profiles:", error);
	}
}

fetchUserProfiles();
