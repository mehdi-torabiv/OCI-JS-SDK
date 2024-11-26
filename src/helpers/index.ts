import { isAddress, keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Hashes a value using Keccak-256.
 * @param value - The value to hash.
 * @returns The hashed value as a hex string.
 */
export function hashString(value: string) {
	return keccak256(toHex(value));
}

/**
 * Generates a hash for a given set of inputs by creating a hashable string and applying a hash function to it.
 * @param accountId
 * @param provider
 * @param metadata
 * @returns A hashed string representing the combined input.
 */
export function generateHash(
	accountId: string,
	provider: string,
	metadata?: Record<string, unknown>,
) {
	if (!accountId) {
		throw new Error("Validation failed: Account ID is required.");
	}

	if (!provider) {
		throw new Error("Validation failed: Provider is required.");
	}

	if (metadata) {
		return hashString(
			`${accountId}${provider}${JSON.stringify(metadata, null, 0)}`,
		);
	}
	return hashString(`${accountId}${provider}`);
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
