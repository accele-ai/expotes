"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";

const IGNORE_PATHNAMES = ["app"];

export default function NavBreadcrumb() {
  const pathname = usePathname();

  const pathnames = useMemo(
    () =>
      pathname
        .split("/")
        .filter(Boolean)
        .filter((pathname) => !IGNORE_PATHNAMES.includes(pathname)),
    [pathname]
  );

  const t = useTranslations("Pathname");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathnames.map((pathname, index) => (
          <Fragment
            key={`${pathname}-${
              // biome-ignore lint/suspicious/noArrayIndexKey: prevent duplicate path slice
              index
            }`}
          >
            {index !== 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={pathnames.slice(0, index + 1).join("/")}>
                {t(pathname)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
