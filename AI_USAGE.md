# AI Usage

The assignment asks for an honest disclosure of how AI tools were used during development, what I accepted, what I rejected, and the checks I performed myself. This file answers each of the seven questions the rubric lists, in order, with concrete examples.

## 1. Which AI tools did I use?

I used **Anthropic Claude** as an in-editor coding assistant. No other AI tools were used — no Copilot, no browser-based ChatGPT, no external command-line agents. Every interaction took place inside a single editor session with direct access to my workspace files and a sandboxed shell.

## 2. What parts of the assignment did I use AI for?

I wrote the bulk of the application myself: the React frontend (the Tasks page, the Dashboard, the hooks, the components, the Keycloak provider wiring), the Express backend (the application bootstrap, the routes, the controllers, the services, the SQL migration, the JWT verifier), the Docker Compose definition, the database schema, every product decision, and all of the debugging. The architecture choices, the trade-offs, and the security-sensitive code are mine.

I used AI for a small number of specific, well-scoped sub-tasks:

The two database scripts in `scripts/` (`backup-db.sh` and `restore-db.sh`). I wrote a detailed specification of what each script had to do — input format, output path, container name, confirmation prompt, error handling — and asked the AI to translate that specification into Bash. I accepted both scripts almost verbatim and then asked the AI to walk me through each line so that I could defend the code in a review.

The Keycloak realm export in `keycloak/realm-export.json`. I first configured the realm by hand in the Keycloak admin console to learn what the moving parts are — the realm itself, a public client with the correct redirect URI and web origin, two realm roles, and two test users. Once I understood the structure, I asked the AI to produce an importable JSON file that reproduces the same setup so reviewers do not need to repeat the manual steps. I verified the file by deleting the Keycloak volume and re-running `docker compose up`, confirming that both users could sign in cleanly.

The decision to switch from Sequelize to `pg`. I had started the backend with Sequelize as the ORM but found myself spending more time on model definitions and Postgres enum quirks than on the actual business logic. I asked the AI for an analysis — explicitly not for code — of whether dropping Sequelize in favour of parameterised `pg` queries was a reasonable choice for a project with one main table and a handful of queries. The reply confirmed that Sequelize was offering no value at this scale. I then rewrote `config/db.ts`, the services, and the migration myself.

A code-organisation pass over files I had already written. I asked the AI to look at both `frontend/src/` and `backend/src/`, without changing behaviour, and propose better names, extract anything duplicated across multiple files into a shared module, flag any naming conflicts, and consolidate folders that had stragglers. The AI proposed `lib/errors.ts` and `lib/taskLabels.ts` on the frontend, renamed the Axios export from `api` to `http` to avoid a local variable collision, and folded a stray `middleware/` directory into the existing `middlewares/` directory on the backend. Every suggested change matched what I would have done myself, just faster.

A responsiveness audit on the frontend. I had written the original Tailwind layout, but several screens behaved badly on phone widths. I asked the AI for a targeted audit — what was overflowing on small viewports, where the typography was too large, where pie chart labels were spilling out of their container. The result was a new `xs` breakpoint in the Tailwind theme and tightened paddings and font sizes across the layouts.

I also used the AI for conceptual questions throughout the build: what `helmet` does and which middlewares it ships, what `jwks-rsa` provides on top of `jsonwebtoken`, why a Postgres enum needs an explicit `CAST(... AS task_status)` when bound through the `pg` driver, what the difference is between `KC_HOSTNAME_URL` and `KC_HOSTNAME` in newer Keycloak versions. I used the explanations to make my own decisions rather than to dictate the code.

## 3. What prompts were most useful?

The pattern that consistently worked was a fully scoped prompt that left no room for invention. Three examples used in this project, in their actual wording:

**Prompt 1 — the database scripts.**

> "Write two bash scripts for PostgreSQL backup and restore using Docker. `scripts/backup-db.sh` should: read DB connection details from the `.env` file, run `pg_dump` inside the postgres Docker container using `docker exec`, save the output to `backups/task-manager-$(date +%Y-%m-%d-%H%M%S).sql`, create the backups directory if it does not exist, print a success message with the filename. `scripts/restore-db.sh` should: accept the backup file path as argument `$1`, validate the file exists, warn the user this will overwrite the database and ask for confirmation, run `psql` inside the postgres Docker container to restore from the file, print success or failure. Both scripts must be executable and handle errors with clear messages. Include a comment header in each script explaining what it does."

