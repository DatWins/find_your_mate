# Find Your Mate

Blindfold mate-finding puzzles pulled from real Lichess games, as a flip
card: picture the position, type your mate, check it, then flip to see how
the real game finished.

Built with Hugo (hugo-scroll theme), deployed to GitHub Pages.

## Levels

- **Easy** - real games checkmated by move 5
- **Medium** - real games checkmated between move 5 and move 7
- **Hard** - real games checkmated between move 8 and move 10
- **Very Difficult** - real games checkmated on exactly move 10, shown as a
  plain-text piece list (no board at all) instead of a diagram

For every level, the puzzle position is the real game 2 of the mating
side's own moves before the actual checkmate (so a "mate in 2" from that
position) - everything up to there is just context to help you picture
the board.

## Adding games

Each level's real games live in `static/data/<level>.json` (`easy`,
`medium`, `hard`, `very-difficult`) as an array of objects:

```json
{
  "site": "https://lichess.org/xxxxxxxx",
  "event": "Rated Classical game",
  "white": "name", "black": "name",
  "whiteElo": 1183, "blackElo": 1058,
  "startFen": "<FEN 2 of the mating side's moves before the real mate>",
  "moves": ["Qh5", "Kg8", "Qh7#"],
  "result": "1-0"
}
```

A page picks one at random from its level's file each time it loads
(client-side), with a Shuffle button for another. Typing an answer in the
box checks it with chess.js against the live position - any legal move
sequence that ends in checkmate counts, not just the recorded line.
