# Building a Reusable Game Engine

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 03 of 03**

> **Learning Objective:** Package your game code into a reusable 2D game engine that can be used for future projects.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Engine Architecture](#engine-architecture)
3. [Core Engine API](#core-engine-api)
4. [Asset Management](#asset-management)
5. [Input System](#input-system)
6. [Physics Engine](#physics-engine)
7. [Rendering Pipeline](#rendering-pipeline)
8. [Audio System](#audio-system)
9. [Scene Management](#scene-management)
10. [Engine Configuration](#engine-configuration)
11. [Publishing Your Engine](#publishing-your-engine)
12. [Summary](#summary)

---

## Introduction

### What is a Game Engine?

A game engine is a reusable framework that provides common game functionality:
- Rendering system
- Physics simulation
- Input handling
- Audio management
- Asset loading
- Scene management

### What You'll Build

A complete 2D game engine with:
- Clean API for game developers
- Plugin architecture
- TypeScript definitions
- Documentation
- Example games
- npm package

### Prerequisites

- Completed Units 01-06 Topics 01-02
- Understanding of TypeScript modules
- Familiarity with npm packages
- Experience building a complete game

### Time Investment

**Estimated Time:** 6-8 hours
- Architecture Design: 1 hour
- Core Systems: 3 hours
- API Design: 2 hours
- Documentation: 1 hour
- Publishing: 1 hour

---

## Engine Architecture

### High-Level Structure

```
MyEngine/
├── core/
│   ├── Engine.ts           # Main engine class
│   ├── Scene.ts            # Scene management
│   ├── Entity.ts           # Entity base class
│   └── Component.ts        # Component system
├── systems/
│   ├── RenderSystem.ts     # Rendering
│   ├── PhysicsSystem.ts    # Physics
│   ├── InputSystem.ts      # Input
│   └── AudioSystem.ts      # Audio
├── managers/
│   ├── AssetManager.ts     # Asset loading
│   ├── SceneManager.ts     # Scene switching
│   └── EventManager.ts     # Events
├── math/
│   ├── Vector2.ts          # 2D vectors
│   ├── Rectangle.ts        # Rectangles
│   └── Math.ts             # Utilities
├── utils/
│   ├── Timer.ts            # Timing
│   └── Pool.ts             # Object pooling
└── index.ts                # Public API
```

### Engine Class

```typescript
export interface EngineConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  backgroundColor?: string;
  targetFPS?: number;
  enablePhysics?: boolean;
  enableAudio?: boolean;
}

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  
  private assetManager: AssetManager;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private eventManager: EventManager;
  
  private systems: System[] = [];
  private running: boolean = false;
  private lastTime: number = 0;
  
  constructor(config: EngineConfig) {
    this.canvas = config.canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = config.width;
    this.height = config.height;
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Initialize managers
    this.assetManager = new AssetManager();
    this.sceneManager = new SceneManager(this);
    this.inputManager = new InputManager(this.canvas);
    this.audioManager = new AudioManager();
    this.eventManager = new EventManager();
    
    // Initialize systems
    if (config.enablePhysics !== false) {
      this.systems.push(new PhysicsSystem());
    }
    this.systems.push(new RenderSystem(this.ctx));
    if (config.enableAudio !== false) {
      this.systems.push(new AudioSystem(this.audioManager));
    }
    
    this.setupCanvas(config.backgroundColor || '#000000');
  }
  
  private setupCanvas(bgColor: string): void {
    this.canvas.style.backgroundColor = bgColor;
    this.canvas.style.imageRendering = 'pixelated';
  }
  
  // Asset loading
  async loadAssets(assets: { [key: string]: string }): Promise<void> {
    await this.assetManager.loadAll(assets);
  }
  
  getAsset(key: string): HTMLImageElement | HTMLAudioElement {
    return this.assetManager.get(key);
  }
  
  // Scene management
  addScene(name: string, scene: Scene): void {
    this.sceneManager.addScene(name, scene);
  }
  
  setScene(name: string): void {
    this.sceneManager.setScene(name);
  }
  
  getCurrentScene(): Scene | null {
    return this.sceneManager.getCurrentScene();
  }
  
  // Input
  isKeyDown(key: string): boolean {
    return this.inputManager.isKeyDown(key);
  }
  
  isKeyPressed(key: string): boolean {
    return this.inputManager.isKeyPressed(key);
  }
  
  getMousePosition(): { x: number; y: number } {
    return this.inputManager.getMousePosition();
  }
  
  // Audio
  playSound(key: string, volume: number = 1): void {
    this.audioManager.play(key, volume);
  }
  
  playMusic(key: string, volume: number = 0.5, loop: boolean = true): void {
    this.audioManager.playMusic(key, volume, loop);
  }
  
  stopMusic(): void {
    this.audioManager.stopMusic();
  }
  
  // Events
  on(event: string, handler: Function): void {
    this.eventManager.on(event, handler);
  }
  
  emit(event: string, ...args: any[]): void {
    this.eventManager.emit(event, ...args);
  }
  
  // Game loop
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  stop(): void {
    this.running = false;
  }
  
  private gameLoop = (): void => {
    if (!this.running) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number): void {
    // Update input
    this.inputManager.update();
    
    // Update current scene
    const scene = this.sceneManager.getCurrentScene();
    if (scene) {
      scene.update(deltaTime);
    }
    
    // Update systems
    this.systems.forEach(system => {
      if (scene) {
        system.update(deltaTime, scene.getEntities());
      }
    });
  }
  
  private render(): void {
    // Clear screen
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Render current scene
    const scene = this.sceneManager.getCurrentScene();
    if (scene) {
      scene.render(this.ctx);
    }
  }
  
  // Getters
  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }
  getContext(): CanvasRenderingContext2D { return this.ctx; }
}
```

---

## Core Engine API

### Scene Class

```typescript
export abstract class Scene {
  protected engine: Engine;
  protected entities: Entity[] = [];
  
  constructor(engine: Engine) {
    this.engine = engine;
  }
  
  // Lifecycle methods
  abstract onEnter(): void;
  abstract onExit(): void;
  
  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      if (entity.active) {
        entity.update(deltaTime);
      }
    });
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    this.entities.forEach(entity => {
      if (entity.visible) {
        entity.render(ctx);
      }
    });
  }
  
  addEntity(entity: Entity): void {
    this.entities.push(entity);
  }
  
  removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }
  
  getEntities(): Entity[] {
    return this.entities;
  }
  
  findEntitiesByTag(tag: string): Entity[] {
    return this.entities.filter(e => e.tag === tag);
  }
}
```

### Entity Class

```typescript
export class Entity {
  public x: number = 0;
  public y: number = 0;
  public width: number = 32;
  public height: number = 32;
  public tag: string = '';
  public active: boolean = true;
  public visible: boolean = true;
  
  protected components: Map<string, Component> = new Map();
  
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  
  addComponent<T extends Component>(component: T): T {
    this.components.set(component.constructor.name, component);
    component.onAttach(this);
    return component;
  }
  
  getComponent<T extends Component>(componentType: new (...args: any[]) => T): T | undefined {
    return this.components.get(componentType.name) as T;
  }
  
  hasComponent<T extends Component>(componentType: new (...args: any[]) => T): boolean {
    return this.components.has(componentType.name);
  }
  
  removeComponent<T extends Component>(componentType: new (...args: any[]) => T): void {
    const component = this.components.get(componentType.name);
    if (component) {
      component.onDetach();
      this.components.delete(componentType.name);
    }
  }
  
  update(deltaTime: number): void {
    this.components.forEach(component => {
      component.update(deltaTime);
    });
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    this.components.forEach(component => {
      component.render(ctx);
    });
  }
}
```

### Component Class

```typescript
export abstract class Component {
  protected entity!: Entity;
  
  onAttach(entity: Entity): void {
    this.entity = entity;
  }
  
  onDetach(): void {
    // Override if needed
  }
  
  update(deltaTime: number): void {
    // Override in subclasses
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Override in subclasses
  }
}
```

---

## Asset Management

```typescript
export class AssetManager {
  private assets: Map<string, HTMLImageElement | HTMLAudioElement> = new Map();
  private loadingProgress: number = 0;
  
  async loadAll(assets: { [key: string]: string }): Promise<void> {
    const entries = Object.entries(assets);
    const promises: Promise<void>[] = [];
    
    entries.forEach(([key, url], index) => {
      if (this.isImage(url)) {
        promises.push(this.loadImage(key, url));
      } else if (this.isAudio(url)) {
        promises.push(this.loadAudio(key, url));
      }
    });
    
    await Promise.all(promises);
    this.loadingProgress = 1;
  }
  
  private isImage(url: string): boolean {
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
  }
  
  private isAudio(url: string): boolean {
    return /\.(mp3|wav|ogg)$/i.test(url);
  }
  
  private async loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.assets.set(key, image);
        resolve();
      };
      image.onerror = reject;
      image.src = url;
    });
  }
  
  private async loadAudio(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.assets.set(key, audio);
        resolve();
      };
      audio.onerror = reject;
      audio.src = url;
    });
  }
  
  get(key: string): HTMLImageElement | HTMLAudioElement {
    const asset = this.assets.get(key);
    if (!asset) {
      throw new Error(`Asset not found: ${key}`);
    }
    return asset;
  }
  
  getImage(key: string): HTMLImageElement {
    return this.get(key) as HTMLImageElement;
  }
  
  getAudio(key: string): HTMLAudioElement {
    return this.get(key) as HTMLAudioElement;
  }
  
  has(key: string): boolean {
    return this.assets.has(key);
  }
  
  getProgress(): number {
    return this.loadingProgress;
  }
}
```

---

## Complete Example Game Using Engine

```typescript
import { Engine, Scene, Entity, Component } from './engine';

// Player component
class PlayerComponent extends Component {
  private speed: number = 5;
  
  update(deltaTime: number): void {
    const engine = (this.entity as any).engine;
    
    if (engine.isKeyDown('ArrowLeft')) {
      this.entity.x -= this.speed;
    }
    if (engine.isKeyDown('ArrowRight')) {
      this.entity.x += this.speed;
    }
    if (engine.isKeyDown('Space') && engine.isKeyPressed('Space')) {
      engine.playSound('jump');
    }
  }
}

// Sprite renderer component
class SpriteComponent extends Component {
  constructor(private imageName: string) {
    super();
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    const engine = (this.entity as any).engine;
    const image = engine.getAsset(this.imageName);
    ctx.drawImage(
      image as HTMLImageElement,
      this.entity.x,
      this.entity.y,
      this.entity.width,
      this.entity.height
    );
  }
}

// Game scene
class GameScene extends Scene {
  onEnter(): void {
    // Create player
    const player = new Entity(100, 400);
    player.width = 32;
    player.height = 32;
    player.tag = 'player';
    player.addComponent(new PlayerComponent());
    player.addComponent(new SpriteComponent('player'));
    this.addEntity(player);
    
    // Create enemies
    for (let i = 0; i < 5; i++) {
      const enemy = new Entity(200 + i * 100, 400);
      enemy.width = 32;
      enemy.height = 32;
      enemy.tag = 'enemy';
      enemy.addComponent(new SpriteComponent('enemy'));
      this.addEntity(enemy);
    }
    
    this.engine.playMusic('bgm');
  }
  
  onExit(): void {
    this.engine.stopMusic();
  }
}

// Initialize engine
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const engine = new Engine({
  canvas,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB'
});

// Load assets
await engine.loadAssets({
  'player': 'assets/player.png',
  'enemy': 'assets/enemy.png',
  'jump': 'assets/jump.wav',
  'bgm': 'assets/music.mp3'
});

// Add scene
engine.addScene('game', new GameScene(engine));
engine.setScene('game');

// Start
engine.start();
```

---

## Publishing Your Engine

### package.json

```json
{
  "name": "my-2d-engine",
  "version": "1.0.0",
  "description": "A simple 2D game engine for TypeScript",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["game", "engine", "2d", "canvas", "typescript"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### README.md

```markdown
# My 2D Engine

A lightweight 2D game engine for TypeScript.

## Installation

```bash
npm install my-2d-engine
```

## Quick Start

```typescript
import { Engine, Scene } from 'my-2d-engine';

const engine = new Engine({
  canvas: document.getElementById('canvas'),
  width: 800,
  height: 600
});

class GameScene extends Scene {
  onEnter() {
    // Setup your game
  }
  onExit() {
    // Cleanup
  }
}

engine.addScene('game', new GameScene(engine));
engine.setScene('game');
engine.start();
```

## Features

- Entity-Component System
- Scene Management
- Asset Loading
- Input Handling
- Audio Support
- Physics (optional)

## Documentation

See [docs](./docs) for full API reference.

## License

MIT
```

---

## Summary

### What You've Learned

1. **Engine Architecture:**
   - Modular system design
   - Clean API surface
   - Plugin architecture
   - Configuration options

2. **Core Systems:**
   - Asset management
   - Scene management
   - Entity-Component system
   - Input handling
   - Audio management

3. **Publishing:**
   - npm package structure
   - TypeScript definitions
   - Documentation
   - Examples

### Key Takeaways

- **Separate engine from game code**
- **Design clean APIs**
- **Document thoroughly**
- **Provide examples**
- **Test extensively**
- **Version properly**

---

**Congratulations! You've completed the entire curriculum!** 🎉🎮✨

**You've learned:**
- Canvas rendering fundamentals
- Physics and collision detection
- Entity and animation systems
- Level design and cameras
- Gameplay and AI
- Performance optimization
- Architecture patterns
- Building a game engine

**You're now ready to:**
- Build commercial-quality 2D games
- Create your own game engine
- Contribute to open-source projects
- Teach others game development

**Keep building and never stop learning!** 🚀
