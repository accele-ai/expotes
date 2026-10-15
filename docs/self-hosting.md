# Self-hosting and CI publishing

## Runtime and storage

The API uses Node.js 24.19.0, pnpm 9.12.3, PostgreSQL, Redis, and S3-compatible storage. The Docker build installs the locked dependencies and builds the API, SDK, and static Dashboard. SDK generation does not require running services or credentials. Production startup applies Drizzle migrations before listening on port 3000.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL. |
| `REDIS_URL` | Redis connection URL. |
| `API_URL` | Public origin, without a trailing slash, used in asset URLs. Use HTTPS for native clients. |
| `PORT` | HTTP port; defaults to `3000`. |
| `S3_ENDPOINT` | S3 hostname without a scheme; RustFS is supported. |
| `S3_PORT` | S3 port; defaults to `9000`. |
| `S3_USE_SSL` | `true` or `false`; defaults to `false`. |
| `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Required object storage credentials. |
| `S3_BUCKET` | Existing bucket; defaults to `expotes`. |
| `S3_REGION` | Optional storage region. |
| `PRIVATE_KEY_PATH` | Readable PEM RSA signing key path. Required when clients request signatures. |
| `PRIVATE_KEY_ID` | Signing key ID; defaults to `main`. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Optional GitHub login credentials. Email/password login remains available. |

The Compose example binds public ports to localhost. Put the API behind an HTTPS reverse proxy for device access. Set `API_URL` to that external origin. Mount the signing key read-only and set `PRIVATE_KEY_PATH` in the API container. Keep the key outside the image and repository.

Create the bucket before uploading. A production API credential needs object read, write, and delete permissions; the API does not create buckets. The Compose example uses the RustFS administrator credential for local setup. Replace the API's `S3_ACCESS_KEY` and `S3_SECRET_KEY` with a scoped service credential in production.

The `minio` npm package is retained as an S3 client; the default server is RustFS. Stored provider types `s3` and `minio` use this client. Existing `MINIO_*` environment variables remain supported only when the corresponding `S3_*` variable is absent. New configurations should use `S3_*`.

## Upgrade an existing installation

Back up PostgreSQL and object storage before starting the new image. Migration `0003_sdk57-update-delivery` backfills each old asset key from its object path, leaves old platform fields `NULL` for shared assets, and assigns existing updates to `production`. New uploads record the platform explicitly.

Changing the Compose service to RustFS does not copy an existing MinIO bucket. Keep the old store reachable until you copy its objects to RustFS and verify the same keys and hashes. The new RustFS volume has a separate name. Do not mount a MinIO data directory directly as a RustFS data directory. Update provider records or storage environment variables only after the copy succeeds.

Existing teams may have no administrator because earlier versions created the owner with the default `user` role. Team membership changes and deletion now require an active administrator. The migration does not assign that role automatically. A database operator must verify the intended owner and team, then run the following SQL with the selected UUIDs:

```sql
SELECT u.id AS user_id, u.email, t.id AS team_id, t.handle, m.role, m.is_suspended
FROM users_to_teams m
JOIN users u ON u.id = m.user_id
JOIN teams t ON t.id = m.team_id;

UPDATE users_to_teams
SET role = 'admin', is_suspended = false
WHERE user_id = 'VERIFIED_USER_UUID' AND team_id = 'VERIFIED_TEAM_UUID'
RETURNING user_id, team_id, role;
```

Verify that the update returns exactly the intended membership. New teams assign the creator the `admin` role.

## Create the first account and application

The Dashboard supports sign-in and update publishing. Account registration, team creation, and application creation currently use the API. Use `curl` and `jq` for this one-time setup. Store the password and session cookie in a private temporary directory:

```sh
umask 077
bootstrap_dir="$(mktemp -d)"
EXPOTES_URL=http://localhost:3000
```

Save the following JSON as `$bootstrap_dir/register.json`, replacing the example email and password:

```json
{"email":"owner@example.com","password":"REPLACE_WITH_A_UNIQUE_PASSWORD"}
```

Register the account and save its session cookie. For an existing account, use `/api/v1/auth/login` with the same request shape instead.

```sh
curl --fail-with-body --silent --show-error \
  -H "Content-Type: application/json" \
  --data-binary "@$bootstrap_dir/register.json" \
  --cookie-jar "$bootstrap_dir/session.cookies" \
  --output /dev/null \
  "$EXPOTES_URL/api/v1/auth/register"
