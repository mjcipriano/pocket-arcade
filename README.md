# Pocket Arcade

A touch-friendly browser arcade. The menu searches titles, genres and descriptions, loads 24 cards at a time and opens only the selected game. Share a game directly with a link ending in `#play/tideline`.

## Run locally

From the repository root, run `node scripts/catalog.mjs`, then `python3 -m http.server 8000 --directory site`. Open http://localhost:8000. For a phone on the same Wi-Fi, use the computer's LAN address in place of localhost.

## Add a game

1. Create a folder such as `site/games/pearl-drift/`. Use lowercase letters, numbers and hyphens. The folder name becomes the permanent game link.
2. Put the playable entry point in `index.html` and its assets alongside it. Use relative URLs so the game also works under a GitHub Pages project path. Each game runs in its own iframe. Provide touch controls and a restart button.
3. Add `game.json` in the same folder, using this example:
   
   ```json
   {"title":"Pearl Drift","genre":"Puzzle","description":"Guide a pearl through the reef.","mark":"◈","color":"#287c78"}
   ```
4. Run the catalog command to preview and validate. Commit the game folder and push to main. The publishing workflow discovers all game folders and rebuilds the menu.

## Publish on GitHub

Use a public repository named pocket-arcade. In Settings → Pages → Build and deployment, select GitHub Actions. Push to main or run the Publish Pocket Arcade workflow manually. The deployment reports the playable URL.
