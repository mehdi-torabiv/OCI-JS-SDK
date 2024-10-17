import type { SchemaDecodedItem } from "@ethereum-attestation-service/eas-sdk";
import type { Address } from "viem";
import { hashAccountId } from "../../helpers";
import {
	attester,
	chainIdToGraphQLEndpoint,
	schemaId,
} from "../../lib/constants";
import { FetchService } from "../fetchService";

/**
 * Service for interacting with attestations and retrieving recipient wallet addresses.
 */
export class AttestationService {
	private graphqlEndpoint: string;
	private fetchService: FetchService;

	/**
	 * Initializes the AttestationService with the specified blockchain network.
	 * @param chainId - The ID of the blockchain network.
	 * @throws Will throw an error if the specified chainId is not supported.
	 */
	constructor(chainId: number) {
		const endpoint = chainIdToGraphQLEndpoint[chainId];
		if (!endpoint) {
			throw new Error(`Unsupported chainId: ${chainId}`);
		}
		this.graphqlEndpoint = endpoint;
		this.fetchService = new FetchService();
		console.log({ graphqlEndpoint: this.graphqlEndpoint });
	}

	/**
	 * Fetches all attestations for a given recipient's wallet address.
	 * @param recipient - The wallet address of the recipient.
	 * @returns A promise that resolves to an array of attestations containing the attestation ID, decoded data JSON, and raw data.
	 * @throws Will throw an error if no attestations are found for the specified recipient or if the request fails.
	 */
	public async fetchAttestationsByRecipient(
		recipient: string,
	): Promise<{ id: Address; decodedDataJson: string; data: string }[]> {
		const query = `
	  query GetAttestations(
		$attester: String!
		$schemaId: String!
		$recipient: String!
	  ) {
		attestations(
		  where: {
			attester: { equals: $attester }
			schemaId: { equals: $schemaId }
			revocationTime: { equals: 0 }
			decodedDataJson: { contains: $recipient }
		  }
		) {
		  id
		  decodedDataJson
		  data
		}
	  }`;

		const variables = {
			attester,
			schemaId,
			recipient,
		};

		try {
			const responseBody = await this.fetchService.post<{
				data: {
					attestations: {
						id: Address;
						decodedDataJson: string;
						data: string;
					}[];
				};
			}>(this.graphqlEndpoint, { query, variables });

			const attestations = responseBody.data.attestations;
			if (!attestations || attestations.length === 0) {
				throw new Error("No attestations found for the given wallet address");
			}

			return attestations;
		} catch (error) {
			console.error("Error fetching attestations:", error);
			throw new Error("Failed to fetch attestations. Please try again later.");
		}
	}

	/**
	 * Finds the recipient's wallet address based on the account ID and provider.
	 * @param accountId - The unique identifier for the account.
	 * @param provider - The name of the provider (e.g., "discord").
	 * @returns A promise that resolves to the recipient's wallet address if found, otherwise null.
	 * @throws Will throw an error if the GraphQL query fails or if no valid attestation is found.
	 */
	public async findRecipientWalletAddress(
		accountId: string,
		provider: string,
	): Promise<string | null> {
		const hashedId = hashAccountId(accountId);

		const query = `
      query Attestations(
        $attester: String!
        $schemaId: String!
        $hashedId: String!
      ) {
        findFirstAttestation(
          where: {
            attester: { equals: $attester }
            schemaId: { equals: $schemaId }
            revocationTime: { equals: 0 }
            decodedDataJson: { contains: $hashedId }
          }
        ) {
          decodedDataJson
        }
      }`;

		const variables = {
			attester,
			schemaId,
			hashedId,
		};

		const responseBody = await this.fetchService.post<{
			data: { findFirstAttestation: { decodedDataJson: string } | null };
		}>(this.graphqlEndpoint, { query, variables });

		const attestation = responseBody.data.findFirstAttestation;
		if (!attestation || !attestation.decodedDataJson) {
			throw new Error("No attestation or decodedDataJson found");
		}

		if (
			!this.isValidDecodedData(attestation.decodedDataJson, provider, hashedId)
		) {
			throw new Error(
				"The attestation does not contain the specified provider or hashedId",
			);
		}

		return this.extractWalletAddressFromDecodedData(
			attestation.decodedDataJson,
		);
	}

	/**
	 * Checks whether the decoded data JSON contains the specified provider and hashedId.
	 * @param decodedDataJson - The JSON string representing the decoded data.
	 * @param provider - The name of the provider.
	 * @param hashedId - The hashed account ID that needs to be checked.
	 * @returns A boolean indicating whether the specified provider and hashedId are present in the decoded data.
	 */
	private isValidDecodedData(
		decodedDataJson: string,
		provider: string,
		hashedId: string,
	): boolean {
		try {
			const decodedItems: SchemaDecodedItem[] = JSON.parse(decodedDataJson);

			const providerItem = decodedItems.find(
				(item) => item.name === "provider" && item.value.value === provider,
			);
			const keyItem = decodedItems.find(
				(item) => item.name === "key" && item.value.value === hashedId,
			);

			return !!(providerItem && keyItem);
		} catch (error) {
			console.error("Error validating decodedDataJson:", error);
			return false;
		}
	}

	/**
	 * Extracts the recipient's wallet address from the decoded data JSON.
	 * @param decodedDataJson - The JSON string representing the decoded data.
	 * @returns The recipient's wallet address if found, otherwise null.
	 * @throws Will throw an error if the format of the decodedDataJson is invalid.
	 */
	private extractWalletAddressFromDecodedData(
		decodedDataJson: string,
	): string | null {
		try {
			const decodedItems: SchemaDecodedItem[] = JSON.parse(decodedDataJson);

			const secretDataItem = decodedItems.find(
				(item: SchemaDecodedItem) => item.name === "secret",
			);
			if (!secretDataItem || typeof secretDataItem.value.value !== "string") {
				throw new Error("No valid 'secret' data item found in decodedDataJson");
			}

			const secretData = JSON.parse(secretDataItem.value.value);

			const unifiedAccessControlConditions =
				secretData.unifiedAccessControlConditions;
			if (!Array.isArray(unifiedAccessControlConditions)) {
				throw new Error("Invalid format for unifiedAccessControlConditions");
			}

			for (const condition of unifiedAccessControlConditions) {
				if (condition.returnValueTest?.value) {
					return condition.returnValueTest.value;
				}
			}

			return null;
		} catch (error) {
			console.error(
				"Error parsing decodedDataJson or extracting wallet address:",
				error,
			);
			return null;
		}
	}
}
