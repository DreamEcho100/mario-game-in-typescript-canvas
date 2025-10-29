# Sprite Rendering - Debugging

## Bug 1: Sprite is Blurry

**Diagnosis**: Image smoothing enabled

**Solution**: `ctx.imageSmoothingEnabled = false`

## Bug 2: Wrong Sprite Drawn

**Diagnosis**: Incorrect frame coordinates

**Solution**: Check frameX, frameY calculations

## Bug 3: Sprite Not Loading

**Diagnosis**: Image onload not waited

**Solution**: Use Promise or async/await

## Bug 4: Flipped Sprite Wrong Position

**Diagnosis**: Forgot to translate before scale

**Solution**: Translate to x+width, then scale(-1,1)

## Bug 5: Performance Slow

**Diagnosis**: Creating new Sprite every frame

**Solution**: Cache Sprite objects, reuse them
