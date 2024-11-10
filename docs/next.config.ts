import nextra from "nextra";

const withNextra = nextra({
	theme: "nextra-theme-docs",
	themeConfig: "./theme.config.tsx",
	latex: false,
	search: {
		codeblocks: false,
	},
	defaultShowCopyCode: true,
});

export default withNextra({
	basePath: "/docs",
	output: "standalone",
	reactStrictMode: true,
	images: {
		unoptimized: true,
	},
	experimental: {
		optimizePackageImports: ["@components/icons", "framer-motion"],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
});
