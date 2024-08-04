var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, BadRequestException, } from '@nestjs/common';
let ProtocolVersionPipe = class ProtocolVersionPipe {
    transform(value, metadata) {
        if (Array.isArray(value)) {
            throw new BadRequestException('Unsupported protocol version. Expected either 0 or 1.');
        }
        const version = parseInt(value ?? '0', 10);
        if (version !== 0 && version !== 1) {
            throw new BadRequestException('Unsupported protocol version. Expected either 0 or 1.');
        }
        return version;
    }
};
ProtocolVersionPipe = __decorate([
    Injectable()
], ProtocolVersionPipe);
export { ProtocolVersionPipe };
//# sourceMappingURL=protocol-version.pipe.js.map