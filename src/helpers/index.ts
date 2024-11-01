import { type PrivateKeyAccount, isAddress, keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Hashes an account ID using Keccak-256.
 * @param accountId - The account ID to hash.
 * @returns The hashed account ID as a hex string.
 */
export function hashAccountId(accountId: string) {
	return keccak256(toHex(accountId));
}

/**
 * get account object from a private key.
 * @param privateKey - The private key to create the account from.
 * @returns The account object containing the wallet address and other details.
 */
export function getAccountFromPrivateKey(privateKey: string) {
	return privateKeyToAccount(privateKey as `0x${string}`);
}

/**
 * Convert a `Uint8Array` into a JSON object.
 * @param data - The `Uint8Array` to be converted into a JSON object.
 * @returns The parsed JSON object from the provided `Uint8Array`.
 * @throws Will throw an error if the `Uint8Array` cannot be parsed as valid JSON.
 */
export function convertUnit8ArrayToJson(data: Uint8Array) {
	const jsonString = Buffer.from(data).toString("utf8");
	return JSON.parse(jsonString);
}

/**
 * Validate whether a given string is a valid address.
 * @param address - The address string to be validated.
 * @returns `true` if the address is valid; otherwise, `false`.
 */
export function isValidAddress(address: string): boolean {
	return isAddress(address);
}
