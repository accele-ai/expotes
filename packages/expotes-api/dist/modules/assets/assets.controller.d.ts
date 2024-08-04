import { AssetsService } from './assets.service';
import { AssetsQueryDto } from './assets.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAssets(query: AssetsQueryDto): void;
}
