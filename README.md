# OTHERWISE

> **"There is always another way."**

An original 2D systemic adventure puzzle platformer created for the **BTT Web Game Jam, Summer 2026**.

---

## 🌟 Elevator Pitch
In a fragmented storybook world where objects have forgotten what they are supposed to want, you play as a curious creature who discovers abstract **Concepts** (such as *Fear*, *Lonely*, *Curiosity*, *Trust*, *Greed*, *Protection*, *Stubbornness*, and *Slumber*) and assigns them to entities. When you change what things want, the world changes how they behave — yielding surprising, emergent solutions to environmental puzzles.

---

## 🎮 Core Mechanics & Concepts

### The Intention Loop
Instead of traditional rigid keys and switches, puzzles in **OTHERWISE** emerge from psychological intentions:
$$\text{Object} + \text{Concept} \longrightarrow \text{New Desire} \longrightarrow \text{Physical Action}$$

### The 13 Concepts
1. **FEAR**: The entity perceives threats (like the player or hazards) and actively flees from them.
2. **LONELY**: The entity seeks compatible companions and aggregates with like-tagged objects.
3. **CURIOUS**: The entity investigates moving, novel, or collectible items.
4. **TRUST**: The entity cooperates faithfully with the player, crossing treacherous chasms.
5. **GREEDY**: The entity hoards valuables, shiny gears, and treasures.
6. **PROTECTIVE**: The entity places its body between danger and its ward.
7. **STUBBORN**: The entity anchors into the ground, becoming immovable.
8. **IMITATE**: The entity mirrors the player's movement patterns and velocity.
9. **HUNGRY**: The entity seeks organic food bait and berries.
10. **SLEEPY**: The entity curls into deep slumber, becoming a heavy, sturdy stepping block.
11. **JEALOUS**: The entity rushes to contest and intercept items before rivals can reach them.
12. **FOLLOW**: The entity shadows the player's trajectory smoothly across gaps.
13. **REPEAT**: The entity oscillates mechanically back and forth, acting as a ferry.

---

## 🗺️ The Four Regions & 19 Levels

1. **The Forgotten Meadow** (Levels 1–4 + Secret 1 *The Echo Chamber*)
   - Storybook rolling hills, warm amber sunsets, and foundational concepts (*Fear*, *Lonely*, *Curious*).
2. **The Hollow Woods** (Levels 5–8 + Secret 2 *The Moonlit Grove*)
   - Dense foliage, glowing fireflies, eerie mist, introducing *Trust*, *Hunger*, and *Protection*.
3. **The Clockwork Ruins** (Levels 9–12 + Secret 3 *The Gearvault*)
   - Ancient mechanical ruins, cogs, conveyor platforms, introducing *Greed*, *Stubbornness*, *Repeat*, and *Imitate*.
4. **The Dreaming Mountains** (Levels 13–16)
   - Shimmering auroras, celestial floating islands, introducing *Follow*, *Sleep*, *Jealousy*, and complex Multi-Concept synergies.

---

## 🎨 Creative Archive & Profiling
Every player approaches problems differently. The **Creative Archive** tracks your actions across 6 gameplay dimensions:
- **Experimentation**
- **Exploration**
- **Systemic Thinking**
- **Risk Taking**
- **Persistence**
- **Novelty**

At any point, view your emergent creative archetype: *The Engineer*, *The Explorer*, *The Rule Breaker*, *The Empath*, *The Observer*, or *The Experimenter*.

---

## ⌨️ Controls

| Action | Keyboard Input |
| :--- | :--- |
| **Move** | `A` / `D` or `Left` / `Right` Arrow Keys |
| **Jump** (variable height) | `Space` / `W` / `Up` Arrow Key |
| **Apply / Interact** | `E` |
| **Clear Concept** | `X` |
| **Concept Wheel** | `Q` or `Tab` |
| **Quick Equip** | Number Keys `1` through `9` |
| **World Map** | `M` |
| **Pause Menu** | `Esc` |
| **Restart Level** | `R` |
| **Developer Debug Mode** | Backtick (`` ` ``) |

---

## 🛠️ Technology Stack & Architecture
- **Framework**: Phaser 3 (HTML5 Arcade Physics Engine)
- **Language**: TypeScript (Strict Typings)
- **Bundler**: Vite 8
- **Audio**: Web Audio API (100% procedurally synthesized SFX & 4 regional ambient synthesizer soundscapes)
- **Graphics**: 100% procedural vectors and shaders generated via Phaser Graphics pipeline (Zero external copyrighted assets)
- **Persistence**: Safe, versioned `localStorage` schema with automatic migration fallback

---

## 🚀 Local Development Setup

```bash
# Clone the repository
git clone https://github.com/example/otherwise.git
cd otherwise

# Install dependencies
npm install

# Start local development dev server
npm run dev

# Build production bundle
npm run build
```

---

## 📜 Credits & License
Created by the **OTHERWISE Team** for the **BTT Web Game Jam, Summer 2026**.
Released under the **MIT License**.
