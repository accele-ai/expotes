import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class SignatureInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
