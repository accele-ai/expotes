/* eslint-disable @typescript-eslint/no-empty-interface */
import {
	cdnProviderTable,
	ICDNProviderInsert,
	ICDNProviderSelect,
	IStorageProviderSelect,
} from "@db/schema";

export interface CreateCdnProviderDto
	extends Omit<ICDNProviderInsert, "id" | "createdAt" | "updatedAt"> {}

export interface UpdateCdnProviderDto extends Partial<CreateCdnProviderDto> {}

export interface CdnProviderResponseDto extends ICDNProviderSelect {}

export interface CreateStorageProviderDto
	extends Omit<IStorageProviderSelect, "id" | "createdAt" | "updatedAt"> {}

export interface UpdateStorageProviderDto
	extends Partial<Omit<CreateStorageProviderDto, "teamId">> {}

export interface StorageProviderResponseDto extends IStorageProviderSelect {}
