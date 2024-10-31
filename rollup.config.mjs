import path from "node:path";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default {
	input: "src/index.ts",
	output: [
		{
			file: "dist/index.cjs",
			format: "cjs",
			sourcemap: true,
			inlineDynamicImports: true,
			exports: "named",
		},
		{
			file: "dist/index.esm.js",
			format: "esm",
			sourcemap: true,
			inlineDynamicImports: true,
		},
	],
	plugins: [
		alias({
			entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
		}),
		resolve({
			browser: false,
			preferBuiltins: true,
		}),
		commonjs(),
		typescript({
			useTsconfigDeclarationDir: true,
		}),
		json(),
	],
	external: ["fs", "path"],
};
