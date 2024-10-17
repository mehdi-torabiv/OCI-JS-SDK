import { type PrivateKeyAccount, keccak256, toHex } from "viem";
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
