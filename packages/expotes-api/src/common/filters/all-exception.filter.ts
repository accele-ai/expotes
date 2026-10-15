import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>();
		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;
		const body =
			exception instanceof HttpException
				? exception.getResponse()
				: "Internal server error";
		const details =
			typeof body === "string"
				? { message: body }
				: (body as Record<string, unknown>);
		this.logger.warn(
			`Request failed with status ${status}: ${exception instanceof Error ? exception.message : "Unknown error"}`,
		);
		response
			.status(status)
			.type("application/json")
			.send({
				ok: 0,
				code: details.code ?? status,
				chMessage: details.chMessage,
				message: details.message,
			});
	}
}
