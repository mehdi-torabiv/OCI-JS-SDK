export const oidPermissionManagerABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "bytes32",
				name: "uid",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bool",
				name: "granted",
				type: "bool",
			},
		],
		name: "PermissionDeleted",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "bytes32",
				name: "uid",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bool",
				name: "granted",
				type: "bool",
			},
		],
		name: "PermissionUpdated",
		type: "event",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "uid", type: "bytes32" },
			{ internalType: "address", name: "account", type: "address" },
		],
		name: "grantPermission",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "uid", type: "bytes32" },
			{ internalType: "address", name: "account", type: "address" },
		],
		name: "hasPermission",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "bytes32", name: "uid", type: "bytes32" },
			{ internalType: "address", name: "account", type: "address" },
		],
		name: "revokePermission",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;
