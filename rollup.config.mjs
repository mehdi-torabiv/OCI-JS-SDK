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
		},
		{
			file: "dist/index.esm.js",
			format: "esm",
			sourcemap: true,
			inlineDynamicImports: true,
		},
	],
	plugins: [
		resolve({
			browser: true,
			preferBuiltins: false,
		}),
		commonjs(),
		typescript({
			useTsconfigDeclarationDir: true,
		}),
		json(),
	],
	external: ["fs", "path"],
};
