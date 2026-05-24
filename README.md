# Giga Brain

Giga Brain is a GenLayer mini-game built from the official project boilerplate.
It is an AI Judge Debate Arena: two players enter a room, submit arguments on a
topic, and let a GenLayer Intelligent Contract ask an LLM to judge the debate.
Validators then decide whether the subjective judgment is reasonable through
Optimistic Democracy.

## Game Rules

- Multiplayer rooms: one creator and one challenger.
- Runtime target: each room declares a 5-15 minute debate window.
- Weekly replayability: rooms include a `season` such as `2026-W22`.
- AI consensus: the contract uses `gl.nondet.exec_prompt` plus a custom
  validator around the proposed verdict.
- XP leaderboard: winner receives 100 XP, runner-up receives 40 XP.

## Project Layout

- `contracts/giga_brain.py`: GenLayer Intelligent Contract for debate rooms,
  AI judgment, validator checks, and XP distribution.
- `deploy/deployScript.ts`: deploys the Giga Brain contract.
- `frontend/`: Next.js app for room creation, joining, argument submission,
  judging, wallet connection, and leaderboard display.

## Run

Install the GenLayer CLI:

```shell
npm install -g genlayer
```

Deploy the contract:

```shell
genlayer network
genlayer deploy
```

Create `frontend/.env` with the deployed address:

```shell
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
```

Run the frontend:

```shell
cd frontend
npm install
npm run dev
```

Open the local URL shown by Next.js, usually `http://localhost:3000`.
# gigabrain