The prompt left no room for invention. The AI translated the specification to Bash and I accepted the output after reading every line.

**Prompt 2 — the Keycloak realm export.**

> "I already set up the `task-manager` realm in the Keycloak admin UI by hand — created the realm, registered a `taskmanager-frontend` public client with `http://localhost:3000/*` as the valid redirect URI and web origin, and added an `admin` and a `user` realm role. I want to remove that manual step for whoever runs this project. Generate a `keycloak/realm-export.json` that imports the same realm, the same client config, both roles, and seeds two test users: `admin@example.com` (password `admin`, role `admin`) and `user@example.com` (password `password`, role `user`). The file must be auto-importable on container start via `start-dev --import-realm`."

This prompt worked because the manual setup had already taught me what each field should look like, so I could verify the generated JSON line by line.

**Prompt 3 — the ORM decision.**

> "I started this backend using Sequelize as the ORM but I am spending way more time on Sequelize model definitions, migrations, and Postgres enum quirks than on actual business logic. The data model is small (one `tasks` table, owner-scoped queries). Is `pg` directly with parameterised queries a reasonable swap? What would I lose? Do not rewrite my code — just lay out the trade-off and a migration plan."

The explicit instruction to provide analysis rather than code is what made this prompt useful. The AI told me what Sequelize offered, what I would give up, and a step-by-step migration plan. The actual rewrite was mine.

## 4. What AI-generated code did I accept?

I accepted the two Bash scripts in `scripts/` almost verbatim after reading every line; the structure matched my specification, the use of `docker exec -t` for the backup (which writes to stdout) and `docker exec -i` for the restore (which reads from stdin) was correct, and the confirmation prompt in the restore script was the safety net I wanted.

I accepted the `keycloak/realm-export.json` file after verifying it by deleting the Keycloak volume, restarting the stack, and confirming both test users could sign in. I later added stable `id` fields to both users (UUIDs `00000000-0000-0000-0000-000000000001` and `00000000-0000-0000-0000-000000000002`) so that task ownership survives a `docker compose down -v` — this was a fix I diagnosed myself after the first end-to-end backup-and-restore test failed.

I accepted the refactor edits from the code-organisation pass: the introduction of `frontend/src/lib/errors.ts` and `frontend/src/lib/taskLabels.ts` to avoid duplication, the rename of the Axios export from `api` to `http` to remove a local variable collision, and the folder consolidation from `middleware/` into `middlewares/` on the backend. I accepted the responsiveness fixes after walking through them in DevTools across phone, tablet, and desktop widths.

I also accepted prose phrasing in this file and in `docs/architecture.md` where the AI helped me state things more directly. The technical content is mine; the AI helped me type the explanations faster.

## 5. What AI-generated code did I reject or modify?

I rejected an early scaffold that put Nginx in the frontend Dockerfile, on the grounds that Nginx is an unnecessary moving part for a development demo. I replaced it with a single-stage Dockerfile that runs `vite preview` against the built bundle.

I rejected two `.npmrc` files that the AI added "to fix" what it described as a pnpm sandbox quirk. The problem did not reproduce on my machine and the files were unnecessary, so I deleted both.

I rejected a `frontend/src/lib/cn.ts` utility for merging Tailwind class names with `clsx`-style semantics. I was not using `clsx` anywhere and the utility was solving a problem I did not have, so I removed it.

I rejected the first landing-page draft because it looked machine-generated: it had a pill badge above the headline, a marketing two-tone gradient, three feature cards with emoji icons, and a "Built with X, Y, Z" footer. I rewrote it to a single hero section sized to one viewport height, with grounded copy and the same indigo check-mark logo used in the navigation bar.

I rejected the use of the `::task_status` Postgres cast shorthand in the task service. It is concise but cryptic to anyone not used to Postgres, so I asked the AI to replace it with the SQL-standard `CAST($3 AS task_status)` everywhere.

