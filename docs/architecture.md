# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Each React route component calls `getJson` from the shared API client with a relative `/api` path. The shared card renders results and accessible loading, empty, and error states.
- Logic tier decision: Keep HTTP handling in Express routes and business rules in backend services. Validate request fields, ObjectId formats, and referenced records before writes, returning deliberate 4xx responses for invalid or unknown input.
- Data tier decision: Use Mongoose schemas to enforce required fields and references, and keep repeatable sample records in the seed script. Do not add authentication.
- Activity tracking approach: Validate the user and team, then create an activity with the submitted type and minutes, points computed deterministically from minutes, and an occurrence timestamp defaulting to the current time. Use the stored points for leaderboard totals.
- Team management approach: Require a name, preserve the submitted name and mascot, and store member references. Return created and listed teams with their members.
- Leaderboard approach: Aggregate activity points by team, sort by total points descending with team name ascending as a deterministic tie-breaker, and assign 1-based ranks.
- Workout suggestions approach: Find the user by email, use recent activity as the primary signal and the user's fitness goal as a fallback, and return matching workouts with a reason. Return a deliberate 4xx when no user matches.

## Test plan

- `npm run test:data --prefix octofit-tracker/backend` — checks Mongoose model contracts. Current result: 4 failed, 1 passed; failures indicate missing required-field validation for users, teams, activities, or workouts.
- `npm run test:api --prefix octofit-tracker/backend` — checks API validation, persistence, leaderboard aggregation, and workout recommendations. Current result: 4 failed; failures indicate invalid requests return `501`, leaderboard results are empty, and recommendations do not match user activity.
- `npm test --prefix octofit-tracker/frontend` — checks API-backed rendering and accessible loading, empty, and error states.
- `node .github/scripts/grade-step.mjs step4-frontend` — runs the same static check as the Step 4 workflow, including whether each route component imports and calls the shared API client directly.
- `npm run build --prefix octofit-tracker/backend` — checks backend TypeScript compilation. Current result: passed.
- `npm run build --prefix octofit-tracker/frontend` — checks frontend TypeScript compilation and production bundling. Current result: passed.
