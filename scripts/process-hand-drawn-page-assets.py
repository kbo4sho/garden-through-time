#!/usr/bin/env python3
"""Key cream paper to alpha, keep drawn stipple feet, write 600x600 PNGs."""

from __future__ import annotations

import hashlib
import json
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "docs" / "asset-sources" / "hand-drawn-page-integration" / "raw"
OUT_DIR = ROOT / "public" / "textures" / "hand-drawn-page"
SIZE = 600
PLANTS = [
    "fothergilla",
    "hydrangea",
    "dogwood",
    "smooth-hydrangea",
    "panicle-hydrangea",
    "sweetspire",
    "summersweet",
    "viburnum",
    "serviceberry",
    "ninebark",
    "boxwood",
    "buttonbush",
    "winterberry",
]
STAGES = ["winter", "leafout", "bloom", "summer", "fall"]
def sample_paper(rgb: np.ndarray) -> np.ndarray:
    patches = np.concatenate(
        [
            rgb[:36, :36].reshape(-1, 3),
            rgb[:36, -36:].reshape(-1, 3),
            rgb[-36:, :36].reshape(-1, 3),
            rgb[-36:, -36:].reshape(-1, 3),
        ]
    )
    return np.median(patches, axis=0).astype(np.float32)


def color_distance(rgb: np.ndarray, paper: np.ndarray) -> np.ndarray:
    return np.sqrt(((rgb.astype(np.float32) - paper) ** 2).sum(axis=2))


def flood_mask(passable: np.ndarray) -> np.ndarray:
    height, width = passable.shape
    mask = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        for y in (0, height - 1):
            if passable[y, x]:
                mask[y, x] = True
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if passable[y, x] and not mask[y, x]:
                mask[y, x] = True
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and passable[ny, nx] and not mask[ny, nx]:
                mask[ny, nx] = True
                queue.append((nx, ny))
    return mask


def dilate(mask: np.ndarray, radius: int) -> np.ndarray:
    if radius <= 0:
        return mask
    image = Image.fromarray((mask.astype(np.uint8) * 255))
    return np.array(image.filter(ImageFilter.MaxFilter(radius * 2 + 1))) > 0


def erode(mask: np.ndarray, radius: int) -> np.ndarray:
    if radius <= 0:
        return mask
    image = Image.fromarray((mask.astype(np.uint8) * 255))
    return np.array(image.filter(ImageFilter.MinFilter(radius * 2 + 1))) > 0


def content_bbox(alpha: np.ndarray) -> tuple[int, int, int, int] | None:
    ys, xs = np.where(alpha > 24)
    if xs.size == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def dissolve_base(alpha: np.ndarray, seed: int) -> np.ndarray:
    height, width = alpha.shape
    y = np.linspace(0, 1, height, dtype=np.float32)[:, None]
    x = np.linspace(0, 1, width, dtype=np.float32)[None, :]
    rng = np.random.default_rng(seed)
    noise = rng.random((height, width), dtype=np.float32)
    ragged = 0.92 + 0.03 * np.sin(x * 18.0 * np.pi) + 0.02 * (noise - 0.5)
    t = np.clip((y - ragged) / 0.07, 0.0, 1.0)
    keep = 1.0 - t
    keep = np.where(y > 0.985, 0.0, keep)
    return alpha * keep


def add_stipple(rgba: np.ndarray) -> np.ndarray:
    height, width, _ = rgba.shape
    alpha = rgba[:, :, 3]
    bbox = content_bbox(alpha)
    if bbox is None:
        return rgba
    x0, y0, x1, y1 = bbox
    base_y = y1
    cx = (x0 + x1) / 2
    spread_x = max(12, (x1 - x0) * 0.46)
    spread_y = max(10, (y1 - y0) * 0.1)
    rng = np.random.default_rng((x1 * 97 + y1 * 13) & 0xFFFFFFFF)
    overlay = rgba.astype(np.float32)
    for _ in range(780):
        px = int(np.clip(cx + rng.normal(0, spread_x * 0.58), 0, width - 1))
        py = int(np.clip(base_y - abs(rng.normal(0, spread_y)) - rng.uniform(0, 14), 0, height - 1))
        radius = float(rng.uniform(0.35, 1.45))
        shade = rng.uniform(0.06, 0.2)
        color = np.array(
            [112 + rng.uniform(-14, 12), 108 + rng.uniform(-16, 10), 86 + rng.uniform(-12, 12)],
            dtype=np.float32,
        )
        y_min = max(0, int(py - 2))
        y_max = min(height, int(py + 3))
        x_min = max(0, int(px - 2))
        x_max = min(width, int(px + 3))
        yy, xx = np.ogrid[y_min:y_max, x_min:x_max]
        falloff = np.clip(1.0 - np.sqrt((xx - px) ** 2 + (yy - py) ** 2) / max(radius, 0.4), 0, 1)
        add_a = falloff * shade * 255.0
        src_a = overlay[y_min:y_max, x_min:x_max, 3]
        out_a = np.clip(src_a + add_a, 0, 255)
        for channel in range(3):
            src = overlay[y_min:y_max, x_min:x_max, channel]
            overlay[y_min:y_max, x_min:x_max, channel] = np.where(
                out_a > 0,
                (src * src_a + color[channel] * add_a) / np.maximum(out_a, 1),
                src,
            )
        overlay[y_min:y_max, x_min:x_max, 3] = out_a
    return np.clip(overlay, 0, 255).astype(np.uint8)


