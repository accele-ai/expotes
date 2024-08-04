import { ManifestService } from './manifest.service';
import { ExpoUpdatesV1Dto } from 'src/common/decorators/expo-updates-v1';
export declare class ManifestController {
    private readonly manifestService;
    constructor(manifestService: ManifestService);
    manifest(meta: ExpoUpdatesV1Dto): any;
}
