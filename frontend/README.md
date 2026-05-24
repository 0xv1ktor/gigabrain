# Giga Brain Frontend

Next.js frontend for the Giga Brain debate arena on GenLayer.

## Setup

```bash
npm install
cp .env.example .env
```

Configure:

- `NEXT_PUBLIC_CONTRACT_ADDRESS`: deployed `GigaBrain` contract address
- `NEXT_PUBLIC_GENLAYER_RPC_URL`: GenLayer RPC URL, defaulting to `https://studio.genlayer.com/api`

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Features

- Create weekly debate rooms with 5-15 minute target durations.
- Join rooms as the second player.
- Submit arguments from both sides.
- Trigger GenLayer AI judgment and validator consensus.
- Track XP distribution on the leaderboard.
