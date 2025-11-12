# Proof O' Slay

A fast-paced, top-down roguelite game built on OneChain (Sui) with true on-chain asset ownership.

## ⚠️ Hackathon MVP Note

**This version uses the honor system for forge verification (no backend signature service).**

Due to hackathon time constraints, we're implementing the simplified version where the frontend directly calls the Move `forge_tokens` function without backend signature verification. This means players could theoretically call the function directly with inflated shard amounts.

**For production deployment**, we would implement the full signature verification system as detailed in Section 5 of the GDD:
- Backend signs shard amounts with ECDSA secp256k1
- Move module verifies signature before minting
- Rate limiting and replay attack prevention

The backend structure is scaffolded and ready for post-hackathon implementation.

## Project Structure

```
one_chain/
├── contracts/proof_o_slay/    # Move smart contracts
│   ├── sources/                # Move source files
│   ├── tests/                  # Move test files
│   └── Move.toml              # Move package config
├── frontend/                   # React + Phaser game
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── game/              # Phaser game logic
│   │   │   ├── scenes/        # Game scenes
│   │   │   ├── entities/      # Entity compositions
│   │   │   └── systems/       # ECS systems
│   │   └── lib/               # Sui SDK utilities
│   └── package.json
└── backend/                    # Signature service (optional)
    ├── src/
    └── package.json
```

## Prerequisites

- Node.js v24+ and pnpm
- Sui CLI (one) - [Installation Guide](https://docs.onelabs.cc/DevelopmentDocument)
- A OneChain testnet wallet with test tokens

## Setup Instructions

### 1. Install Dependencies

```bash
# Frontend
cd frontend
pnpm install

# Backend (optional)
cd backend
pnpm install
```

### 2. Configure Environment

```bash
# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your contract addresses after deployment

# Backend (optional)
cp backend/.env.example backend/.env
# Generate a private key and update SIGNER_PRIVATE_KEY
```

### 3. Build and Deploy Smart Contracts

```bash
cd contracts/proof_o_slay

# Build the Move package
one move build

# Run tests
one move test

# Deploy to testnet
one client publish --gas-budget 100000000

# Save the Package ID, TreasuryCap ID, and Treasury ID from the output
```

### 4. Update Frontend Configuration

Edit `frontend/.env` with the deployed contract addresses:
```
VITE_PACKAGE_ID=0x<your_package_id>
VITE_TREASURY_CAP_ID=0x<your_treasury_cap_id>
VITE_TREASURY_ID=0x<your_treasury_id>
```

### 5. Run Development Servers

```bash
# Frontend (in one terminal)
cd frontend
pnpm dev

# Backend (optional, in another terminal)
cd backend
pnpm dev
```

## Development Workflow

1. **Smart Contracts**: Edit files in `contracts/proof_o_slay/sources/`
2. **Game Logic**: Phaser code goes in `frontend/src/game/`
3. **UI Components**: React components in `frontend/src/components/`
4. **Blockchain Integration**: Sui SDK utilities in `frontend/src/lib/`

## Tech Stack

- **Blockchain**: OneChain (Sui-based) with Move language
- **Frontend**: React + TypeScript + Vite
- **Game Engine**: Phaser 3
- **Web3**: @mysten/sui SDK
- **Backend**: Express + TypeScript (optional signature service)

## Game Architecture

### Entity-Component System (ECS)

The game uses composition over inheritance:
- **Entities**: Player, Enemies, Projectiles, Collectibles
- **Components**: Position, Velocity, Health, Sprite, etc.
- **Systems**: Input, Movement, AI, Collision, Rendering

### On-Chain Assets

- **$SLAY Token**: Sui Coin standard, minted from forged Shards
- **Upgrades**: Owned objects (NFTs) that persist in player's wallet
  - Hero's Armor: +20 max HP
  - Swift Boots: +20% movement speed

## Resources

- [Game Design Document](./GDD.md) - Full design specification
- [OneChain Docs](https://docs.onelabs.cc/DevelopmentDocument)
- [Sui Move Book](https://move-book.com/)
- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)

## License

MIT
