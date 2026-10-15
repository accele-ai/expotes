"use client";

import type React from "react";
import { useMemo } from "react";

import { FetchContext, SDKContext } from "@/lib/api";
import { usePersistStore } from "@/store/persist";
import { usePathname, useRouter } from "next/navigation";
import { SWRConfig } from "swr";

const SDKProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const router = useRouter();
	const pathname = usePathname();
	const { teamId } = usePersistStore();
	const apiUrl = typeof window === "undefined" ? "" : window.location.origin;

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
			key={teamId}
			value={{
				provider: () => new Map(),
				onError: (error) => {
					if (error.status === 401 && !pathname.startsWith("/auth/login")) {
						router.push("/auth/login");
					}
				},
			}}
		>
			<FetchContext.Provider
				value={(input, init) => {
					const headers = new Headers(options.headers);
					new Headers(init?.headers).forEach((value, key) => {
						headers.set(key, value);
					});
					return fetch(input, {
						...options.options,
						...init,
						headers,
					});
				}}
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
