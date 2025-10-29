# Sprite Rendering - FAQ

## Q1: Sprite sheet vs individual files?
**A**: Use sprite sheets for web (1 HTTP request vs many).

## Q2: How to keep pixel art crisp?
**A**: Set `ctx.imageSmoothingEnabled = false`.

## Q3: What's the 9-parameter drawImage?
**A**: drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) - extracts from sheet.

## Q4: How to flip sprites?
**A**: Use ctx.scale(-1, 1) after translating to flip position.

## Q5: Best sprite sheet size?
**A**: Power of 2 (512x512, 1024x1024) for GPU efficiency.

## Q6: How to organize sprites?
**A**: Group by character/entity, separate by animation.

## Q7: JSON atlas or manual coords?
**A**: JSON for flexibility, manual for simplicity.

## Q8: How many sprites can I draw?
**A**: Thousands. Modern browsers handle well. Cull offscreen.

## Q9: Should I cache sprites?
**A**: Yes! Create Sprite objects once, reuse every frame.

## Q10: PNG or JPEG for sprites?
**A**: PNG for transparency and pixel art sharpness.
