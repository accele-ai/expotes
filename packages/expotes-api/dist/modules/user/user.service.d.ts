import { DatabaseService } from '@/processors/database/database.service';
import { CreateUserDto, ExtraInfo, LoginUserDto } from '@/modules/user/user.dto';
import { SessionResult, SessionService } from '@/modules/session/session.service';
export declare class UserService {
    private readonly db;
    private readonly sessionService;
    constructor(db: DatabaseService, sessionService: SessionService);
    create(dto: CreateUserDto): Promise<import("postgres").RowList<never[]>>;
    login(dto: LoginUserDto, extra: ExtraInfo): Promise<SessionResult>;
    findOne(email: string): import("drizzle-orm/pg-core/query-builders/query").PgRelationalQuery<{
        id: string;
        createdAt: Date;
        email: string;
        password: string;
    }>;
    logoutOne(userId: string, sessionId: string): Promise<void>;
}
