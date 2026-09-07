# Editorial glTF review evidence

All screenshots come from the production build in desktop Chrome, with reduced
motion and CSS viewport emulation. Phone: **390 × 844**. Desktop: **1440 × 900**.
Tablet: **834 × 1194**. This does not certify physical iPhone/Safari performance.

Run `npm ci`, `npm run check`, `npm run build`, and
`npm run preview -- --port 4178`. Open these templates with `day=15`, `135`,
`200`, or `290`; all preserve the parked date and sender in the share URL.

| Layout | Review URL |
| --- | --- |
| 3 | `http://localhost:4178/?renderer=gltf&template=balanced-year-3&day=15&from=Kevin` |
| 5 | `http://localhost:4178/?renderer=gltf&template=layered-seasons-5&day=15&from=Kevin` |
| 7 | `http://localhost:4178/?renderer=gltf&template=living-framework-7&day=15&from=Kevin` |

## Phone matrix

| Plants | January 15 | May 15 | July 19 | October 17 |
| --- | --- | --- | --- | --- |
| 3 | [Day 15](phone-3-15.png) | [Day 135](phone-3-135.png) | [Day 200](phone-3-200.png) | [Day 290](phone-3-290.png) |
| 5 | [Day 15](phone-5-15.png) | [Day 135](phone-5-135.png) | [Day 200](phone-5-200.png) | [Day 290](phone-5-290.png) |
| 7 | [Day 15](phone-7-15.png) | [Day 135](phone-7-135.png) | [Day 200](phone-7-200.png) | [Day 290](phone-7-290.png) |

Desktop captures follow `desktop-{3,5,7}-{15,135,200,290}.png`.
[Tablet spring](tablet-5-135.png) retains the four-view contact sheet.
Raw capture dimensions, requests and console errors are in [captures.json](captures.json).

## Reproduction

The optional browser harnesses use Playwright (Chrome channel) and Sharp from an
external or bundled runtime, without adding them to the app's production bundle.
Set `PLAYWRIGHT_MODULE` and `SHARP_MODULE` to their importable module entry paths
when they are not installed in this checkout. Then run:

```sh
node scripts/capture-editorial-gltf.mjs
node scripts/check-editorial-gltf-browser.mjs
```

The second script also expects unchanged `main` served at `http://127.0.0.1:4177`
for pixel comparison. Override `PREVIEW_URL` and `BASELINE_URL` as needed.
[Browser results](browser-checks.json) record phone Play, history writes, buffer
uploads on repeated seasons, keyboard, peek, context restoration, mixed
winterberry fallback and photo-default pixel comparison.

## Scope of the evidence

The four GLBs remain below the 5,000,000-byte combined budget, with no embedded
image textures. `npm run check` decodes them and validates 365 days, phase
continuity, geometry, 3/5/7 share round-trips and the existing #5/#10/#11 checks.
The browser capture manifest verifies that the shortlist templates request no
photographic plant assets. Winterberry is intentionally a photographic fallback.

Local browser frame pacing is diagnostic; it is not a throttled-network or
physical-tablet benchmark. A 4.89 MB cold asset payload alone takes about 3.9
seconds over 10 Mbps before protocol overhead. The historical three-second
cold-load Gauntlet target therefore remains unproven and is not claimed here.


## Asset measurements

| GLB | Bytes |
| --- | ---: |
| Fothergilla | 1,130,764 |
| Oakleaf hydrangea | 1,345,816 |
| Redtwig dogwood | 1,344,040 |
| Boxwood | 1,070,508 |
| **Total** | **4,891,128** |

Decoded vertex attributes total **12,259,284 bytes**, shared across repeated
instances. No external model decoder, texture atlas, or runtime generation
service is required. [Provenance and rights](../../../public/models/LICENSE.md).

## Independent visual verdict

**LOSE — visual acceptance remains open.** The final fresh critic scores shared
lighting 4/5, botanical seasons 3/5, beauty/coherence 2/5, responsive composition
4/5, and evidenced safeguards 4/5. The remaining gap is rigid, faceted broadleaf
geometry, especially oakleaf hydrangea. See the [full review](INDEPENDENT_REVIEW.md).
The PR remains a draft rather than claiming editorial-quality acceptance.
