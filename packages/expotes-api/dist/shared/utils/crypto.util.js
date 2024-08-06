"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSHA256HashToUUID = convertSHA256HashToUUID;
exports.getPrivateKeyAsync = getPrivateKeyAsync;
exports.signRSASHA256 = signRSASHA256;
exports.convertToDictionaryItemsRepresentation = convertToDictionaryItemsRepresentation;
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
function convertSHA256HashToUUID(value) {
    return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20, 32)}`;
}
async function getPrivateKeyAsync() {
    const privateKeyPath = process.env.PRIVATE_KEY_PATH;
    if (!privateKeyPath) {
        return null;
    }
    const pemBuffer = await promises_1.default.readFile(path_1.default.resolve(privateKeyPath));
    return pemBuffer.toString('utf8');
}
function signRSASHA256(data, privateKey) {
    const sign = crypto_1.default.createSign('RSA-SHA256');
    sign.update(data, 'utf8');
    sign.end();
    return sign.sign(privateKey, 'base64');
}
function convertToDictionaryItemsRepresentation(obj) {
    return new Map(Object.entries(obj).map(([k, v]) => {
        return [k, [v, new Map()]];
    }));
}
//# sourceMappingURL=crypto.util.js.map