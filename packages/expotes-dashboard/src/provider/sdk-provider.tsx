"use client";

import type React from "react";
import { useMemo } from "react";

import { FetchContext, SDKContext } from "@/lib/api";
import { usePersistStore } from "@/store/persist";
import { env } from "next-runtime-env";
import { usePathname, useRouter } from "next/navigation";
import { SWRConfig } from "swr";

// const apiUrl = env("NEXT_PUBLIC_API_URL") || process.env.NEXT_PUBLIC_API_URL;
// if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not set");
const apiUrl = "http://localhost:3000";

const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { teamId } = usePersistStore();

  const options = useMemo(() => {
    return {
      headers: {
        ...(teamId ? { "expotes-team-id": teamId } : {}),
      },
      options: {
        credentials: "include" as const,
      },
    };
  }, [teamId]);

  return (
    <SWRConfig
      value={{
        onError: (error) => {
          if (error.status === 400 || error.status === 401) {
            if (!pathname.startsWith("/auth/login")) {
              router.push("/auth/login");
            }
          }
        },
      }}
    >
      <FetchContext.Provider
        value={(input, init) =>
          fetch(`${apiUrl}${input}`, {
            // ...options,
            ...options.options,
            headers: {
              ...options.headers,
              ...init?.headers,
            },
            ...init,
          })
        }
      >
        <SDKContext.Provider
          value={{
            host: apiUrl,
            ...options,
          }}
        >
          {children}
        </SDKContext.Provider>
      </FetchContext.Provider>
    </SWRConfig>
  );
};
export default SDKProvider;
