import CurrentYear from "@/components/current-year";
import { useRouter } from "next/router";
import { useConfig } from "nextra-theme-docs";
import { useMemo } from "react";

import type { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Expotes</span>,
  project: {
    link: "https://github.com/expotes/expotes",
  },
  i18n: [],
  docsRepositoryBase: "https://github.com/expotes/expotes/blob/master/docs/",
  gitTimestamp() {
    return null;
  },
  head() {
    const config = useConfig();
    const { route } = useRouter();
    const title = config.frontMatter.title
      ? `${config.frontMatter.title} | Expotes - Best Expo OTA Alternative to EAS Updates`
      : "Expotes - Best Expo OTA Alternative to EAS Updates";
    const description = config.frontMatter.description
      ? config.frontMatter.description
      : "Best Expo OTA Alternative to EAS Updates";

    const canonical = useMemo(
      () =>
        new URL(
          route.endsWith("/") ? route : `${route}/`,
          "https://expotes.com"
        ).href,
      [route]
    );

    return (
      <>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:site_name"
          content="Expotes - Best Expo OTA Alternative to EAS Updates"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </>
    );
  },
  footer: {
    content: () => {
      return (
        <>
          License | Made with <span className="text-red-500 mx-1">♥</span> by{" "}
          <a
            href="https://aprilnea.com"
            className="mx-1 text-black dark:text-white underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            AprilNEA LLC
          </a>{" "}
          | <span className="mx-1">&copy;</span>{" "}
          <CurrentYear defaultYear={2024} />
        </>
      );
    },
  },
};
export default config;