```

Save the team details as `$bootstrap_dir/team-request.json`. Choose a unique handle of at most 15 characters:

```json
{"name":"My team","handle":"my-team"}
```

Create the team and extract its UUID:

```sh
curl --fail-with-body --silent --show-error \
  -H "Content-Type: application/json" \
  --cookie "$bootstrap_dir/session.cookies" \
  --data-binary "@$bootstrap_dir/team-request.json" \
  --output "$bootstrap_dir/team.json" \
  "$EXPOTES_URL/api/v1/team/create"
TEAM_ID="$(jq -r '.id' "$bootstrap_dir/team.json")"
```

Create the application. The `teamId` body field must match the authorized `expotes-team-id` header:

```sh
jq -n --arg teamId "$TEAM_ID" \
  '{name: "My app", handle: "my-app", teamId: $teamId}' \
  > "$bootstrap_dir/application-request.json"
curl --fail-with-body --silent --show-error \
  -H "Content-Type: application/json" \
  -H "expotes-team-id: $TEAM_ID" \
  --cookie "$bootstrap_dir/session.cookies" \
  --data-binary "@$bootstrap_dir/application-request.json" \
  --output "$bootstrap_dir/application.json" \
  "$EXPOTES_URL/api/v1/application/create"
jq -r '.[0].id' "$bootstrap_dir/application.json"
```

Save the returned application UUID for the native configuration and publishing token. Remove the temporary directory after setup with `rm -r "$bootstrap_dir"`. Sign in at `/auth/login/` to use the Dashboard.

## Configure the native application

Install `expo-updates` with the Expo CLI in the application repository. Configure the public manifest endpoint, a runtime policy, and the channel before building the native binary:

```json
{
  "expo": {
    "runtimeVersion": { "policy": "fingerprint" },
    "updates": {
      "url": "https://updates.example.com/api/v1/manifest/APP_ID",
      "requestHeaders": { "expo-channel-name": "production" },
      "codeSigningCertificate": "./certs/update-certificate.pem",
      "codeSigningMetadata": { "keyid": "main", "alg": "rsa-v1_5-sha256" }
    }
  }
}
```

Use the application UUID or handle in the manifest URL. The server also accepts `?channel=preview`; the `expo-channel-name` header takes precedence. The default channel is `production`. Runtime versions are opaque strings, including fingerprints. Native dependency or configuration changes require a new native build with its new runtime version. Existing store binaries without `expo-updates` cannot receive OTA updates.

Follow [Expo code signing](https://docs.expo.dev/eas-update/code-signing/) to generate the certificate and matching private key. The certificate is embedded in the native build; the private key stays on the update server. This implementation signs responses online. Offline CI signing and per-application signing keys are not implemented.

## Issue a CI publishing token

An operator with database access creates a token scoped to one application and one channel. Choose an explicit future expiration:

```sh
docker compose exec expotes node scripts/publish-token.mjs create APP_UUID production 2027-01-01T00:00:00Z
```

The command prints JSON containing the token ID and secret. Save the secret to 1Password and inject it into the release job as `EXPOTES_TOKEN`; do not print the token in CI. The database stores only its SHA-256 hash. Save the ID separately for revocation:

```sh
docker compose exec expotes node scripts/publish-token.mjs revoke TOKEN_UUID
```

Bearer tokens authorize only `POST /api/v1/updates/create` and `POST /api/v1/updates/rollback`. They cannot read Dashboard/admin APIs. App and channel scope are checked before publication; storage/CDN providers must belong to the application's team. Dashboard publishing uses the existing session cookie and `expotes-team-id` membership instead.

## Export and publish from GitLab

Run export in the application's existing job after its pinned tool setup and dependency installation. No EAS Update subscription is required. Use the exact runtime version of the native build that should receive the update. For platform-specific fingerprints, publish each platform separately with its matching runtime; use a combined ZIP only when both native builds share that runtime.

```sh
pnpm exec expo export --platform ios --output-dir dist
(cd dist && zip -qr ../update.zip .)
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer ${EXPOTES_TOKEN}" \
  -F "appId=${EXPOTES_APP_ID}" \
  -F "channel=production" \
  -F "runtimeVersion=${EXPO_RUNTIME_VERSION}" \
  -F "notes=${CI_COMMIT_SHA}" \
  -F "file=@update.zip;type=application/zip" \
  "${EXPOTES_URL}/api/v1/updates/create"
