import { DatabaseService } from '@/processors/database/database.service';
import { CreateUserDto, ExtraInfo, LoginUserDto } from '@/modules/user/user.dto';
import { SessionResult, SessionService } from '@/modules/session/session.service';
import { JWEService } from '@/processors/helper/jwe.service';
import { TokenPayload } from '@/common/guards/auth.guard';
export declare class UserService {
    private readonly db;
    private readonly sessionService;
    private readonly jweService;
    constructor(db: DatabaseService, sessionService: SessionService, jweService: JWEService<TokenPayload>);
    create(dto: CreateUserDto): Promise<import("postgres").RowList<never[]>>;
    login(dto: LoginUserDto, extra: ExtraInfo): Promise<SessionResult>;
    findOne(email: string): import("drizzle-orm/pg-core/query-builders/query").PgRelationalQuery<{
        id: string;
        createdAt: Date;
        email: string;
        password: string;
    }>;
    signToken(session: SessionResult): Promise<SessionResult>;
    logoutOne(userId: string, sessionId: string): Promise<void>;
}
