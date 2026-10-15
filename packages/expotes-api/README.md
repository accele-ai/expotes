# Expotes API

NestJS API for update publication, Expo Updates protocol v1 delivery, assets, and Dashboard administration.

Read the repository's [self-hosting guide](../../docs/self-hosting.md) for environment variables, RustFS setup, signing, CI publishing, migration, and integration tests.

From the repository root:

```sh
pnpm --filter @expotes/api build
pnpm --filter @expotes/api typecheck
pnpm --filter @expotes/api exec jest --runInBand
```
