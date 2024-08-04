import { UpdatesService } from './updates.service';
export declare class UpdatesController {
    private readonly uploadService;
    constructor(uploadService: UpdatesService);
    uploadFile(file: Express.Multer.File): Promise<any>;
}
