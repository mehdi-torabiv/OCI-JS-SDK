import { OciClient } from "./services/oci";

export * from "./services/eas";
export * from "./services/ethers";
export * from "./services/lit";
export * from "./services/oid";
export * from "./services/oci";
export * from "./services/fetch";
export * from "./helpers";

const ociClient = new OciClient({
	chainId: 84532,
	appPrivateKey:
		"0x78a30b6664f16df922011eaccb5e50aee620b9fd0d4ad6cc90ef524c0b24f2de",
});

const f = async () => {
	const res = await ociClient.getUserProfiles(
		"address",
		"0x0C6d3C0BfAB8d989CBC7BF20017bb849c3A6a8F6",
	);
	console.log(res);
};

f();
