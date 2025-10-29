# Advanced Movement - Debugging Guide

## Bug 1: Wall Jump Not Working

**Diagnosis**: Wall touch not detected

**Solution**: Set wall touch flags in collision resolution

## Bug 2: Dash Goes Forever

**Diagnosis**: Timer not counting down

**Solution**: `dashTimer -= dt` in update

## Bug 3: Can Dash While Dashing

**Diagnosis**: No cooldown check

**Solution**: Check `dashCooldown <= 0` before starting

## Bug 4: Ground Pound Stuck

**Diagnosis**: Never exits ground pound state

**Solution**: Check `justLanded` and reset state

## Bug 5: Wall Slide Too Fast

**Diagnosis**: Not capping fall speed

**Solution**: `if (velocityY > WALL_SLIDE_SPEED) velocityY = WALL_SLIDE_SPEED`