I rejected a `config.headers ?? {}` fallback in the Axios request interceptor on the frontend. In Axios v1, `config.headers` is an `AxiosHeaders` class instance and not a plain object, so the fallback was both unnecessary and type-broken. I replaced it with `config.headers.set('Authorization', `Bearer ${keycloak.token}`)`, which is the supported pattern.

## 6. What security and correctness checks did I personally perform?

I read every SQL query in `tasksService.ts` and `analyticsService.ts` line by line to confirm that the `WHERE owner_id = $X` clause is present on every code path and that the value of `$X` comes from `req.user.id` (the JWT `sub` claim) and never from a user-supplied field.

I confirmed that the auth middleware sets `algorithms: ['RS256']` on `jwt.verify`, which rejects forged tokens that try to use `alg: none`. I confirmed that the `issuer` is checked against `KEYCLOAK_PUBLIC_URL` so that a token issued by any other realm or instance is rejected. I confirmed that expired, missing, and malformed tokens all return 401 rather than being silently accepted.

I discovered and fixed an issuer mismatch between the backend and the browser. The backend was originally validating against the internal Docker URL (`http://keycloak:8080`), but the browser was getting tokens whose `iss` claim contained the public URL (`http://localhost:18080`). I introduced a separate `KEYCLOAK_PUBLIC_URL` variable for issuer validation and kept `KEYCLOAK_URL` for the internal JWKS fetch.

I noted that `app.use(cors())` is wide open and acceptable for a local development demo only. This is documented in the known-limitations section of the README, along with the production fix.

I verified that no real secrets live in `.env.example`. The values committed there are intentional local-development defaults marked with `local_` prefixes, and the file header tells the next reader to rotate every value before any non-local use. The real `.env` is gitignored.

I traced the cache invalidation flow end to end. After creating a task in the UI, I tailed `docker compose logs -f backend` and confirmed that a line beginning with `[cache] invalidated N key(s)` appears, and that the next dashboard refresh produces a `MISS` log line rather than a `HIT`.

I confirmed that the migration runner is idempotent by restarting the backend container twice without wiping volumes; no errors come back from `CREATE TYPE` or `CREATE TABLE` because the migration uses `IF NOT EXISTS` and a DO-block guard for the enum types.

I confirmed that the Keycloak realm import is idempotent by restarting Keycloak twice without `docker compose down -v`; the second start skips the realm import because the realm already exists.

I confirmed that there is no SQL string interpolation anywhere in the code. Every query uses parameterised `$1`, `$2`, ... placeholders.

I diagnosed and fixed a separate issue with the backup-and-restore cycle. The first end-to-end test failed because Keycloak was generating new random UUIDs for the two seeded users on every realm import, while the backup file still held tasks tied to the previous UUIDs. The fix was to pin both users to stable UUIDs in `realm-export.json`. After the fix, the cycle survives a full `docker compose down -v`.

## 7. What would I improve with one more day?

I would add integration tests using Vitest and supertest. The most important single test is the owner-scoping rule: user A cannot read, update, or delete a task owned by user B, and the response must be 404 rather than 403 so that existence is not leaked. A handful of supertest cases around `/api/tasks` and `/api/analytics/*` would cover the rest of the contract.

I would replace the hand-rolled validators in `tasksController.ts` with `zod` schemas. The current implementation works, but `zod` would centralise the rules per route, produce consistent error responses, and make new fields trivial to add.

I would add health-check blocks for the backend and Keycloak in `docker-compose.yml`. Postgres and Redis already have them; once the backend and Keycloak do too, `depends_on: { condition: service_healthy }` works end-to-end and a fresh `docker compose up` would not race past services that are still warming up.

I would wire up the `admin` realm role. The role exists in the realm export but the backend currently treats every authenticated user identically. With more time I would read `realm_access.roles` from the JWT, expose a `requireRole('admin')` middleware, and gate an admin-only `/api/admin/*` namespace.

I would add a minimal GitHub Actions workflow that runs `pnpm exec tsc --noEmit` for both the backend and the frontend on every pull request. About 30 lines of YAML.

I would tighten the CORS configuration by replacing `app.use(cors())` with `cors({ origin: process.env.FRONTEND_URL })`. A one-line change and a new environment variable.
