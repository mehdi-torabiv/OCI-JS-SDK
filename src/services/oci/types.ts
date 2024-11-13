export type IAttestations = {
	id: `0x${string}`;
	decodedDataJson: string;
	data: string;
};

export type IOciClientConfig = {
	chainId: number;
	appPrivateKey: `0x${string}`;
};

export type UserAttestation = {
	attestationId: string;
	provider: string;
	hasAccess: boolean;
};
