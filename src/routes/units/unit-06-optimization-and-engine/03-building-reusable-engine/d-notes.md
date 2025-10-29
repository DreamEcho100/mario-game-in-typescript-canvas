# Building a Reusable Game Engine - Quick Reference

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 03 | Cheat Sheet**

---

## Engine Structure

```
engine/
├── core/      (Engine, Scene, Entity, Component)
├── systems/   (Render, Physics, Input, Audio)
├── managers/  (Asset, Scene, Event)
├── math/      (Vector2, Rectangle)
└── utils/     (Timer, Pool)
```

---

## Engine API

```typescript
const engine = new Engine({
  canvas: document.getElementById('canvas'),
  width: 800,
  height: 600
});

await engine.loadAssets({ ... });
engine.addScene('game', new GameScene(engine));
engine.setScene('game');
engine.start();
```

---

## Scene Lifecycle

```typescript
class GameScene extends Scene {
  onEnter(): void {
    // Setup scene
  }
  
  onExit(): void {
    // Cleanup
  }
  
  update(deltaTime: number): void {
    // Per-frame logic
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Drawing
  }
}
```

---

## Entity-Component

```typescript
const entity = new Entity(x, y);
entity.addComponent(new SpriteComponent('player'));
entity.addComponent(new PhysicsComponent());
entity.addComponent(new ColliderComponent(32, 32));

const sprite = entity.getComponent(SpriteComponent);
const hasPhysics = entity.hasComponent(PhysicsComponent);
```

---

## Component Pattern

```typescript
class MyComponent extends Component {
  onAttach(entity: Entity): void {
    // Called when added to entity
  }
  
  update(deltaTime: number): void {
    // Per-frame update
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Drawing
  }
  
  onDetach(): void {
    // Cleanup
  }
}
```

---

## Asset Loading

```typescript
await engine.loadAssets({
  'player': 'assets/player.png',
  'enemy': 'assets/enemy.png',
  'coin': 'assets/coin.png',
  'jump': 'assets/jump.wav',
  'music': 'assets/bgm.mp3'
});

const image = engine.getAsset('player');
engine.playSound('jump');
engine.playMusic('music');
```

---

## Input Handling

```typescript
// Keyboard
if (engine.isKeyDown('ArrowLeft')) {
  player.x -= speed;
}

if (engine.isKeyPressed('Space')) {
  player.jump();
}

// Mouse
const mouse = engine.getMousePosition();
console.log(mouse.x, mouse.y);
```

---

## Events

```typescript
// Subscribe
engine.on('coinCollected', (value) => {
  score += value;
});

// Emit
engine.emit('coinCollected', 10);
```

---

## Publishing Checklist

- [ ] package.json configured
- [ ] TypeScript definitions generated
- [ ] README with examples
- [ ] Documentation
- [ ] Example games
- [ ] Tests written
- [ ] Built with `npm run build`
- [ ] Published with `npm publish`

---

**Ship your engine to the world!** 🚀
