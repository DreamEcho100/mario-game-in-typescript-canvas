# Particle Systems - FAQ

## Q1: How many particles is too many?
**A**: Keep under 500 active. Use object pooling for more.

## Q2: Should particles collide with world?
**A**: Usually no. They're visual only.

## Q3: What's object pooling?
**A**: Reusing particles instead of creating/destroying. Much faster.

## Q4: How do I make particles feel good?
**A**: Match particle color to action, tune lifetime, add variety.

## Q5: Should screen shake be optional?
**A**: Yes! Accessibility setting. Some players get motion sick.

## Q6: How do I make trails?
**A**: Spawn particles at current position every few frames.

## Q7: What's the best way to spawn particles in circle?
**A**: Loop i from 0 to count, angle = (i/count) * 2π

## Q8: Can particles draw sprites?
**A**: Yes! drawImage instead of fillRect.

## Q9: How do I cull off-screen particles?
**A**: Check if particle.x/y within camera bounds before drawing.

## Q10: Should I use ctx.save/restore for each particle?
**A**: Only if changing globalAlpha. Otherwise batches are faster.
