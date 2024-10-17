import { keccak256, toHex } from "viem";

export function getHashedId(accountId: string) {
	return keccak256(toHex(accountId));
}
