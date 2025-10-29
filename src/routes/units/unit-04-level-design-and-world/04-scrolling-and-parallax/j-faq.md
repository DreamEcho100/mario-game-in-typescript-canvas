# Topic 04: Scrolling and Parallax - FAQ

---

## Q1: What's a good parallax ratio?

**A**: Depends on the layer's perceived depth:

- **0.0-0.2**: Very far (sky, distant mountains)
- **0.3-0.5**: Mid-distance (hills, trees)
- **0.6-0.8**: Near (grass, rocks)
- **0.9-1.0**: Foreground (same as player)

**Rule of thumb**: Smaller ratio = appears farther away

---

## Q2: How do I make seamless tiling?

**A**: Use image editor (Photoshop, GIMP):

1. Make image width/height power of 2 (256, 512, 1024)
2. Check edges match (left = right, top = bottom)
3. Use offset filter to check seams
4. Clone/patch any visible seams

Or use procedural generation/noise textures.

---

## Q3: Should parallax layers auto-scroll?

**A**: 

**Yes for:**
- Clouds
- Stars
- Water
- Atmospheric effects

**No for:**
- Mountains
- Buildings
- Ground layers

Auto-scroll is best for sky/atmospheric layers.

---

## Q4: How many parallax layers should I use?

**A**: 

- **Minimum**: 2-3 layers
- **Sweet spot**: 4-5 layers
- **Maximum**: 6-8 layers

More layers = more depth, but diminishing returns after 5.

**Example:**
1. Sky (fixed)
2. Far mountains (0.2x)
3. Mid hills (0.4x)
4. Near trees (0.7x)
5. Game world (1.0x)

---

## Q5: Why use off-screen canvas for caching?

**A**: Performance!

```typescript
// Slow: Drawing image 100 times
for (let i = 0; i < 100; i++) {
  ctx.drawImage(complexImage, x, y);
}

// Fast: Pre-render once, draw cache 100 times
const cache = createCache(complexImage);
for (let i = 0; i < 100; i++) {
  ctx.drawImage(cache, x, y);
}
```

Off-screen canvas is faster for:
- Complex images
- Multiple draws per frame
- Filtered/transformed images

---

## Q6: Should I use vertical parallax?

**A**: 

**Yes if:**
- Level has vertical scrolling
- Towers/shafts
- Flying/climbing sections

**No if:**
- Pure horizontal platformer
- Fixed Y camera
- Screen-height levels

Most 2D platformers only need horizontal parallax.

---

## Q7: How do I handle parallax at level edges?

**A**: 

**Option 1: Loop within bounds**
```typescript
const offsetX = -cameraX * parallaxRatio;
const wrappedX = ((offsetX % imgWidth) + imgWidth) % imgWidth;
```

**Option 2: Stretch to fit**
```typescript
const scale = levelWidth / imageWidth;
ctx.drawImage(image, 0, 0, imageWidth * scale, imageHeight);
```

**Option 3: Stop at edges**
```typescript
const maxOffset = imageWidth - viewportWidth;
const clampedX = Math.max(0, Math.min(offsetX, maxOffset));
```

---

## Q8: Can parallax ratios be > 1.0?

**A**: Yes, but rare!

**> 1.0**: Layer moves **faster** than camera
- Foreground effects
- Speed lines
- Comic-style foreground blur

**Example:**
```typescript
// Near grass moves faster for speed effect
grassLayer.parallaxRatio = 1.2;
```

Usually not needed for typical platformers.

---

## Q9: How do I create a day/night cycle?

**A**: 

```typescript
class DayNightCycle {
  private time: number = 0;
  
  update(deltaTime: number) {
    this.time += deltaTime;
  }
  
  getSkyColor(): string {
    const hour = (this.time / 60) % 24;  // 24-hour cycle
    
    if (hour < 6) return '#0F2027';     // Night
    if (hour < 12) return '#87CEEB';    // Day
    if (hour < 18) return '#FF8C42';    // Dusk
    return '#0F2027';                   // Night
  }
}
```

Interpolate colors smoothly for best effect.

---

## Q10: What causes parallax "jitter"?

**A**: 

1. **Not rounding positions**
```typescript
// Fix: Round to whole pixels
const x = Math.round(offsetX);
```

2. **Frame rate inconsistency**
```typescript
// Fix: Use deltaTime
offsetX += speed * deltaTime;
```

3. **Floating point errors**
```typescript
// Fix: Wrap large numbers
if (offsetX > 10000) offsetX = offsetX % imageWidth;
```

---

## Q11: How do I add fog/atmospheric perspective?

**A**: 

```typescript
// Gradient overlay
const gradient = ctx.createLinearGradient(0, 0, width, 0);
gradient.addColorStop(0, 'rgba(200, 200, 255, 0)');
gradient.addColorStop(1, 'rgba(200, 200, 255, 0.3)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Or tint far layers
ctx.save();
ctx.globalAlpha = 0.7;
ctx.fillStyle = '#A0B0C0';
ctx.fillRect(0, 0, width, height);
ctx.globalCompositeOperation = 'multiply';
ctx.drawImage(farLayer, x, y);
ctx.restore();
```

---

## Q12: Should parallax layers use different resolutions?

**A**: Yes! Optimize by using lower resolution for far layers:

- **Far layers**: 50% resolution (they're small anyway)
- **Mid layers**: 75% resolution
- **Near layers**: 100% resolution

```typescript
// Scale down far layer
const scale = 0.5;
ctx.drawImage(
  farLayer,
  x, y,
  farLayer.width * scale,
  farLayer.height * scale
);
```

---

## Best Practices

✅ **Do:**
- Use power-of-2 image sizes
- Pre-render complex layers
- Round positions
- Render back-to-front
- Save/restore context state
- Use deltaTime for smooth scrolling

❌ **Don't:**
- Draw entire image if partially visible
- Use non-seamless images for tiling
- Forget to clamp/wrap positions
- Mix coordinate systems
- Use too many layers (> 8)
- Update layers that aren't visible

---

## Resources

- **Classic Examples**: Sonic, Mario World, Donkey Kong Country
- **Image Tools**: GIMP (offset filter), Photoshop (seamless tiling)
- **Inspiration**: Super Meat Boy, Celeste, Ori series
