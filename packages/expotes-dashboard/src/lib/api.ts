import { type IConnection, createSDKServices } from "nestia-swr";
import React from "react";

export const SDKContext = React.createContext<IConnection | null>(null);
export const FetchContext = React.createContext<typeof fetch | null>(null);

const { useSDK, useSDKMutation } = createSDKServices(SDKContext);

const useFetcher = () => {
	const fetch = React.useContext(FetchContext);
	if (!fetch) {
		throw new Error("useFetcher must be used within a SDKProvider");
	}
	return fetch;
};

export { useSDK, useSDKMutation, useFetcher };
