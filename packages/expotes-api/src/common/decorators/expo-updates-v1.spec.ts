import { parseExpoUpdatesRequest } from "./expo-updates-v1";

const headers = {
	"expo-protocol-version": "1",
	"expo-platform": "ios",
	"expo-runtime-version": "a1b2c3d4e5f67890",
	"expo-current-update-id": "0192ED27-9C91-7CF6-A1DC-03A224B60E9C",
	"expo-embedded-update-id": "0192ed27-9c91-7cf6-a1dc-03a224b60e9d",
};

describe("Expo Updates request", () => {
	it("preserves fingerprint runtimes and normalized update identifiers", async () => {
		await expect(parseExpoUpdatesRequest(headers)).resolves.toEqual({
			protocolVersion: 1,
			platform: "ios",
			runtimeVersion: "a1b2c3d4e5f67890",
			currentUpdateId: headers["expo-current-update-id"].toLowerCase(),
			embeddedUpdateId: headers["expo-embedded-update-id"],
			channel: "production",
		});
	});

	it("accepts semantic runtimes and selects preview from the URL", async () => {
		await expect(
			parseExpoUpdatesRequest(
				{ ...headers, "expo-runtime-version": "1.0.0" },
				{ channel: "preview" },
			),
		).resolves.toMatchObject({ runtimeVersion: "1.0.0", channel: "preview" });
	});

	it("uses the explicit channel header before the URL channel", async () => {
		await expect(
			parseExpoUpdatesRequest(
				{ ...headers, "expo-channel-name": "preview" },
				{ channel: "production" },
			),
		).resolves.toMatchObject({ channel: "preview" });
	});

	it.each([
		["expo-protocol-version", "2"],
		["expo-platform", "web"],
		["expo-platform", undefined],
		["expo-runtime-version", undefined],
		["expo-runtime-version", ""],
		["expo-current-update-id", "invalid"],
		["expo-channel-name", "unknown"],
	])("rejects invalid %s", async (name, value) => {
		await expect(
			parseExpoUpdatesRequest({ ...headers, [name]: value }),
		).rejects.toThrow("Invalid Expo Updates");
	});
});
