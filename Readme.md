# OCI JS SDK

![npm version](https://img.shields.io/npm/v/oci-js-sdk)
![license](https://img.shields.io/npm/l/oci-js-sdk)
![build](https://img.shields.io/github/actions/workflow/status/mehdi-torabiv/OCI-JS-SDK/Build.yml)

OCI JS SDK is a JavaScript/TypeScript SDK for interacting with the OCI platform, enabling developers to manage attestations, permissions, and encrypted data on-chain. Built with flexibility in mind, this SDK facilitates seamless integration with various blockchain protocols and services.

## Features

- Retrieve user attestations by wallet address
- Manage attestations with custom permissions
- Connect to on-chain services for verification and decryption
- Compatible with multiple identity providers (e.g., Discord, Google)

## Installation

Install the OCI JS SDK with your preferred package manager:

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

To begin using the OCI JS SDK, import and configure `OciClient` with your network details, including `chainId`, an optional `appPrivateKey`, and `rpcUrl`.

```typescript
import OciClient from "oci-js-sdk";

const ociClient = new OciClient({
  chainId: 11155111, // Replace with your chain ID
  appPrivateKey: "0xYOUR_PRIVATE_KEY", // Optional
  rpcUrl: "https://your-rpc-url", // Optional
});
```

### Fetch User Profiles

Retrieve user profiles by specifying a provider type (e.g., `discord`, `google`, `address`) and the associated account ID. This method fetches decrypted data for each attestation, provided permissions allow access.

```typescript
async function fetchUserProfiles() {
  try {
    const userProfiles = await ociClient.getUserProfiles(
      "discord",
      "your-discord-id"
    );
    console.log("User Profiles:", userProfiles);
  } catch (error) {
    console.error("Error fetching user profiles:", error);
  }
}

fetchUserProfiles();
```

### Fetch Attestations by Wallet Address

Retrieve attestations for a specified wallet address without decrypting the data. This method returns each attestation’s unique ID and the associated provider.

```typescript
async function fetchUserAttestations() {
  try {
    const attestations = await ociClient.getUserAttestationsByRecipient(
      "0xYourWalletAddress"
    );
    console.log("Attestations:", attestations);
  } catch (error) {
    console.error("Error fetching attestations:", error);
  }
}

fetchUserAttestations();
```

## API Documentation

Generate full API documentation with `typedoc`:

```bash
pnpm run doc
```

The generated documentation will be available in the `docs` folder.

## Scripts

- **build**: Compiles the TypeScript code into JavaScript.
- **start**: Runs the compiled SDK.
- **dev**: Runs the SDK in development mode with live reloading.
- **test**: Runs the test suite with Jest.
- **doc**: Generates API documentation using Typedoc.
- **lint**: Runs Biome (ESLint alternative) checks.
- **lint:fix**: Automatically fixes linting issues.
- **format**: Formats the code using Biome.
- **prepare**: Sets up Git hooks using Husky.

## Testing

To run the test suite, use:

```bash
pnpm run test
```

## Contributing

Contributions are welcome! To get started:

1. Fork this repository.
2. Clone your fork locally.
3. Make your changes.
4. Submit a pull request.

## License

This project is licensed under the ISC License. See the [LICENSE](https://github.com/mehdi-torabiv/OCI-JS-SDK/blob/main/LICENSE) file for more details.
