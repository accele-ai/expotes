var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, BadRequestException, } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { convertToDictionaryItemsRepresentation, getPrivateKeyAsync, signRSASHA256, } from "../../shared/utils/crypto.util";
import { serializeDictionary } from 'structured-headers';
import FormData from 'form-data';
const sign = async (data) => {
    const privateKey = await getPrivateKeyAsync();
    if (!privateKey) {
        throw new BadRequestException('Code signing requested but no key supplied when starting server.');
    }
    const dataString = JSON.stringify(data);
    const hashSignature = signRSASHA256(dataString, privateKey);
    const dictionary = convertToDictionaryItemsRepresentation({
        sig: hashSignature,
        keyid: 'main',
    });
    return serializeDictionary(dictionary);
};
let SignatureInterceptor = class SignatureInterceptor {
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        return next.handle().pipe(map(async (data) => {
            const expectSignatureHeader = request.headers['expo-expect-signature'];
            const manifest = data.manifest;
            const directive = data.directive;
            const form = new FormData();
            if (manifest) {
                const signature = expectSignatureHeader ? sign(manifest) : null;
                form.append('manifest', JSON.stringify(manifest), {
                    contentType: 'application/json',
                    header: {
                        'content-type': 'application/json; charset=utf-8',
                        ...(signature ? { 'expo-signature': signature } : {}),
                    },
                });
                const assetRequestHeaders = {};
                [...manifest.assets, manifest.launchAsset].forEach((asset) => {
                    assetRequestHeaders[asset.key] = {
                        'test-header': 'test-header-value',
                    };
                });
                form.append('extensions', JSON.stringify({ assetRequestHeaders }), {
                    contentType: 'application/json',
                });
            }
            else if (directive) {
                const signature = expectSignatureHeader ? sign(directive) : null;
                form.append('directive', JSON.stringify(directive), {
                    contentType: 'application/json',
                    header: {
                        'content-type': 'application/json; charset=utf-8',
                        ...(signature ? { 'expo-signature': signature } : {}),
                    },
                });
            }
            response.status(200);
            response.setHeader('expo-protocol-version', 1);
            response.setHeader('expo-sfv-version', 0);
            response.setHeader('cache-control', 'private, max-age=0');
            response.setHeader('content-type', `multipart/mixed; boundary=${form.getBoundary()}`);
            response.write(form.getBuffer());
            response.end();
        }));
    }
};
SignatureInterceptor = __decorate([
    Injectable()
], SignatureInterceptor);
export { SignatureInterceptor };
//# sourceMappingURL=signature.interceptors.js.map