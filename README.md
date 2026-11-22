# The World in One Image — Sunday 22 November 2026

A newspaper front page summing up the world's news of Sunday 22 November
2026 in a single 1024×1024 image: Iran strikes at US bases in Bahrain as
the Gulf war widens leads, above a world map with eight numbered pins, a
28-story grid, nine more stories, and a Gulf-markets ticker. 38 stories
in all, each verified against live reporting dated 22 November 2026
(Reuters, AP, BBC, CNN, AFP, Sky, Formula 1).

## Run

`node tools/render.mjs` draws `entry.png` (build step, needs pureimage).
`main.ts` is the entrypoint: it copies `entry.png` to `/output/entry.png`
(or `$MAKEFUN_OUTPUT_DIR/entry.png`). Standard library only, no network,
deterministic — two runs write identical bytes.

## Files

- `main.ts` — entrypoint (copies the image)
- `entry.png` — the rendered front page
- `tools/render.mjs` — the drawing program (masthead, lead illustration,
  world map, story grid, ticker)
- `package.json` — metadata only
