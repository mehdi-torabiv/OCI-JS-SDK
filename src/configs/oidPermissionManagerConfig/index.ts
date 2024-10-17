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
};
