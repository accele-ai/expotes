// protocol-version.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ProtocolVersionPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (Array.isArray(value)) {
      throw new BadRequestException(
        'Unsupported protocol version. Expected either 0 or 1.',
      );
    }
    const version = parseInt(value ?? '0', 10);
    if (version !== 0 && version !== 1) {
      throw new BadRequestException(
        'Unsupported protocol version. Expected either 0 or 1.',
      );
    }
    return version;
  }
}
