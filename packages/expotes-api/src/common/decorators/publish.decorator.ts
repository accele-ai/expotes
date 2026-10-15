import { SetMetadata } from "@nestjs/common";

export const Publish = () => SetMetadata("allowPublishToken", true);
