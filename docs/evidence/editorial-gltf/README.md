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
winterberry fallback, photo-default pixel comparison, and caption clearance at 768/834/1080/1127/1440px across the four dates.

## Scope of the evidence

The four GLBs remain below the 5,000,000-byte combined budget, including the hydrangea’s three original Blender-baked surface maps. `npm run check` decodes them and validates 365 days, phase
continuity, geometry, 3/5/7 share round-trips and the existing #5/#10/#11 checks.
The browser capture manifest verifies that the shortlist templates request no
photographic plant assets. Winterberry is intentionally a photographic fallback.

Local browser frame pacing is diagnostic; it is not a physical-device benchmark.
The current branch [cold-load measurement](branch-network/network-checks.json) uses 10 Mbps, 40 ms
latency, disabled HTTP cache, blocked service workers and one fresh Chrome
context per case. Scene readiness took **4.23–5.26 seconds** across phone and
desktop 3/5/7 cases; **all six missed the three-second target**. Each case is one
trial, with no CPU throttle, against the local production preview. This does not
certify physical iPhone/tablet performance or deployed-server behavior.

Reproduce with `node scripts/measure-editorial-gltf-network.mjs`, setting
`PLAYWRIGHT_MODULE` as above. `PREVIEW_URL` defaults to port 4179 and `EVIDENCE_DIR`
defaults to `tmp/phone-gauntlet`. Readiness requires the primary scene to report
two frames drawing geometry. The diagnostic records misses instead of hiding
them behind a passing assertion.


## Asset measurements

| GLB | Bytes |
| --- | ---: |
| Fothergilla | 869,704 |
| Oakleaf hydrangea | 1,940,956 |
| Redtwig dogwood | 1,038,440 |
| Boxwood | 881,048 |
| **Total** | **4,730,148** |

Decoded vertex attributes total **9,057,950 bytes**, shared across repeated
instances. The hydrangea maps add roughly 1.84 MB of RGBA8 texture storage including
mipmaps per WebGL context; this is separate from the geometry count. No remote
model decoder or runtime generation service is required. [Provenance and rights](../../../public/models/LICENSE.md).

## Full-product review (before branch checkpoint)

**LOSE — the full-product Gauntlet at `47a4191` did not clear the editorial bar.**
The critic's largest gap is stiff hydrangea/dogwood foliage and repeated
horizontal tiers at normal desktop garden and detail size. Closure requires
irregularly curved leaves, plausible transmitted light and connected canopy
depth on days 135/200/227 at 1440×900, followed by coherent 390px 3/5/7 seasonal
checks. The critic also inspected twelve monthly views and live keyboard/Play
behavior, and incorporated the [pre-branch cold-load measurements](network/network-checks.json). See the
[full independent review](INDEPENDENT_REVIEW.md) and its
[retained live captures](gauntlet-phone/).

The current branch checkpoint retains three original Blender branch forms, a
curated seven-stem shrub, 562 connected blades and 15 flower attachments. The
shared lighting, leaf maps and other species are unchanged. The editable branch
study and assembled source accompany the four seasonal delivery assets. Each blade now has an independently curved midrib, varied transverse cupping
and longitudinal twist. Delivery geometry is checked for attachment proximity
to the persistent wood. The branch checkpoint does not replace the full-product
Gauntlet verdict or certify the remaining species.


## Current hydrangea branch checkpoint

**LOSE — this bounded checkpoint does not clear the leaf-realism bar.** The fresh
critic finds connected branching and irregular placement, but exposed leaves
still read as rigid, opaque lobed plates at normal desktop size. Closure requires
continuous uneven cupping, twist, varied droop and soft backface shading in the
day-135/200 portrait, selected detail and limited peek, preserving winter wood
and phone presentation. See the [checkpoint report](BRANCH_CHECKPOINT_REVIEW.md)
and [independent raw captures](branch-checkpoint/). This is not a new full-product
Gauntlet or an approval to extend the same leaf treatment to the other species.

The current 25-frame matrix and browser checks cover this exact delivery asset.
Photo defaults match main pixel-for-pixel at days 15/200; Play, keyboard, peek,
context restoration, winterberry fallback and caption clearance pass. The
Blender-to-delivery pipeline regenerates all four GLBs and manifest byte-for-byte.
The other three species and runtime lighting are unchanged by this checkpoint.
