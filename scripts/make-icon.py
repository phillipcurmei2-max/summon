"""Renders the Summon logo (same shape as the in-app SVG) to resources/ and site/assets/."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, "..", "resources")
SITE = os.path.join(HERE, "..", "site", "assets")
os.makedirs(RES, exist_ok=True)
os.makedirs(SITE, exist_ok=True)

S = 2048  # supersampled canvas; the SVG is drawn on a 24-unit grid
k = S / 24.0
STOPS = [(0.0, (143, 107, 255)), (0.55, (217, 79, 208)), (1.0, (255, 138, 61))]


def gradient(size):
    """Diagonal (top-left → bottom-right) three-stop gradient."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    t = (x + y) / (2 * (size - 1))
    out = np.zeros((size, size, 3), np.float32)
    for (t0, c0), (t1, c1) in zip(STOPS, STOPS[1:]):
        m = (t >= t0) & (t <= t1)
        u = ((t - t0) / (t1 - t0))[m][:, None]
        out[m] = np.array(c0) * (1 - u) + np.array(c1) * u
    rgba = np.dstack([out, np.full((size, size), 255, np.float32)]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def sparkle(cx, cy, r, pinch=0.13, steps=48):
    """Four-point star built from concave quadratic curves, like the SVG path."""
    pts = []
    tips = [(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)]
    for i in range(4):
        a, b = tips[i], tips[(i + 1) % 4]
        ctrl = (cx + (a[0] + b[0] - 2 * cx) * pinch, cy + (a[1] + b[1] - 2 * cy) * pinch)
        for s in range(steps):
            t = s / steps
            x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * ctrl[0] + t**2 * b[0]
            y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * ctrl[1] + t**2 * b[1]
            pts.append((x * k, y * k))
    return pts


def render(bg=True):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    if bg:
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([1 * k, 1 * k, 23 * k, 23 * k], radius=6.5 * k, fill=255)
        img.paste(gradient(S), (0, 0), mask)
        # A soft inner highlight along the top edge gives it a little depth.
        glow = Image.new("L", (S, S), 0)
        ImageDraw.Draw(glow).ellipse([-4 * k, -14 * k, 28 * k, 9 * k], fill=40)
        glow = glow.filter(ImageFilter.GaussianBlur(1.5 * k))
        white = Image.new("RGBA", (S, S), (255, 255, 255, 255))
        img = Image.composite(white, img, Image.fromarray(np.minimum(np.array(glow), np.array(mask))))
    d = ImageDraw.Draw(img)
    fg = (255, 255, 255, 255) if bg else (143, 107, 255, 255)
    d.polygon(sparkle(12, 11.4, 6.8), fill=fg)
    d.polygon(sparkle(17.6, 6.0, 2.1), fill=(255, 255, 255, 217) if bg else fg)
    return img


icon = render()
icon.resize((512, 512), Image.LANCZOS).save(os.path.join(RES, "icon.png"))
icon.resize((512, 512), Image.LANCZOS).save(os.path.join(SITE, "icon.png"))
icon.resize((180, 180), Image.LANCZOS).save(os.path.join(SITE, "apple-touch-icon.png"))
icon.resize((64, 64), Image.LANCZOS).save(os.path.join(SITE, "favicon.png"))
icon.resize((256, 256), Image.LANCZOS).save(
    os.path.join(RES, "icon.ico"), sizes=[(16, 16), (20, 20), (24, 24), (32, 32), (40, 40), (48, 48), (64, 64), (128, 128), (256, 256)]
)
# Tray: the full-colour tile reads well on both light and dark taskbars.
icon.resize((16, 16), Image.LANCZOS).save(os.path.join(RES, "tray.png"))
icon.resize((32, 32), Image.LANCZOS).save(os.path.join(RES, "tray@2x.png"))
print("wrote icons to", os.path.abspath(RES), "and", os.path.abspath(SITE))
