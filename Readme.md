# OCI JS SDK

![npm version](https://img.shields.io/npm/v/oci-js-sdk)
![license](https://img.shields.io/npm/l/oci-js-sdk)
![build](https://img.shields.io/github/actions/workflow/status/mehdi-torabiv/OCI-JS-SDK/ci.yml?branch=main)

OCI JS SDK is a JavaScript/TypeScript SDK designed for seamless interaction with the OCI platform. It enables developers to manage attestations, permissions, and encrypted on-chain data efficiently, facilitating integration with various blockchain protocols and services.

## Features

- Retrieve user attestations by wallet address
- Manage attestations with custom permissions
- Connect to on-chain services for verification and decryption
- Support for multiple providers (e.g., Discord, Google)

## Installation

Install the OCI JS SDK using your preferred package manager:

```bash
# Using pnpm
pnpm add oci-js-sdk

# Using npm
npm install oci-js-sdk

# Using yarn
yarn add oci-js-sdk
```

## Usage

### Initialization

Begin by importing and configuring the `OciClient` with your network details, including `chainId`, `appPrivateKey`, and an optional `rpcUrl`:

```typescript
import OciClient from "oci-js-sdk";

const ociClient = new OciClient({
  chainId: 11155111, // Replace with your chain ID
  appPrivateKey: "0xYOUR_PRIVATE_KEY", // Optional
  rpcUrl: "https://your-rpc-url", // Optional
});
```

### Fetch User Profiles

To fetch user profiles, provide a provider type (e.g., `discord`, `google`, `address`) and the corresponding account ID. This method retrieves decrypted data for each attestation where permissions allow:

```typescript
async function fetchUserProfiles() {
  try {
    const userProfiles = await ociClient.getUserProfiles(
      "discord",
      "your-discord-id"
    );
    console.log(userProfiles);
  } catch (error) {
    console.error("Error fetching user profiles:", error);
  }
}

fetchUserProfiles();
```

### Fetch Attestations by Wallet Address

Retrieve attestations for a given wallet address without decrypting the data. This method returns the attestation ID and provider:

```typescript
async function fetchAttestations() {
  try {
    const attestations = await ociClient.getUserAttestationsByRecipient(
      "0xYourWalletAddress"
    );
    console.log(attestations);
  } catch (error) {
    console.error("Error fetching attestations:", error);
  }
}

fetchAttestations();
```

## API Documentation

Generate full API documentation using `typedoc`:

```bash
pnpm run doc
```

The documentation will be generated in the `docs` folder.

## Scripts

- **build**: Compiles the TypeScript code into JavaScript.
- **start**: Runs the compiled SDK.
- **dev**: Runs the SDK in development mode with live reload.
- **test**: Executes tests using Jest.
- **doc**: Generates API documentation with Typedoc.
- **lint**: Runs Biome (ESLint alternative) checks.
- **lint:fix**: Automatically fixes lint issues.
- **format**: Formats the code using Biome.
- **prepare**: Sets up Git hooks using Husky.

## Testing

To run tests, use the following command:

```bash
pnpm run test
```

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Clone your forked repository.
3. Make your changes.
4. Submit a pull request.

## License

This project is licensed under the **GNU Affero General Public License (AGPL) v3**. See the [LICENSE](https://www.gnu.org/licenses/agpl-3.0.en.html) file for more details.
