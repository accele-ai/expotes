"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_service_1 = require("../../processors/database/database.service");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const bcrypt_1 = require("bcrypt");
const system_config_1 = require("../../constants/system.config");
const db_1 = require("@expotes/db");
const drizzle_orm_1 = require("drizzle-orm");
const session_service_1 = require("../session/session.service");
const jwe_service_1 = require("../../processors/helper/jwe.service");
let UserService = class UserService {
    constructor(db, sessionService, jweService) {
        this.db = db;
        this.sessionService = sessionService;
        this.jweService = jweService;
    }
    async create(dto) {
        try {
            const hashedPassword = await (0, bcrypt_1.hash)(dto.password, system_config_1.SALT_ROUNDS);
            return await this.db.insert(db_1.usersTable).values({
                id: (0, uuid_1.v4)(),
                email: dto.email,
                password: hashedPassword,
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async login(dto, extra) {
        try {
            const hashedPassword = await (0, bcrypt_1.hash)(dto.password, system_config_1.SALT_ROUNDS);
            const user = await this.findOne(dto.email);
            if (!(user && user.password === hashedPassword)) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            return this.sessionService.create(user.id, {
                email: user.email,
                createdAt: new Date(),
                extra: extra,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            throw new common_1.InternalServerErrorException('Failed to login');
        }
    }
    findOne(email) {
        try {
            return this.db.query.usersTable.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.usersTable.email, email),
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async signToken(session) {
        return {
            value: await this.jweService.encrypt({
                token: session.value,
            }),
            expires: session.expires,
        };
    }
    async logoutOne(userId, sessionId) {
        await this.sessionService.revokeOne(userId, sessionId);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        session_service_1.SessionService,
        jwe_service_1.JWEService])
], UserService);
//# sourceMappingURL=user.service.js.map