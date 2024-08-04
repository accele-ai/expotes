import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class AssetsQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'No asset name provided.' })
  asset: string;

  @IsString()
  @IsNotEmpty({ message: 'No runtimeVersion provided.' })
  runtimeVersion: string;

  @IsString()
  @IsIn(['ios', 'android'], {
    message: 'No platform provided. Expected "ios" or "android".',
  })
  platform: string;
}
