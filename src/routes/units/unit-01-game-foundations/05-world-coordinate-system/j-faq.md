# World Coordinate System - FAQ

**Unit 01: Game Foundations | Topic 05**

> 20 questions developers ask about cameras, coordinates, and scrolling worlds.

---

## Q1: Why do we need a world coordinate system at all?

A world coordinate system separates the *logical* position of things in your game world from the *pixel coordinates* on the screen. If you store everything in screen space, moving the camera means you must recalculate every entity’s position whenever the camera moves. With world coordinates:

- Entities always live at the same (x, y) regardless of camera.
- You can place objects outside the current view (backgrounds, enemies, future platforms).
- Multiple cameras can view the same world from different angles.
- Physics, collision, and AI use consistent numbers.

**Pattern:**

```typescript
class Entity {
    // World position (never tied to camera)
    x: number;
    y: number;
}

class Camera {
    // Converts world -> screen when drawing
    worldToScreen(worldX: number, worldY: number) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
}
```

---

## Q2: What’s the difference between screen space and world space?

| Aspect          | Screen Space                      | World Space                     |
|-----------------|-----------------------------------|----------------------------------|
| Origin          | Top-left of the canvas            | Top-left (or custom) of world    |
| Units           | Pixels on screen                  | World units (often pixels)       |
| Changes when…   | Canvas resizes, camera moves      | Level design changes             |
| Used for        | UI, HUD, mouse input              | Physics, entities, collision     |
| Typical range   | 0–canvas.width/height             | 0–worldWidth/height              |

Rule of thumb: store logic in world coordinates, convert to screen coordinates only when drawing or handling screen input.

---

## Q3: How do I convert world coordinates to screen coordinates?

Subtract the camera offset (and multiply by zoom if you have zoom). The camera’s `x` and `y` represent the top-left corner of the view in world space.

```typescript
function worldToScreen(worldX: number, worldY: number, camera: Camera) {
    return {
        x: (worldX - camera.x) * camera.zoom,
        y: (worldY - camera.y) * camera.zoom
    };
}
```

If you’re not using zoom, drop the `* camera.zoom`. When drawing, use these screen coordinates with the Canvas API.

---

## Q4: How do I convert screen coordinates (like mouse clicks) to world coordinates?

Add the camera offset (and divide by zoom if needed). Use `offsetX/offsetY` for mouse coordinates relative to the canvas.

```typescript
function screenToWorld(screenX: number, screenY: number, camera: Camera) {
    return {
        x: screenX / camera.zoom + camera.x,
        y: screenY / camera.zoom + camera.y
    };
}
```

This lets you detect collisions or interactions with world entities based on mouse clicks.

---

## Q5: Why does my UI move when the camera moves?

Because the UI is drawn while the canvas is still translated by the camera. Always `ctx.restore()` before rendering UI so it stays in screen space.

```typescript
ctx.save();
ctx.translate(-camera.x, -camera.y);
drawWorld();
ctx.restore();

drawUI(); // UI is now fixed to screen
```

Render order: backgrounds → world (translated) → UI (not translated) → debug overlay.

---

## Q6: How does a basic camera follow the player?

Center the camera on the player and clamp to world bounds so you never see beyond the level edges.

```typescript
camera.x = player.x - camera.width / 2;
camera.y = player.y - camera.height / 2;

camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
camera.y = Math.max(0, Math.min(camera.y, worldHeight - camera.height));
```

This is the starting point for more advanced camera behavior (smooth follow, deadzones, etc.).

---

## Q7: How do I make the camera feel smoother?

Use linear interpolation (lerp). Move the camera a percentage of the distance toward the target each frame.

```typescript
const smooth = 0.1; // Lower = smoother
camera.x += (targetX - camera.x) * smooth;
camera.y += (targetY - camera.y) * smooth;
```

Clamp `targetX/targetY` before lerping to prevent jitter at edges. Round the final camera position to whole pixels to avoid sub-pixel jitter in pixel art games.

---

## Q8: What is a camera deadzone and why use it?

A deadzone is a rectangle around the player. The camera doesn’t move while the player stays inside the zone, reducing motion sickness and jitter.

```typescript
const left = camera.x + camera.width / 2 - deadzoneWidth / 2;
const right = left + deadzoneWidth;

if (player.x < left) camera.x = player.x - deadzoneWidth / 2;
if (player.x > right) camera.x = player.x + deadzoneWidth / 2 - camera.width;
```

Deadzone sizes around 300×200 pixels feel good in platformers.

---

## Q9: How do I implement camera look-ahead?

Shift the camera’s target in the direction the player is moving or facing. This lets the player see more of what’s ahead.

