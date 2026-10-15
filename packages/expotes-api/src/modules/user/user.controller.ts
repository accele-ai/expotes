import { ApiController } from "@/common/decorators/api-controller.decorator";
import { Owner } from "@/common/decorators/get-owner-decorator";
import { Get } from "@nestjs/common";
import { ISessionPayload } from "../session/session.dto";
import { IUserDto } from "./user.dto";
import { UserService } from "./user.service";

@ApiController("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("me")
	me(@Owner() owner: ISessionPayload): IUserDto {
		return {
			email: owner.email,
			userId: owner.userId,
		};
	}
}
