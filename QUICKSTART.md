# Quick Start Guide

## Current Status: Phase 1 - Building the Phaser Game

### What's Done ✅
- Project structure set up
- All dependencies installed (Phaser, Sui SDK, React, etc.)
- Move package initialized
- Environment configs ready
- Backend scaffolded (for future use)

### What's Next 🎯
**Start building the off-chain game in Phaser:**

1. **Game Config** (`frontend/src/game/config.ts`)
   - Basic Phaser configuration
   - Physics setup (Arcade)
   - Scene registration

2. **Main Game Scene** (`frontend/src/game/scenes/GameScene.ts`)
   - Player with WASD movement + mouse aim
   - Shooting system (click to fire)
   - Enemy (Slime) with chase AI
   - Health systems for both
   - Collision detection

3. **Economy System**
   - Shard collectibles
   - Wave spawner
   - Game over with shard count

### Command Reference

```bash
# Frontend development
cd frontend
pnpm dev              # Start dev server

# Move contracts (when ready for Phase 2)
cd contracts/proof_o_slay
one move build        # Build contracts
one move test         # Run tests
one client publish --gas-budget 100000000  # Deploy

# Backend (optional, for post-hackathon)
cd backend
pnpm dev              # Start backend server
```

### File Structure Reference

```
frontend/src/
├── components/          # React UI components (Phase 3)
├── game/
│   ├── config.ts       # Phaser game config - START HERE
│   ├── scenes/
│   │   └── GameScene.ts  # Main gameplay scene
│   ├── entities/       # Entity factories
│   └── systems/        # Game systems (if using ECS)
├── lib/
│   └── suiClient.ts    # Sui blockchain utilities (Phase 3)
├── App.tsx             # Main React app
└── main.tsx            # Entry point
```

### Development Order

Follow the phases in ROADMAP.md:
1. **Phase 1**: Complete playable Phaser game (off-chain)
2. **Phase 2**: Write and deploy Move contracts
3. **Phase 3**: Build React UI for wallet/shop
4. **Phase 4**: Connect game ↔ blockchain
5. **Phase 5**: Polish and test
6. **Phase 6**: Deploy and submit

### Important Files to Reference

- **ROADMAP.md** - Detailed task breakdown by phase
- **GDD.md** - Complete game design document
- **MVP_NOTES.md** - MVP scope and security decisions
- **README.md** - Project overview and setup

### Next Session Start

1. Check ROADMAP.md for completed tasks (look for [x])
2. Pick up from the next unchecked [ ] task
3. Update roadmap as you complete tasks

---

**Remember**: We're building the game FIRST, contracts SECOND, then connecting them. This lets us iterate on gameplay without blockchain complexity.
