import { DatabaseService } from "@/processors/database/database.service";
import { cdnProviderTable } from "@db/schema";
import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { TencentCDN } from "./tencent.cdn";

@Injectable()
export class CDNService {
	constructor(private readonly db: DatabaseService) {}

	private async getCDN(cdnId: number) {
		const cdn = await this.db.query.cdnProviderTable.findFirst({
			where: eq(cdnProviderTable.id, cdnId),
		});
		if (!cdn) {
			throw new Error("CDN not found");
		}
		return cdn;
	}

	async getCDNProvider(cdnId: number) {
		const cdn = await this.getCDN(cdnId);
		switch (cdn.type) {
			case "tencent-cdn":
				return new TencentCDN({
					url: `${cdn.protocol}://${cdn.host}`,
					key: cdn.options.key,
					key2: cdn.options.key2,
					type: cdn.options.type,
				});
			// case 'aws':
			//   return new AWSCDN(cdn.config);
			// case 'cloudflare':
			//   return new CloudflareCDN(cdn.config);
			default:
				throw new Error("Invalid CDN provider");
		}
	}
}
