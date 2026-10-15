const ts = require("typescript");

// Transpile dependency JavaScript separately; TypeScript source keeps ts-jest's type checking and Nestia transforms.
module.exports = {
	process(sourceText, sourcePath) {
		const result = ts.transpileModule(sourceText, {
			fileName: sourcePath,
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2021,
				esModuleInterop: true,
				allowJs: true,
				sourceMap: true,
			},
		});
		return { code: result.outputText, map: result.sourceMapText };
	},
};
