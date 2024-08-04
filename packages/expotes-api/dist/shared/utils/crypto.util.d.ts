import { Dictionary } from 'structured-headers';
export declare function convertSHA256HashToUUID(value: string): string;
export declare function getPrivateKeyAsync(): Promise<string>;
export declare function signRSASHA256(data: string, privateKey: string): string;
export declare function convertToDictionaryItemsRepresentation(obj: {
    [key: string]: string;
}): Dictionary;
