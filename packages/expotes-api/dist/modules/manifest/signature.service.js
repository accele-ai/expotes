var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
import { Injectable } from '@nestjs/common';
import { DatabaseService } from "../../processors/database/database.service";
let SignatureService = class SignatureService {
    constructor(db) {
        this.db = db;
    }
};
SignatureService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof DatabaseService !== "undefined" && DatabaseService) === "function" ? _a : Object])
], SignatureService);
export { SignatureService };
//# sourceMappingURL=signature.service.js.map