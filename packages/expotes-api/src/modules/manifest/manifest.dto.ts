// assets-query.dto.ts
import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class ManifestQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'No runtimeVersion provided.' })
  'runtime-version': string;

  @IsIn(['ios', 'android'], {
    message: 'Unsupported platform. Expected either ios or android.',
  })
  platform: 'ios' | 'android';
}
