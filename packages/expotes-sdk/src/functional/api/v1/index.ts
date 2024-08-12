/**
 * @packageDocumentation
 * @module api.functional.api.v1
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
//================================================================
import type { IConnection } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";
import type { Format } from "typia/lib/tags/Format";

export * as auth from "./auth";
export * as team from "./team";
export * as application from "./application";
export * as updates from "./updates";
export * as assets from "./assets";

/**
 * @controller ManifestController.manifest
 * @path GET /api/v1/manifest
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function manifest(
  connection: IConnection,
): Promise<manifest.Output> {
  return PlainFetcher.fetch(connection, {
    ...manifest.METADATA,
    template: manifest.METADATA.path,
    path: manifest.path(),
  });
}
export namespace manifest {
  export type Output = {
    manifest: {
      id: string;
      createdAt: string & Format<"date-time">;
      runtimeVersion: string;
      launchAsset: null | {
        hash?: undefined | string;
        key: string;
        fileExtension: null | string;
        contentType: string;
        url?: undefined | string;
      };
      assets: {
        hash?: undefined | string;
        key: string;
        fileExtension: null | string;
        contentType: string;
        url?: undefined | string;
      }[];
      metadata: {
        [key: string]: string;
      };
      extra: {
        [key: string]: any;
      };
    };
  };

  export const METADATA = {
    method: "GET",
    path: "/api/v1/manifest",
    request: null,
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: null,
  } as const;

  export const path = () => "/api/v1/manifest";
}
