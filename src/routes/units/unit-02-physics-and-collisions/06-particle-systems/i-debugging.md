# Particle Systems - Debugging Guide

## Bug 1: Particles Never Die

**Diagnosis**: Not removing dead particles

**Solution**: Filter particles where `update()` returns true

## Bug 2: Too Many Particles (Lag)

**Diagnosis**: Spawning too frequently

**Solution**: Limit max particles or use object pooling

## Bug 3: Particles Don't Fade

**Diagnosis**: Not setting globalAlpha

**Solution**: `ctx.globalAlpha = lifetime / maxLifetime`

## Bug 4: Shake Never Stops

**Diagnosis**: Not decaying intensity

**Solution**: `shakeIntensity *= 0.9` each frame

## Bug 5: Particles Wrong Position

**Diagnosis**: Not accounting for camera offset

**Solution**: Draw particles within camera.apply/restore
