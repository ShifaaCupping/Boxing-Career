# Ongeslagen

Bokscarriere-simulator in HTML, CSS en vanilla JavaScript, met een online leaderboard via Cloudflare D1.

- `js/config.js`: cijfers, boksscholen, tegenstanders, riemen, promotors, team, upgrades en gebeurtenissen
- `js/commentaar.js`: ringcommentaar
- `js/belt.js`: de getekende riemen
- `js/engine.js`: draft en simulatie
- `js/ui.js`: schermen en opslag
- `functions/api/scores.js`: leaderboard-API
- `schema.sql`: database-opzet

## Online zetten
1. Zet alles in een GitHub-repository, met `index.html` in de hoofdmap.
2. Cloudflare: Workers & Pages, Create, Pages, Connect to Git. Framework None, build command leeg, output directory `/`.
3. Maak onder Storage & Databases, D1 een database `ongeslagen`.
4. Open de Console van die database, plak de inhoud van `schema.sql` en voer het uit.
5. Pages-project, Settings, Bindings, Add, D1 database. Variable name precies `DB`, kies database `ongeslagen`.
6. Maak een nieuwe deploy (Deployments, Retry deployment). Daarna werkt het leaderboard.
