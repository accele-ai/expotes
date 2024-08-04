import crypto, { BinaryToTextEncoding } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Dictionary } from 'structured-headers';

export function convertSHA256HashToUUID(value: string) {
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(
    12,
    16,
  )}-${value.slice(16, 20)}-${value.slice(20, 32)}`;
}

export async function getPrivateKeyAsync() {
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  if (!privateKeyPath) {
    return null;
  }

  const pemBuffer = await fs.readFile(path.resolve(privateKeyPath));
  return pemBuffer.toString('utf8');
}

export function signRSASHA256(data: string, privateKey: string) {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data, 'utf8');
  sign.end();
  return sign.sign(privateKey, 'base64');
}
export function convertToDictionaryItemsRepresentation(obj: {
  [key: string]: string;
}): Dictionary {
  return new Map(
    Object.entries(obj).map(([k, v]) => {
      return [k, [v, new Map()]];
    }),
  );
}
