export const oidPermissionManagerABI = [
	{
		inputs: [
			{ internalType: "address", name: "initialAuthority", type: "address" },
			{ internalType: "contract IEAS", name: "initialEAS", type: "address" },
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [{ internalType: "address", name: "authority", type: "address" }],
		name: "AccessManagedInvalidAuthority",
		type: "error",
	},
	{
		inputs: [
			{ internalType: "address", name: "caller", type: "address" },
			{ internalType: "uint32", name: "delay", type: "uint32" },
		],
		name: "AccessManagedRequiredDelay",
		type: "error",
	},
	{
		inputs: [{ internalType: "address", name: "caller", type: "address" }],
		name: "AccessManagedUnauthorized",
		type: "error",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "attestation_uid", type: "bytes32" },
		],
		name: "AttestationNotFound",
		type: "error",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "attestation_uid", type: "bytes32" },
		],
		name: "AttestationRevoked",
		type: "error",
	},
	{
		inputs: [{ internalType: "address", name: "caller", type: "address" }],
		name: "UnauthorizedAccess",
		type: "error",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "authority",
				type: "address",
			},
		],
		name: "AuthorityUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: "bytes32", name: "key", type: "bytes32" },
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address",
			},
			{ indexed: false, internalType: "bool", name: "granted", type: "bool" },
		],
		name: "PermissionUpdated",
		type: "event",
	},
	{
		inputs: [],
		name: "authority",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "eas",
		outputs: [{ internalType: "contract IEAS", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "attestation_uid", type: "bytes32" },
			{ internalType: "address", name: "account", type: "address" },
		],
		name: "grantPermission",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "key", type: "bytes32" },
			{ internalType: "address", name: "account", type: "address" },
		],
		name: "hasPermission",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "isConsumingScheduledOp",
		outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "attestation_uid", type: "bytes32" },
			{ internalType: "address", name: "account", type: "address" },
		],
		name: "revokePermission",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "newAuthority", type: "address" },
		],
		name: "setAuthority",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;
