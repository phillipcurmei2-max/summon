"""Renders site/assets/og.png, the 1200x630 link-preview image."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "site", "assets", "og.png")
W, H = 1200, 630
FONTS = "C:/Windows/Fonts"

bg = Image.new("RGB", (W, H), (10, 10, 15))
glow = Image.new("RGB", (W, H), (0, 0, 0))
g = ImageDraw.Draw(glow)
g.ellipse([-150, -250, 650, 350], fill=(95, 60, 200))
g.ellipse([700, 300, 1400, 900], fill=(170, 80, 30))
g.ellipse([400, 150, 900, 500], fill=(120, 40, 120))
glow = glow.filter(ImageFilter.GaussianBlur(140))
img = Image.fromarray(np.minimum(np.array(bg, np.int16) + np.array(glow, np.int16), 255).astype(np.uint8))

icon = Image.open(os.path.join(HERE, "..", "resources", "icon.png")).convert("RGBA").resize((150, 150), Image.LANCZOS)
img.paste(icon, (90, 110), icon)
d = ImageDraw.Draw(img)
bold = ImageFont.truetype(os.path.join(FONTS, "segoeuib.ttf"), 92)
reg = ImageFont.truetype(os.path.join(FONTS, "segoeui.ttf"), 38)
d.text((90, 290), "Summon", font=bold, fill=(255, 255, 255))
d.text((94, 405), "Your whole PC, one keystroke away.", font=reg, fill=(210, 208, 225))
# keycaps
small = ImageFont.truetype(os.path.join(FONTS, "seguisb.ttf"), 30)
x = 94
for label in ["Alt", "Space"]:
    w = d.textlength(label, font=small) + 36
    d.rounded_rectangle([x, 480, x + w, 530], radius=10, fill=(38, 32, 58), outline=(200, 190, 235), width=2)
    d.text((x + 18, 486), label, font=small, fill=(255, 255, 255))
    x += w + 14
d.text((x + 6, 486), "Free for Windows", font=small, fill=(170, 168, 190))
img.save(OUT)
print("wrote", OUT)
