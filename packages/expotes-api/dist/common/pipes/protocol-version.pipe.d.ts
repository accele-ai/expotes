import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class ProtocolVersionPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): 0 | 1;
}