```typescript
const lookAheadDistance = player.facingRight ? 150 : -150;
const targetX = player.x + lookAheadDistance - camera.width / 2;
```

Combine look-ahead with smoothing so the camera glides into the new position.

---

## Q10: What’s the best way to cull off-screen entities?

Detect rectangle overlap between the entity and the camera viewport. Draw or update entities only when they’re near the viewport to save CPU/GPU.

```typescript
function isOnScreen(entity: Entity, camera: Camera, margin = 0) {
    return entity.x + entity.width > camera.x - margin &&
           entity.x < camera.x + camera.width + margin &&
           entity.y + entity.height > camera.y - margin &&
           entity.y < camera.y + camera.height + margin;
}
```

Use a margin (50–100px) so entities fade in before they reach the edge.

---

## Q11: Should I translate the canvas or subtract the camera manually?

Translating the canvas is less error-prone.

```typescript
ctx.save();
ctx.translate(-camera.x, -camera.y);
// draw everything using world coordinates
ctx.restore();
```

You can still cull entities with `camera.isOnScreen()` before drawing to avoid unnecessary `ctx` calls. Manual subtraction works but is easier to get wrong, especially with nested drawing code.

---

## Q12: How do I animate parallax backgrounds?

Give each layer a scroll speed (0.0=static, 1.0=foreground). Multiply the camera position by that speed.

```typescript
const offset = camera.x * layer.scrollSpeed;
const startTile = Math.floor(offset / image.width) - 1;
const endTile = Math.ceil((offset + camera.width) / image.width) + 1;
```

Round drawing positions to integers to avoid seams. Use seamless art so there are no visible edges.

---

## Q13: Why is my camera showing black bars at the world edges?

Because the camera isn’t clamped or your world is smaller than the viewport. Clamp after following the player:

```typescript
camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
```

If `worldWidth < camera.width`, keep the camera at 0 (or center it) so no empty space shows.

---

## Q14: How do I add camera shake without getting motion sickness?

Apply a random offset that decays each frame. Keep shake small (5–10px) for minor impacts, 20–30px for big hits.

```typescript
camera.shakeAmount *= camera.shakeDecay; // 0.85–0.95
const shakeX = (Math.random() - 0.5) * camera.shakeAmount;
```

Add shake after smoothing so it doesn’t interfere with follow behavior.

---

## Q15: What about camera zoom?

Treat zoom as a scale factor. All world → screen conversions must multiply by zoom, and screen → world conversions divide by zoom. Adjust viewport size accordingly.

```typescript
const viewportWidth = camera.width / camera.zoom;
const viewportHeight = camera.height / camera.zoom;
```

Use `ctx.scale()` only for world layers; never for UI.

---

## Q16: How do I build a minimap?

Render the world in a tiny rectangle. Scale world positions to the minimap size.

```typescript
const miniX = (entity.x / worldWidth) * minimap.width + minimap.x;
const miniY = (entity.y / worldHeight) * minimap.height + minimap.y;
```

Draw the camera viewport as a rectangle showing what’s visible right now.

---

## Q17: Can I have multiple cameras?

Yes—render the world once per camera. For split-screen, set different `ctx.translate` offsets (or draw to two canvases). For a mini-map, use a second camera with a wider viewport and smaller zoom.

```typescript
eachCamera.forEach(cam => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cam.viewport.x, cam.viewport.y, cam.viewport.width, cam.viewport.height);
    ctx.clip();
    ctx.translate(cam.viewport.x - cam.x, cam.viewport.y - cam.y);
    drawWorld();
    ctx.restore();
});
```

---

## Q18: How do I debug camera issues quickly?

Add an overlay that shows:

- Camera position `(camera.x, camera.y)`
- Player world and screen positions
- Camera bounds rectangle
- Visible entity count vs total count

```typescript
ctx.fillText(`Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)})`, 10, 20);
```

Draw the camera viewport as a rectangle in world space to detect clamping problems.

---

## Q19: Does physics care about screen coordinates?

No. Physics and collision detection should use world coordinates exclusively. Screen coordinates are purely for display. Convert to screen only when rendering or when comparing with screen-space input.

---

## Q20: Where can I learn more about 2D camera systems?

- **Articles:**
  - “Game Programming Patterns – Camera Systems”
  - GDC talks on camera design for platformers (search “2D camera talk GDC”)
- **Open Source Projects:**
  - Phaser and Godot both have camera implementations in JavaScript/TypeScript
  - PlayCanvas engine examples for camera controls
- **Practice:** build small prototypes with different camera behaviors (smooth follow, deadzones, zoom, look-ahead). Experiment with parameters to see how it feels.

---

**Keep building!** Cameras are as much art as engineering—tune them until your game feels just right. 🎮