def strip_ground_oval(rgba: np.ndarray) -> np.ndarray:
    """Remove the discrete oval/circular ground patch baked into each plate."""
    height, width, _ = rgba.shape
    rgb = rgba[:, :, :3].astype(np.float32)
    alpha = rgba[:, :, 3].astype(np.float32)
    luma = rgb.mean(axis=2)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    green = rgb[:, :, 1] - np.maximum(rgb[:, :, 0], rgb[:, :, 2])
    warm = rgb[:, :, 0] - rgb[:, :, 1]
    v = np.linspace(1.0, 0.0, height, dtype=np.float32)[:, None]
    alpha = np.where(v < 0.13, 0.0, alpha)
    in_foot = v < 0.28
    oval = (
        in_foot
        & (alpha > 8)
        & (chroma < 52)
        & (green < 16)
        & (warm < 24)
        & (luma > 64)
        & (luma < 220)
    )
    dark_stipple = (
        (v < 0.20)
        & (alpha > 8)
        & (chroma < 40)
        & (green < 12)
        & (luma < 120)
    )
    alpha = np.where(oval | dark_stipple, 0.0, alpha)
    rng = np.random.default_rng(11)
    noise = rng.random((height, width), dtype=np.float32)
    ragged = 0.018 + 0.045 * noise + 0.012 * np.sin(
        np.linspace(0, np.pi * 9, width, dtype=np.float32)[None, :]
    )
    fade = np.clip((v - ragged) / 0.11, 0.0, 1.0)
    alpha = np.where(v < 0.18, alpha * fade, alpha)
    out = rgba.copy()
    out[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    return out


WINTER_STEM_INK = {"dogwood-winter", "ninebark-winter"}


def reinforce_winter_stem_ink(rgba: np.ndarray, name: str) -> np.ndarray:
    """Give winter stems ink contours plus a pale wash that survives detail scale.

    Thick stems keep a light interior so they do not read as opaque silhouettes.
    Thin twigs become reddish-brown or brown pencil marks. Stippled feet stay.
    """
    rgb = rgba[:, :, :3].astype(np.float32)
    alpha = rgba[:, :, 3].astype(np.float32) / 255.0
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    luma = rgb.mean(axis=2)
    y = np.linspace(0.0, 1.0, rgba.shape[0], dtype=np.float32)[:, None]
    rng = np.random.default_rng(int(hashlib.md5(name.encode()).hexdigest()[:8], 16))
    grain = rng.random(luma.shape)

    foot = (y > 0.80) & (alpha > 0.05) & (chroma < 48)
    plant = (alpha > 0.14) & ~foot
    if not plant.any():
        return rgba

    thick_core = erode(plant, 2)
    if not thick_core.any():
        thick_core = erode(plant, 1)
    thick = dilate(thick_core, 2) & plant
    thin = plant & ~thick
    contour = thick & ~erode(thick, 1)
    contour = dilate(contour, 1) & thick
    contour = contour & (grain > 0.14)
    interior = thick & ~contour

    paper = np.array([243.0, 238.0, 226.0], dtype=np.float32)
    if name.startswith("dogwood"):
        wash = np.array([206.0, 148.0, 132.0], dtype=np.float32)
        ink = np.array([64.0, 32.0, 28.0], dtype=np.float32)
        thin_ink = np.array([96.0, 44.0, 38.0], dtype=np.float32)
        thin_mix = 0.80
        ink_keep = 96.0
    else:
        wash = np.array([210.0, 190.0, 162.0], dtype=np.float32)
        ink = np.array([62.0, 50.0, 40.0], dtype=np.float32)
        thin_ink = np.array([128.0, 108.0, 86.0], dtype=np.float32)
        thin_mix = 0.48
        ink_keep = 78.0

    wash_rgb = rgb * 0.22 + wash * 0.38 + paper * 0.40
    wash_rgb = np.clip(wash_rgb + rng.normal(0.0, 4.0, (*luma.shape, 1)).astype(np.float32), 0, 255)

    out_rgb = rgb.copy()
    out_a = alpha.copy()
    out_rgb[interior] = wash_rgb[interior]
    out_a[interior] = np.clip(np.maximum(out_a[interior] * 0.82, 0.72), 0.72, 0.88)

    out_rgb[contour] = rgb[contour] * 0.18 + ink * 0.82
    out_a[contour] = np.maximum(out_a[contour], 0.92)

    out_rgb[thin] = rgb[thin] * (1.0 - thin_mix) + thin_ink * thin_mix
    out_a[thin] = np.maximum(out_a[thin], 0.86)

    existing_ink = plant & (luma < ink_keep)
    out_rgb[existing_ink] = rgb[existing_ink] * 0.40 + ink * 0.60
    out_a[existing_ink] = np.maximum(out_a[existing_ink], 0.90)

    out = rgba.copy()
    out[:, :, :3] = np.clip(out_rgb, 0, 255).astype(np.uint8)
    out[:, :, 3] = np.clip(out_a * 255.0, 0, 255).astype(np.uint8)
    return out


def process_image(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    rgba = np.array(image)
    rgb = rgba[:, :, :3]
    paper = sample_paper(rgb)
    dist = color_distance(rgb, paper)
    luma = rgb.astype(np.float32).mean(axis=2)
    paper_luma = float(paper.mean())
    chroma = rgb.astype(np.float32).max(axis=2) - rgb.astype(np.float32).min(axis=2)
    plant_core = (chroma > 30) | ((paper_luma - luma) > 48) | (dist > 70)
    keep = erode(dilate(plant_core, 1), 2)
    removable = flood_mask(~keep)
    alpha = np.where(removable, 0.0, 255.0)
    paper_fill = ((dist < 32) & (chroma < 18)) | ((dist < 26) & ~plant_core)
    alpha = np.where(paper_fill, 0.0, alpha)
    alpha = dissolve_base(alpha, seed=int(hashlib.md5(source.name.encode()).hexdigest()[:8], 16))
    alpha[:2, :] = 0
    alpha[-2:, :] = 0
    alpha[:, :2] = 0
    alpha[:, -2:] = 0
    rgba[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    rgb = rgba[:, :, :3].astype(np.float32)
    luma = rgb.mean(axis=2)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    dist = color_distance(rgba[:, :, :3], paper)
    marks = (
        (chroma > 22)
        | ((paper_luma - luma) > 22)
        | (dist > 48)
    )
    rgba[:, :, 3] = np.where(marks, rgba[:, :, 3], 0)
    residual = (rgba[:, :, 3] > 0) & (dist < 34) & (chroma < 20)
    rgba[:, :, 3] = np.where(residual, 0, rgba[:, :, 3])
    unpigmented = ((luma > paper_luma - 4) & (chroma < 14)) | ((luma > 240) & (chroma < 16))
    rgba[:, :, 3] = np.where(unpigmented, 0, rgba[:, :, 3])
    key = source.stem.removeprefix("raw-").removeprefix("hd-").removeprefix("hand-drawn-")
    if key in WINTER_STEM_INK:
        rgba = reinforce_winter_stem_ink(rgba, key)
    rgb = rgba[:, :, :3].astype(np.float32)
    a = rgba[:, :, 3:4].astype(np.float32) / 255.0
    rgba[:, :, :3] = np.clip(rgb * a, 0, 255).astype(np.uint8)
    transparent = rgba[:, :, 3] < 8
    rgba[transparent] = 0
    return Image.fromarray(rgba)


def collect_sources() -> dict[str, Path]:
    mapping: dict[str, Path] = {}
    for path in sorted(RAW_DIR.glob("*")):
        if path.suffix.lower() not in {".png", ".webp", ".jpg", ".jpeg"}:
            continue
        stem = path.stem
        for prefix in ("raw-", "hd-", "hand-drawn-", ""):
            if stem.startswith(prefix):
                key = stem[len(prefix):] if prefix else stem
                break
        mapping[key] = path
    return mapping


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sources = collect_sources()
    expected = [f"{plant}-{stage}" for plant in PLANTS for stage in STAGES]
    hashes: dict[str, str] = {}
    missing = []
    duplicates = []
    inventory = []
    for name in expected:
        source = sources.get(name)
        if source is None:
            missing.append(name)
            continue
        result = process_image(source)
        dest = OUT_DIR / f"{name}.png"
        result.save(dest, "PNG", optimize=True)
        digest = hashlib.sha256(dest.read_bytes()).hexdigest()
        if digest in hashes:
            duplicates.append(f"{name} duplicates {hashes[digest]}")
        hashes[digest] = name
        inventory.append(
            {
                "name": f"{name}.png",
                "bytes": dest.stat().st_size,
                "sha256": digest,
                "source": str(source.relative_to(ROOT)),
            }
        )
        print(f"wrote {dest.relative_to(ROOT)} ({dest.stat().st_size} bytes)")
    report = {
        "expected": len(expected),
        "written": len(inventory),
        "missing": missing,
        "duplicates": duplicates,
        "inventory": inventory,
    }
    report_path = ROOT / "output" / "playwright" / "hand-drawn-page" / "asset-inventory.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2))
    if missing or duplicates:
        print("issues:", json.dumps({"missing": missing, "duplicates": duplicates}, indent=2))
        return 1
    print(f"processed {len(inventory)} unique illustrated states")
    return 0


if __name__ == "__main__":
    sys.exit(main())
