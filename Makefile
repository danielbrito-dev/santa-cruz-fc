.PHONY: dev build test test-watch coverage mutation lint typecheck db-generate db-migrate seed

dev:
	npm run dev
build:
	npm run build
test:
	npm run test
test-watch:
	npm run test:watch
coverage:
	npm run coverage
mutation:
	npm run mutation
lint:
	npm run lint
typecheck:
	npm run typecheck
db-generate:
	npx drizzle-kit generate
db-migrate:
	npx drizzle-kit migrate
seed:
	npx tsx server/db/seed.ts
