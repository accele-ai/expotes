import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  convertToDictionaryItemsRepresentation,
  getPrivateKeyAsync,
  signRSASHA256,
} from 'src/shared/utils/crypto.util';
import { serializeDictionary } from 'structured-headers';
import FormData from 'form-data';

const sign = async (data: object) => {
  const privateKey = await getPrivateKeyAsync();
  if (!privateKey) {
    throw new BadRequestException(
      'Code signing requested but no key supplied when starting server.',
    );
  }

  const dataString = JSON.stringify(data);
  const hashSignature = signRSASHA256(dataString, privateKey);
  const dictionary = convertToDictionaryItemsRepresentation({
    sig: hashSignature,
    keyid: 'main',
  });
  return serializeDictionary(dictionary);
};

export class ExpoResponseHeaderInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();
    response.setHeader('expo-protocol-version', 1);
    response.setHeader('expo-sfv-version', 0);
    response.setHeader('cache-control', 'private, max-age=0');
    return next.handle();
  }
}

@Injectable()
export class ExpoSignatureInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map(async (data) => {
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

          const assetRequestHeaders: { [key: string]: object } = {};
          [...manifest.assets, manifest.launchAsset].forEach((asset) => {
            assetRequestHeaders[asset.key] = {
              'test-header': 'test-header-value',
            };
          });
          form.append('extensions', JSON.stringify({ assetRequestHeaders }), {
            contentType: 'application/json',
          });
        } else if (directive) {
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
        // set response headers to match standard: https://docs.expo.dev/technical-specs/expo-updates-1/#common-response-headers
        response.setHeader('expo-protocol-version', 1);
        response.setHeader('expo-sfv-version', 0);
        response.setHeader('cache-control', 'private, max-age=0');
        response.setHeader(
          'content-type',
          `multipart/mixed; boundary=${form.getBoundary()}`,
        );
        response.write(form.getBuffer());

        response.end();
      }),
    );
  }
}
