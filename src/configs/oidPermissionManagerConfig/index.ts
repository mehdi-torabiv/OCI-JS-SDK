import type { Address } from "viem";
import { oidPermissionManagerABI } from "../../lib/contracts/oid";

type OidPermissionManagerABI = typeof oidPermissionManagerABI;

export interface OidPermissionManagerConfig {
	[chainId: number]: {
		readonly contractAddress: Address;
		readonly contractABI: OidPermissionManagerABI;
	};
}

export const oidPermissionManagerConfig: OidPermissionManagerConfig = {
	11155111: {
		contractAddress: "0x787aeDd9Fb3e16EeF5b00C0F35f105daD2A1aA15",
		contractABI: oidPermissionManagerABI,
	},
	11155420: {
		contractAddress: "0xFcE488b93696Ec5e279b8257E67F074AbFEc59d8",
		contractABI: oidPermissionManagerABI,
	},
	84532: {
		contractAddress: "0xF65e300B0e622B1Bc224c7351397ea2FF29f1c3D",
		contractABI: oidPermissionManagerABI,
	},
	42161: {
		contractAddress: "0x9a85Bb58CFb60ABd205c4Af7039fF73C86b41bd8",
		contractABI: oidPermissionManagerABI,
	},
};
