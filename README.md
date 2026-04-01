# Claude Code Buddy Patcher

**[Try it here: https://kittinan.github.io/claude-code-buddy-patcher/](https://kittinan.github.io/claude-code-buddy-patcher/)**

A static web tool to customize your Claude Code buddy companion by patching the salt string in the binary.

### The `/buddy` command

Claude Code has a built-in `/buddy` slash command you can run in the terminal:

```
/buddy
```

It displays your current buddy companion — a small creature that sits beside your input box. The buddy's species, rarity, eyes, hat, and shiny status are all derived deterministically from your `accountUuid` and a hardcoded salt baked into the Claude Code binary.

Run `/buddy` to see what you currently have before deciding whether to patch.

### How it works

Claude Code generates your buddy deterministically:

```
seed = wyhash(userId + SALT)   // SALT = "friend-2026-401" (15 chars)
rng  = mulberry32(seed)
rarity = rollRarity(rng)       // common 60%, uncommon 25%, rare 10%, epic 4%, legendary 1%
species = pick(rng, SPECIES)   // 18 species
eye = pick(rng, EYES)          // 6 eyes
hat = pick(rng, HATS)          // 8 hats (common always gets "none")
shiny = rng() < 0.01           // 1% chance
```

By replacing the `friend-2026-401` string in the binary with another 15-character salt, you get a different buddy. The tool brute-forces salt candidates matching your desired filters.

### Usage

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

1. Enter your `accountUuid` from `~/.claude.json` (not `userID`)
2. Set filters (rarity, species, etc.)
3. Search -- stops on first match
4. Click the result to copy the patch command

### Patch commands

```bash
# Backup
cp ~/.local/share/claude/versions/$(ls ~/.local/share/claude/versions/ | grep -E '^[0-9.]+$' | sort -V | tail -1){,.bak}

# Patch
sed -i 's/friend-2026-401/NEW_SALT/g' ~/.local/share/claude/versions/$(ls ~/.local/share/claude/versions/ | grep -E '^[0-9.]+$' | sort -V | tail -1)

# Restore
cp ~/.local/share/claude/versions/$(ls ~/.local/share/claude/versions/ | grep -E '^[0-9.]+$' | sort -V | tail -1).bak ~/.local/share/claude/versions/$(ls ~/.local/share/claude/versions/ | grep -E '^[0-9.]+$' | sort -V | tail -1)
```
