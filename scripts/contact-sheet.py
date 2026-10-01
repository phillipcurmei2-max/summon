"""Tiles smoke-test screenshots into one image for quick review: contact-sheet.py <dir> <out.png> [cols]"""
import glob, os, sys
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
files = sorted(glob.glob(os.path.join(src, "*.png")))
files = [f for f in files if not os.path.basename(f).startswith("_")]
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
scale = 0.75
tw, th = int(w * scale), int(h * scale) + 22
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (tw * cols, th * rows), (60, 60, 64))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * tw, (i // cols) * th
    sheet.paste(im.resize((tw, th - 22)), (x, y + 22))
    d.text((x + 6, y + 5), os.path.basename(f), fill=(255, 255, 255))
sheet.save(out)
print(out, sheet.size)
