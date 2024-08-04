import { DatabaseService } from 'src/processors/database/database.service';
export declare class DriectiveService {
    private readonly db;
    constructor(db: DatabaseService);
    create(type: string): {
        type: string;
    };
    NoUpdateAvailable(): Promise<{
        type: string;
    }>;
    RollBack(rollbackTime: string): Promise<{
        type: string;
        parameters: {
            commitTime: string;
        };
    }>;
}
