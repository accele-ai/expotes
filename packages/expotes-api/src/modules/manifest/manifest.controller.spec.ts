import type { ApplicationService } from "../application/application.service";
import { ManifestController } from "./manifest.controller";
import type { ManifestService } from "./manifest.service";

it("preserves a rollback response returned by the manifest service", async () => {
	const response = {
		channel: "production",
		directive: {
			type: "rollBackToEmbedded",
			parameters: { commitTime: "2026-10-15T00:00:00Z" },
		},
	};
	const endpoint = jest.fn().mockResolvedValue(response);
	const findOneByHandle = jest.fn().mockResolvedValue({ id: "app-id" });
	const controller = new ManifestController(
		{ endpoint } as unknown as ManifestService,
		{ findOneByHandle } as unknown as ApplicationService,
	);
	await expect(
		controller.manifest(
			{ type: "handle", value: "xinv" },
			{
				protocolVersion: 1,
				platform: "ios",
				runtimeVersion: "fingerprint",
				channel: "production",
			},
		),
	).resolves.toBe(response);
	expect(endpoint).toHaveBeenCalledWith(
		expect.objectContaining({ runtimeVersion: "fingerprint" }),
		"app-id",
	);
});
