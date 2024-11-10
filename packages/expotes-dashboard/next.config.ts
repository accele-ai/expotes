import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const IS_PROD = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: IS_PROD ? ("export" as const) : undefined,
	rewrites: !IS_PROD
		? async () => {
				return [
					{
						source: "/api/:path*",
						destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
					},
				];
			}
		: undefined,
};

export default withNextIntl(nextConfig);
