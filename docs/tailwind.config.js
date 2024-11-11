const svgToDataUri = require("mini-svg-data-uri");
const {
	default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const makePrimaryColor =
	(l) =>
	({ opacityValue }) => {
		return `hsl(var(--nextra-primary-hue) var(--nextra-primary-saturation) calc(var(--nextra-primary-lightness) + ${l}%)${opacityValue ? ` / ${opacityValue})` : ")"}`;
	};

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx,md}", "./theme.config.tsx"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: makePrimaryColor(52),
					100: makePrimaryColor(49),
					200: makePrimaryColor(41),
					300: makePrimaryColor(32),
					400: makePrimaryColor(21),
					500: makePrimaryColor(5),
					600: makePrimaryColor(0),
					700: makePrimaryColor(-6),
					750: makePrimaryColor(-10),
					800: makePrimaryColor(-13),
					900: makePrimaryColor(-21),
				},
			},
		},
	},
	plugins: [
		addVariablesForColors,
		({ matchUtilities, theme }) => {
			matchUtilities(
				{
					"bg-dot-thick": (value) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`,
						)}")`,
					}),
				},
				{
					values: flattenColorPalette(theme("backgroundColor")),
					type: "color",
				},
			);
		},
	],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
	const allColors = flattenColorPalette(theme("colors"));
	const newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
	);

	addBase({
		":root": newVars,
	});
}
