# Rifts Ultimate Edition compendium data

These JSON catalogs are deterministic intermediate data for the bundled Foundry
Item compendiums. Each source record retains its printed book page; the pack
builder stores that reference under `flags.errantearth.source`.

Current coverage:

| Catalog | Entries |
| --- | ---: |
| O.C.C.s | 31 |
| R.C.C.s | 1 |
| Races | 9 |
| Weapons | 41 |
| Armor and power armor | 14 |
| Spells | 155 |
| Psionics | 85 |

Regenerate the catalogs from a locally supplied PDF, then rebuild and verify the
LevelDB packs:

```powershell
python scripts/extract-rifts-ultimate.py --pdf "C:\path\to\Rifts Ultimate Edition.pdf"
node scripts/build-rifts-compendiums.mjs
```

The extraction script requires `pdfplumber`. The pack builder loads Foundry's
bundled `classic-level` module; set `FOUNDRY_CLASSIC_LEVEL` if Foundry is installed
somewhere other than the default Windows location.

The generated catalogs and compendiums contain material transformed from the
locally supplied rulebook. Confirm applicable distribution rights before
publishing them outside a personal installation.