```

Archive the contents of `dist`, with `metadata.json` at the ZIP root. iOS-only, Android-only, and combined Metro metadata are supported. The compressed limit is 256 MiB; the declared total uncompressed limit is 512 MiB. Path traversal, duplicate files, missing referenced assets, and invalid metadata are rejected.

Omit `options` to use default storage. To select team-owned providers, add an `options` form field such as `{"storage":[{"providerId":1,"cdnIds":[]}]}`. An empty CDN list uses the stable API asset endpoint. Unsigned CDNs can serve assets directly; expiring signed CDN URLs use the API proxy so a manifest does not contain URLs that later expire. Keep provider configuration stable for published releases.

Treat any non-2xx response as a failed release. Upload failures remove objects created by that upload. Database failures retain uploaded objects because the commit may already have succeeded; an operator may later remove confirmed unreferenced objects. Do not blindly retry a failed publication: check whether the release committed first.

## Roll back to the embedded update

Create a JSON file containing `appId`, `channel`, and the published `manifestId`, then send it to the rollback endpoint:

```json
{"appId":"APP_UUID","channel":"production","manifestId":"MANIFEST_UUID"}
```

```sh
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer ${EXPOTES_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @rollback.json \
  "${EXPOTES_URL}/api/v1/updates/rollback"
```

Only the latest release for every platform included in that release can be rolled back. Repeating the operation preserves the original rollback time. Clients with protocol v1 receive `rollBackToEmbedded`; clients already running the embedded update receive `204`. This returns to the native binary's embedded bundle, not the previous OTA release. Publish a new release to resume OTA delivery.

## Verify changes

```sh
pnpm install --frozen-lockfile
pnpm --filter @expotes/api typecheck
pnpm --filter @expotes/api exec jest --runInBand
pnpm --filter @expotes/api build
pnpm --filter @expotes/sdk build
pnpm --filter expotes-dashboard typecheck
pnpm --filter expotes-dashboard build
pnpm check
pnpm lint
```

For the real HTTP integration test, set `E2E_DATABASE_URL`, `E2E_REDIS_URL`, `E2E_S3_ENDPOINT`, `E2E_S3_PORT`, `E2E_S3_ACCESS_KEY`, and `E2E_S3_SECRET_KEY`. The database user must be able to create/drop a temporary database. The storage credential must be able to create/delete a temporary bucket. Use a dedicated test Redis database. Optional settings are `E2E_S3_USE_SSL` and `E2E_PORT`.

```sh
pnpm --filter @expotes/api build
pnpm --filter @expotes/api exec jest --config test/jest-e2e.json --runInBand
```

The fixture launches the built API with production migrations and verifies legacy migration, platform exports, publishing scope, asset hashes, signatures, no-update responses, and rollback against real services. Device/TestFlight verification remains necessary before enabling production OTA delivery.
