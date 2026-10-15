# Expotes

Expotes is a self-hosted server for [Expo Updates protocol v1](https://docs.expo.dev/technical-specs/expo-updates-1/). It imports Metro export ZIP files and delivers JavaScript and assets to compatible native builds.

- iOS, Android, or combined exports, selected by runtime version and platform.
- Separate `preview` and `production` channels.
- RSA-signed manifests and rollback-to-embedded directives.
- Application/channel-scoped publishing tokens for CI.
- PostgreSQL, Redis, and S3-compatible object storage; the Compose example uses RustFS 1.0.1.

## Run locally

Use Docker Compose. Copy `.env.example` to `.env`, then replace the example credentials before starting the services.

```sh
docker compose up -d --build
```

Open the RustFS console at <http://localhost:9101> and create the `expotes` bucket. Follow the [API bootstrap steps](docs/self-hosting.md#create-the-first-account-and-application) to create an account, team, and application, then sign in at <http://localhost:3000/auth/login/>. Object storage buckets must exist before the first publication.

See [self-hosting and CI publishing](docs/self-hosting.md) for native configuration, signing, tokens, export/import, upgrades, and verification. The archived example app uses SDK 51; it is not the SDK 57 acceptance fixture.
