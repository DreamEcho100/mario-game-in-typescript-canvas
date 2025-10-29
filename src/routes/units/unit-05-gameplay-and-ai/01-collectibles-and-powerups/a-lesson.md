# Topic 01: Collectibles and Power-ups

**Unit 05: Gameplay, AI & Interactions | Topic 01 of 04**

> **Learning Objective:** Master the implementation of collectible items (coins, stars) and power-up systems (mushrooms, fire flowers) that enhance gameplay and create progression in your Mario-style platformer.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Collectible Systems](#collectible-systems)
4. [Power-up Systems](#power-up-systems)
5. [Advanced Features](#advanced-features)
6. [Performance Considerations](#performance-considerations)
7. [Application to Mario Game](#application-to-mario-game)
8. [Summary](#summary)
9. [Next Steps](#next-steps)

---

## Introduction

### What and Why

Collectibles and power-ups are fundamental gameplay elements that:

- **Reward exploration** and skillful play
- **Create progression** as players gain new abilities
- **Add variety** to gameplay mechanics
- **Motivate players** to take risks for rewards
- **Enable difficulty curves** through power loss

In Super Mario Bros., collecting coins, mushrooms, and fire flowers transforms gameplay from simple running and jumping into a rich, strategic experience.

### What You'll Learn

By the end of this lesson, you will be able to:

- ✅ Implement collectible items (coins, gems, stars)
- ✅ Create power-up systems that modify player abilities
- ✅ Design spawn and respawn mechanics
- ✅ Add visual and audio feedback for collections
- ✅ Build power-up state machines
- ✅ Handle power-up persistence across levels
- ✅ Create combo systems and score multipliers
- ✅ Implement item blocks and question marks
- ✅ Add particle effects for polish

### Prerequisites

Before starting this topic, you should understand:

- **Entity management** (Unit 03, Topic 03)
- **Collision detection** (Unit 04, Topic 02)
- **Animation systems** (Unit 03, Topic 02)
- **State management** (Unit 01, Topic 04)

### Time Investment

- **Reading:** 90 minutes
- **Exercises:** 3-4 hours
- **Practice Project:** 4-6 hours

---

## Core Concepts

### Collectible Design Principles

#### 1. **Visibility and Feedback**

Collectibles must be:
- **Easily visible** (bright colors, animations)
- **Responsive** (immediate feedback when collected)
- **Satisfying** (sound effects, particles, score popup)

```
Before Collection:        During Collection:        After Collection:
                         
   💰                        ✨💰✨                      +100
  Coin                     Sparkles!                   (fade)
(spinning)                (expanding)                 (disappear)
```

#### 2. **Risk vs Reward**

Placement should create interesting choices:

```
Risk Assessment:

Low Risk:        Medium Risk:           High Risk:
  💰               💰                     💰💰💰
  ══               ══      🔥             ══    ══
  ══    Safe       ══  Jump over           Big gap
                        hazard             (risky!)
```

#### 3. **Power-up Progression**

```
Power State Progression:

Small Mario  →  Super Mario  →  Fire Mario
   🔴            🔴🔴             🔴🔴🔥
   
Weak           Medium           Strong
No abilities   Size, durability  Fire, size
```

---

## Collectible Systems

### Basic Collectible Class

```typescript
interface CollectibleConfig {
  type: 'coin' | 'gem' | 'star' | 'life';
  value: number;
  sprite: HTMLImageElement;
  frameCount?: number;
  respawns?: boolean;
}

class Collectible {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  
  type: string;
  value: number;
  sprite: HTMLImageElement;
  
  isCollected: boolean = false;
  animationFrame: number = 0;
  animationTimer: number = 0;
  frameCount: number;
  
  // Physics
  velocityY: number = 0;
  gravity: number = 0.5;
  
  // Visual effects
  opacity: number = 1;
  scaleX: number = 1;
  scaleY: number = 1;
  
  constructor(x: number, y: number, config: CollectibleConfig) {
    this.x = x;
    this.y = y;
    this.type = config.type;
    this.value = config.value;
    this.sprite = config.sprite;
    this.frameCount = config.frameCount || 1;
  }
  
  update(deltaTime: number): void {
    if (this.isCollected) {
      this.updateCollectionAnimation(deltaTime);
      return;
    }
    
    // Idle animation (spinning, bobbing)
    this.updateIdleAnimation(deltaTime);
  }
  
  private updateIdleAnimation(deltaTime: number): void {
    // Spinning animation
    this.animationTimer += deltaTime;
    if (this.animationTimer >= 0.1) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % this.frameCount;
    }
    
    // Bobbing motion
    const bobSpeed = 2;
    const bobAmount = 5;
    this.y += Math.sin(Date.now() / 200 * bobSpeed) * bobAmount * deltaTime;
  }
  
  private updateCollectionAnimation(deltaTime: number): void {
    // Float upward and fade
    this.velocityY -= 0.3; // Move up
    this.y += this.velocityY;
    
    this.opacity -= deltaTime * 2;
    this.scaleX += deltaTime * 2;
    this.scaleY += deltaTime * 2;
  }
  
  collect(): void {
    this.isCollected = true;
    this.velocityY = -5; // Initial upward velocity
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (this.opacity <= 0) return;
    
    ctx.save();
    
    // Apply camera offset
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    
    // Apply opacity
    ctx.globalAlpha = this.opacity;
    
    // Apply scaling (center-based)
    ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-this.width / 2, -this.height / 2);
    
    // Draw sprite frame
    const frameWidth = this.sprite.width / this.frameCount;
    ctx.drawImage(
      this.sprite,
      this.animationFrame * frameWidth, 0,
      frameWidth, this.sprite.height,
      0, 0,
      this.width, this.height
    );
    
    ctx.restore();
  }
  
  isReadyToRemove(): boolean {
    return this.isCollected && this.opacity <= 0;
  }
}
```

---

### Collision Detection for Collectibles

```typescript
class CollectibleManager {
  collectibles: Collectible[] = [];
  
  update(deltaTime: number, player: Player): void {
    for (const collectible of this.collectibles) {
      if (!collectible.isCollected) {
        // Check collision with player
        if (this.checkCollision(player, collectible)) {
          this.collectItem(collectible, player);
        }
      }
      
      collectible.update(deltaTime);
    }
    
    // Remove fully animated collectibles
    this.collectibles = this.collectibles.filter(c => !c.isReadyToRemove());
  }
  
  private checkCollision(player: Player, collectible: Collectible): boolean {
    return !(
      player.x + player.width < collectible.x ||
      player.x > collectible.x + collectible.width ||
      player.y + player.height < collectible.y ||
      player.y > collectible.y + collectible.height
    );
  }
  
  private collectItem(collectible: Collectible, player: Player): void {
    collectible.collect();
    
    // Award points
    player.addScore(collectible.value);
    
    // Play sound
    this.playCollectSound(collectible.type);
    
    // Spawn particles
    this.spawnCollectParticles(collectible.x, collectible.y);
    
    // Show score popup
    this.showScorePopup(collectible.x, collectible.y, collectible.value);
  }
  
  private playCollectSound(type: string): void {
    // Play appropriate sound effect
    switch (type) {
      case 'coin':
        // Play coin sound
        break;
      case 'gem':
        // Play gem sound
        break;
      case 'star':
        // Play star sound
        break;
    }
  }
  
  private spawnCollectParticles(x: number, y: number): void {
    // Create sparkle particles (covered in Unit 02, Topic 06)
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 3;
      // Spawn particle with velocity
    }
  }
  
  private showScorePopup(x: number, y: number, value: number): void {
    // Create floating score text
    // "+100" appears and floats upward
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const collectible of this.collectibles) {
      collectible.render(ctx, cameraX, cameraY);
    }
  }
  
  addCollectible(x: number, y: number, config: CollectibleConfig): void {
    this.collectibles.push(new Collectible(x, y, config));
  }
}
```

---

### Score Popup System

```typescript
class ScorePopup {
  x: number;
  y: number;
  value: number;
  opacity: number = 1;
  velocityY: number = -2;
  lifetime: number = 0;
  maxLifetime: number = 1; // seconds
  
  constructor(x: number, y: number, value: number) {
    this.x = x;
    this.y = y;
    this.value = value;
  }
  
  update(deltaTime: number): void {
    this.lifetime += deltaTime;
    
    // Float upward
    this.y += this.velocityY;
    
    // Fade out
    this.opacity = 1 - (this.lifetime / this.maxLifetime);
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    ctx.save();
    
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#FFD700'; // Gold color
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    
    ctx.fillText(`+${this.value}`, screenX, screenY);
    
    ctx.restore();
  }
  
  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }
}

class ScorePopupManager {
  popups: ScorePopup[] = [];
  
  add(x: number, y: number, value: number): void {
    this.popups.push(new ScorePopup(x, y, value));
  }
  
  update(deltaTime: number): void {
    for (const popup of this.popups) {
      popup.update(deltaTime);
    }
    
    this.popups = this.popups.filter(p => !p.isExpired());
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const popup of this.popups) {
      popup.render(ctx, cameraX, cameraY);
    }
  }
}
```

---

## Power-up Systems

### Power-up State Machine

```typescript
enum PowerUpState {
  SMALL = 'small',
  SUPER = 'super',
  FIRE = 'fire',
  INVINCIBLE = 'invincible'
}

interface PowerUpConfig {
  state: PowerUpState;
  duration?: number; // For temporary power-ups
  sprite: HTMLImageElement;
}

class PowerUpItem {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  
  powerUpState: PowerUpState;
  sprite: HTMLImageElement;
  
  // Physics
  velocityX: number = 2; // Power-ups move
  velocityY: number = 0;
  gravity: number = 0.5;
  onGround: boolean = false;
  
  // State
  isCollected: boolean = false;
  isActive: boolean = false;
  spawnAnimation: number = 0; // Emerge from block
  
  constructor(x: number, y: number, config: PowerUpConfig) {
    this.x = x;
    this.y = y;
    this.powerUpState = config.state;
    this.sprite = config.sprite;
  }
  
  update(deltaTime: number, tilemap: TilemapCollisionSystem): void {
    if (this.isCollected) return;
    
    // Spawn animation (emerge from block)
    if (this.spawnAnimation < 1) {
      this.spawnAnimation += deltaTime * 2;
      this.y -= deltaTime * 50; // Rise up
      return;
    }
    
    this.isActive = true;
    
    // Physics
    this.velocityY += this.gravity;
    
    // Horizontal movement
    this.x += this.velocityX;
    
    // Vertical movement with collision
    this.y += this.velocityY;
    
    // Ground collision
    const groundTile = tilemap.getTileAt(this.x, this.y + this.height);
    if (groundTile && groundTile.solid) {
      this.y = Math.floor(this.y / 32) * 32;
      this.velocityY = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    
    // Wall collision (reverse direction)
    const wallTile = tilemap.getTileAt(
      this.x + (this.velocityX > 0 ? this.width : 0),
      this.y + this.height / 2
    );
    if (wallTile && wallTile.solid) {
      this.velocityX *= -1;
    }
  }
  
  collect(): void {
    this.isCollected = true;
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (this.isCollected) return;
    
    ctx.save();
    
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    
    // During spawn animation, clip the sprite
    if (this.spawnAnimation < 1) {
      const clipHeight = this.height * this.spawnAnimation;
      ctx.drawImage(
        this.sprite,
        0, this.sprite.height - clipHeight,
        this.sprite.width, clipHeight,
        screenX, screenY + this.height - clipHeight,
        this.width, clipHeight
      );
    } else {
      ctx.drawImage(this.sprite, screenX, screenY, this.width, this.height);
    }
    
    ctx.restore();
  }
}
```

---

### Player Power-up Integration

```typescript
class Player {
  // ... existing properties ...
  
  powerUpState: PowerUpState = PowerUpState.SMALL;
  invincibilityTimer: number = 0;
  transformAnimation: number = 0;
  
  // Size changes based on power-up
  private readonly SMALL_HEIGHT = 32;
  private readonly SUPER_HEIGHT = 64;
  
  applyPowerUp(powerUp: PowerUpState): void {
    const oldState = this.powerUpState;
    
    // State transitions
    switch (powerUp) {
      case PowerUpState.SUPER:
        if (this.powerUpState === PowerUpState.SMALL) {
          this.powerUpState = PowerUpState.SUPER;
          this.startTransformAnimation();
        }
        break;
        
      case PowerUpState.FIRE:
        if (this.powerUpState !== PowerUpState.SMALL) {
          this.powerUpState = PowerUpState.FIRE;
          this.startTransformAnimation();
        } else {
          // Small Mario gets mushroom first
          this.powerUpState = PowerUpState.SUPER;
          this.startTransformAnimation();
        }
        break;
        
      case PowerUpState.INVINCIBLE:
        this.invincibilityTimer = 10; // 10 seconds
        break;
    }
    
    // Update size
    this.updateSize();
    
    // Play sound
    this.playPowerUpSound();
  }
  
  private updateSize(): void {
    const oldHeight = this.height;
    
    if (this.powerUpState === PowerUpState.SMALL) {
      this.height = this.SMALL_HEIGHT;
    } else {
      this.height = this.SUPER_HEIGHT;
    }
    
    // Adjust position when growing (stay on ground)
    if (this.height > oldHeight) {
      this.y -= (this.height - oldHeight);
    }
  }
  
  private startTransformAnimation(): void {
    this.transformAnimation = 0.5; // 0.5 seconds
  }
  
  takeDamage(): void {
    // Invincibility check
    if (this.invincibilityTimer > 0) return;
    
    // Power-down logic
    switch (this.powerUpState) {
      case PowerUpState.FIRE:
        this.powerUpState = PowerUpState.SUPER;
        this.startInvincibilityFrames();
        break;
        
      case PowerUpState.SUPER:
        this.powerUpState = PowerUpState.SMALL;
        this.updateSize();
        this.startInvincibilityFrames();
        break;
        
      case PowerUpState.SMALL:
        this.die();
        break;
    }
    
    this.playHurtSound();
  }
  
  private startInvincibilityFrames(): void {
    this.invincibilityTimer = 2; // 2 seconds of invincibility after hit
  }
  
  update(deltaTime: number): void {
    // ... existing update logic ...
    
    // Update timers
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= deltaTime;
    }
    
    if (this.transformAnimation > 0) {
      this.transformAnimation -= deltaTime;
    }
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    ctx.save();
    
    // Flashing during invincibility
    if (this.invincibilityTimer > 0) {
      const flash = Math.floor(this.invincibilityTimer * 10) % 2;
      if (flash === 0) {
        ctx.globalAlpha = 0.5;
      }
    }
    
    // Transform animation (flickering between sprites)
    if (this.transformAnimation > 0) {
      const flicker = Math.floor(this.transformAnimation * 20) % 2;
      // Alternate between old and new sprite
    }
    
    // ... existing render logic ...
    
    ctx.restore();
  }
  
  canShootFireball(): boolean {
    return this.powerUpState === PowerUpState.FIRE;
  }
  
  shootFireball(): void {
    if (!this.canShootFireball()) return;
    
    const direction = this.facingRight ? 1 : -1;
    const fireball = new Fireball(
      this.x + this.width / 2,
      this.y + this.height / 2,
      direction
    );
    
    // Add to game's projectile manager
  }
}
```

---

### Fireball Projectile

```typescript
class Fireball {
  x: number;
  y: number;
  width: number = 16;
  height: number = 16;
  
  velocityX: number;
  velocityY: number = 0;
  gravity: number = 0.5;
  bounceVelocity: number = -8;
  
  isActive: boolean = true;
  lifetime: number = 0;
  maxLifetime: number = 3; // 3 seconds
  
  animationFrame: number = 0;
  animationTimer: number = 0;
  
  constructor(x: number, y: number, direction: number) {
    this.x = x;
    this.y = y;
    this.velocityX = direction * 8; // Fast horizontal speed
  }
  
  update(deltaTime: number, tilemap: TilemapCollisionSystem): void {
    this.lifetime += deltaTime;
    if (this.lifetime >= this.maxLifetime) {
      this.isActive = false;
      return;
    }
    
    // Physics
    this.velocityY += this.gravity;
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Ground bounce
    const groundTile = tilemap.getTileAt(this.x, this.y + this.height);
    if (groundTile && groundTile.solid) {
      this.y = Math.floor(this.y / 32) * 32;
      this.velocityY = this.bounceVelocity;
    }
    
    // Wall collision (disappear)
    const wallTile = tilemap.getTileAt(
      this.x + (this.velocityX > 0 ? this.width : 0),
      this.y
    );
    if (wallTile && wallTile.solid) {
      this.explode();
    }
    
    // Animation
    this.animationTimer += deltaTime;
    if (this.animationTimer >= 0.1) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 4;
    }
  }
  
  explode(): void {
    this.isActive = false;
    // Spawn explosion particles
  }
  
  checkEnemyCollision(enemy: Enemy): boolean {
    if (!this.isActive) return false;
    
    const hit = !(
      this.x + this.width < enemy.x ||
      this.x > enemy.x + enemy.width ||
      this.y + this.height < enemy.y ||
      this.y > enemy.y + enemy.height
    );
    
    if (hit) {
      this.explode();
      return true;
    }
    
    return false;
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.isActive) return;
    
    ctx.save();
    
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    
    // Draw spinning fireball (simplified - use sprite in real game)
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(
      screenX + this.width / 2,
      screenY + this.height / 2,
      this.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.restore();
  }
}
```

---

### Question Mark Blocks

```typescript
enum BlockState {
  ACTIVE = 'active',
  HIT = 'hit',
  EMPTY = 'empty'
}

interface BlockContent {
  type: 'coin' | 'powerup' | 'multiple_coins';
  count?: number; // For multiple coins
  powerUpType?: PowerUpState;
}

class QuestionBlock {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  
  state: BlockState = BlockState.ACTIVE;
  content: BlockContent;
  
  // Animation
  hitAnimation: number = 0;
  hitAnimationDuration: number = 0.3;
  animationFrame: number = 0;
  animationTimer: number = 0;
  
  // For multiple coin blocks
  coinsRemaining: number = 0;
  
  constructor(x: number, y: number, content: BlockContent) {
    this.x = x;
    this.y = y;
    this.content = content;
    
    if (content.type === 'multiple_coins') {
      this.coinsRemaining = content.count || 5;
    }
  }
  
  hit(player: Player, collectibleManager: CollectibleManager): void {
    if (this.state === BlockState.EMPTY) return;
    
    this.startHitAnimation();
    
    switch (this.content.type) {
      case 'coin':
        this.spawnCoin(collectibleManager);
        this.state = BlockState.EMPTY;
        break;
        
      case 'powerup':
        this.spawnPowerUp(player);
        this.state = BlockState.EMPTY;
        break;
        
      case 'multiple_coins':
        this.spawnCoin(collectibleManager);
        this.coinsRemaining--;
        if (this.coinsRemaining <= 0) {
          this.state = BlockState.EMPTY;
        }
        break;
    }
    
    this.playHitSound();
  }
  
  private startHitAnimation(): void {
    this.hitAnimation = this.hitAnimationDuration;
  }
  
  private spawnCoin(manager: CollectibleManager): void {
    // Coin pops out of block
    const coin = new Collectible(
      this.x,
      this.y - 32,
      { type: 'coin', value: 100, sprite: coinSprite }
    );
    coin.velocityY = -10; // Pop upward
    manager.collectibles.push(coin);
  }
  
  private spawnPowerUp(player: Player): void {
    const powerUpType = this.determinePowerUpType(player);
    const powerUp = new PowerUpItem(
      this.x,
      this.y - 32,
      { state: powerUpType, sprite: powerUpSprite }
    );
    // Add to game's power-up manager
  }
  
  private determinePowerUpType(player: Player): PowerUpState {
    // Logic: Small Mario gets mushroom, others get fire flower
    if (player.powerUpState === PowerUpState.SMALL) {
      return PowerUpState.SUPER;
    } else {
      return PowerUpState.FIRE;
    }
  }
  
  update(deltaTime: number): void {
    // Update hit animation
    if (this.hitAnimation > 0) {
      this.hitAnimation -= deltaTime;
    }
    
    // Idle animation (blinking)
    if (this.state === BlockState.ACTIVE) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= 0.2) {
        this.animationTimer = 0;
        this.animationFrame = (this.animationFrame + 1) % 4;
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    ctx.save();
    
    let screenX = this.x - cameraX;
    let screenY = this.y - cameraY;
    
    // Hit animation (block moves up and down)
    if (this.hitAnimation > 0) {
      const progress = this.hitAnimation / this.hitAnimationDuration;
      const bounceHeight = Math.sin(progress * Math.PI) * 10;
      screenY -= bounceHeight;
    }
    
    // Draw block
    if (this.state === BlockState.ACTIVE) {
      // Draw animated question mark block
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(screenX, screenY, this.width, this.height);
      
      // Draw "?" symbol
      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', screenX + this.width / 2, screenY + this.height / 2);
    } else {
      // Draw empty/used block
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(screenX, screenY, this.width, this.height);
    }
    
    ctx.restore();
  }
  
  checkPlayerHit(player: Player): boolean {
    // Check if player hit block from below
    const playerTop = player.y;
    const blockBottom = this.y + this.height;
    
    const horizontalOverlap = !(
      player.x + player.width < this.x ||
      player.x > this.x + this.width
    );
    
    const verticalHit = (
      player.velocityY < 0 && // Player moving upward
      playerTop <= blockBottom &&
      playerTop >= blockBottom - 10 // Within collision range
    );
    
    return horizontalOverlap && verticalHit;
  }
}
```

---

## Advanced Features

### Combo System

```typescript
class ComboSystem {
  consecutiveCollections: number = 0;
  comboTimer: number = 0;
  comboWindow: number = 2; // 2 seconds between collections
  
  multipliers: number[] = [1, 2, 3, 5, 10]; // Multiplier per combo level
  
  onCollect(baseValue: number): number {
    // Reset combo if window expired
    if (this.comboTimer <= 0) {
      this.consecutiveCollections = 0;
    }
    
    this.consecutiveCollections++;
    this.comboTimer = this.comboWindow;
    
    // Calculate multiplier
    const comboLevel = Math.min(
      this.consecutiveCollections,
      this.multipliers.length
    );
    const multiplier = this.multipliers[comboLevel - 1];
    
    const finalValue = baseValue * multiplier;
    
    // Show combo indicator
    if (this.consecutiveCollections > 1) {
      this.showComboIndicator(this.consecutiveCollections);
    }
    
    return finalValue;
  }
  
  update(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      
      if (this.comboTimer <= 0) {
        this.consecutiveCollections = 0;
      }
    }
  }
  
  private showComboIndicator(combo: number): void {
    // Display "2x COMBO!", "3x COMBO!" etc.
    console.log(`${combo}x COMBO!`);
  }
  
  getCurrentMultiplier(): number {
    if (this.comboTimer <= 0) return 1;
    
    const comboLevel = Math.min(
      this.consecutiveCollections,
      this.multipliers.length
    );
    return this.multipliers[comboLevel - 1];
  }
}
```

---

### Hidden Collectibles

```typescript
class HiddenCollectible extends Collectible {
  isRevealed: boolean = false;
  revealRadius: number = 50; // How close player must be
  
  update(deltaTime: number, player: Player): void {
    if (!this.isRevealed) {
      const distance = this.getDistanceToPlayer(player);
      if (distance < this.revealRadius) {
        this.reveal();
      }
    }
    
    super.update(deltaTime);
  }
  
  private getDistanceToPlayer(player: Player): number {
    const dx = (this.x + this.width / 2) - (player.x + player.width / 2);
    const dy = (this.y + this.height / 2) - (player.y + player.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  private reveal(): void {
    this.isRevealed = true;
    // Play reveal sound
    // Spawn sparkle particles
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.isRevealed) {
      // Draw subtle hint
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#FFD700';
      const screenX = this.x - cameraX;
      const screenY = this.y - cameraY;
      ctx.fillRect(screenX, screenY, this.width, this.height);
      ctx.restore();
      return;
    }
    
    super.render(ctx, cameraX, cameraY);
  }
}
```

---

### Temporary Power-ups (Star/Invincibility)

```typescript
class InvincibilityPowerUp extends PowerUpItem {
  duration: number = 10; // 10 seconds
  
  applyToPlayer(player: Player): void {
    player.startInvincibility(this.duration);
    
    // Play star music
    // Change player appearance (flashing rainbow colors)
  }
}

// In Player class:
class Player {
  invincibilityTimer: number = 0;
  isInvincible: boolean = false;
  
  startInvincibility(duration: number): void {
    this.invincibilityTimer = duration;
    this.isInvincible = true;
  }
  
  update(deltaTime: number): void {
    // ... existing code ...
    
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= deltaTime;
      
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        // Revert to normal music
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    ctx.save();
    
    if (this.isInvincible) {
      // Rainbow color effect
      const hue = (Date.now() / 10) % 360;
      ctx.filter = `hue-rotate(${hue}deg)`;
    }
    
    // ... existing render code ...
    
    ctx.restore();
  }
  
  checkEnemyCollision(enemy: Enemy): void {
    if (this.isInvincible) {
      // Kill enemy instead of taking damage
      enemy.die();
      return;
    }
    
    // Normal collision logic
    this.takeDamage();
  }
}
```

---

## Performance Considerations

### Efficient Collectible Management

```typescript
class OptimizedCollectibleManager {
  collectibles: Collectible[] = [];
  
  // Spatial hashing for collision detection
  private cellSize: number = 64;
  private grid: Map<string, Collectible[]> = new Map();
  
  update(deltaTime: number, player: Player, camera: Camera): void {
    // Only update collectibles near the camera
    const visibleCollectibles = this.getVisibleCollectibles(camera);
    
    for (const collectible of visibleCollectibles) {
      if (!collectible.isCollected) {
        // Only check collision with nearby collectibles
        const cell = this.getCellKey(player.x, player.y);
        const nearbyCells = this.getNearbyCells(cell);
        
        for (const nearbyCell of nearbyCells) {
          const cellCollectibles = this.grid.get(nearbyCell) || [];
          for (const c of cellCollectibles) {
            if (this.checkCollision(player, c)) {
              this.collectItem(c, player);
            }
          }
        }
      }
      
      collectible.update(deltaTime);
    }
    
    this.collectibles = this.collectibles.filter(c => !c.isReadyToRemove());
    this.updateGrid();
  }
  
  private getVisibleCollectibles(camera: Camera): Collectible[] {
    const buffer = 64; // Extra space outside viewport
    return this.collectibles.filter(c => {
      return c.x + c.width > camera.x - buffer &&
             c.x < camera.x + camera.width + buffer &&
             c.y + c.height > camera.y - buffer &&
             c.y < camera.y + camera.height + buffer;
    });
  }
  
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }
  
  private getNearbyCells(centerCell: string): string[] {
    const [x, y] = centerCell.split(',').map(Number);
    const cells: string[] = [];
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        cells.push(`${x + dx},${y + dy}`);
      }
    }
    
    return cells;
  }
  
  private updateGrid(): void {
    this.grid.clear();
    
    for (const collectible of this.collectibles) {
      const cell = this.getCellKey(collectible.x, collectible.y);
      if (!this.grid.has(cell)) {
        this.grid.set(cell, []);
      }
      this.grid.get(cell)!.push(collectible);
    }
  }
}
```

### Object Pooling for Particles

```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];
  private poolSize: number = 100;
  
  constructor() {
    // Pre-create particles
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(new Particle());
    }
  }
  
  spawn(x: number, y: number, config: ParticleConfig): Particle | null {
    let particle: Particle | undefined;
    
    if (this.pool.length > 0) {
      particle = this.pool.pop();
    } else {
      // Pool exhausted, reuse oldest active particle
      particle = this.active.shift();
    }
    
    if (particle) {
      particle.reset(x, y, config);
      this.active.push(particle);
      return particle;
    }
    
    return null;
  }
  
  update(deltaTime: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const particle = this.active[i];
      particle.update(deltaTime);
      
      if (particle.isDead()) {
        this.active.splice(i, 1);
        this.pool.push(particle);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const particle of this.active) {
      particle.render(ctx, cameraX, cameraY);
    }
  }
}
```

---

## Application to Mario Game

### Complete Mario Collectible System

```typescript
class MarioGame {
  player: Player;
  collectibleManager: CollectibleManager;
  powerUpManager: PowerUpManager;
  blockManager: QuestionBlockManager;
  comboSystem: ComboSystem;
  scorePopupManager: ScorePopupManager;
  
  constructor() {
    this.player = new Player(100, 100);
    this.collectibleManager = new CollectibleManager();
    this.powerUpManager = new PowerUpManager();
    this.blockManager = new QuestionBlockManager();
    this.comboSystem = new ComboSystem();
    this.scorePopupManager = new ScorePopupManager();
    
    this.setupLevel();
  }
  
  private setupLevel(): void {
    // Spawn coins throughout level
    for (let i = 0; i < 20; i++) {
      const x = i * 100 + 200;
      const y = 300;
      this.collectibleManager.addCollectible(x, y, {
        type: 'coin',
        value: 100,
        sprite: coinSprite
      });
    }
    
    // Add question blocks
    this.blockManager.addBlock(300, 200, {
      type: 'coin',
      count: 1
    });
    
    this.blockManager.addBlock(400, 200, {
      type: 'multiple_coins',
      count: 5
    });
    
    this.blockManager.addBlock(500, 200, {
      type: 'powerup',
      powerUpType: PowerUpState.SUPER
    });
    
    // Add hidden collectibles
    this.collectibleManager.addCollectible(250, 400, {
      type: 'star',
      value: 1000,
      sprite: starSprite,
      hidden: true
    });
  }
  
  update(deltaTime: number): void {
    this.player.update(deltaTime);
    
    // Update collectibles and check collisions
    this.collectibleManager.update(deltaTime, this.player);
    
    // Update power-ups
    this.powerUpManager.update(deltaTime, this.player);
    
    // Check block hits
    this.blockManager.checkPlayerHits(this.player, this.collectibleManager);
    this.blockManager.update(deltaTime);
    
    // Update combo system
    this.comboSystem.update(deltaTime);
    
    // Update score popups
    this.scorePopupManager.update(deltaTime);
    
    // Handle player input for fire
    if (this.input.isKeyPressed('X') && this.player.canShootFireball()) {
      this.player.shootFireball();
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render in layers
    this.renderBackground(ctx);
    this.collectibleManager.render(ctx, this.camera.x, this.camera.y);
    this.powerUpManager.render(ctx, this.camera.x, this.camera.y);
    this.blockManager.render(ctx, this.camera.x, this.camera.y);
    this.player.render(ctx, this.camera.x, this.camera.y);
    this.scorePopupManager.render(ctx, this.camera.x, this.camera.y);
    this.renderUI(ctx);
  }
  
  private renderUI(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Score
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`SCORE: ${this.player.score}`, 20, 40);
    
    // Coins collected
    ctx.fillText(`COINS: ${this.player.coins}`, 20, 70);
    
    // Combo indicator
    if (this.comboSystem.getCurrentMultiplier() > 1) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(
        `${this.comboSystem.getCurrentMultiplier()}x COMBO!`,
        canvas.width / 2 - 100,
        100
      );
    }
    
    // Power-up indicator
    this.renderPowerUpIndicator(ctx);
    
    ctx.restore();
  }
  
  private renderPowerUpIndicator(ctx: CanvasRenderingContext2D): void {
    const x = canvas.width - 100;
    const y = 20;
    
    // Draw power-up icon
    switch (this.player.powerUpState) {
      case PowerUpState.SMALL:
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y, 30, 30);
        break;
      case PowerUpState.SUPER:
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y, 30, 60);
        break;
      case PowerUpState.FIRE:
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(x, y, 30, 60);
        // Draw fire indicator
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(x + 35, y + 20, 20, 20);
        break;
    }
    
    // Invincibility timer
    if (this.player.invincibilityTimer > 0) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(
        `★ ${Math.ceil(this.player.invincibilityTimer)}s`,
        x - 50,
        y + 20
      );
    }
  }
}
```

---

## Summary

### What You've Learned

1. **Collectible Systems:**
   - Basic collectible class with animations
   - Collision detection and collection
   - Visual feedback (particles, score popups)
   - Combo systems and multipliers

2. **Power-up Systems:**
   - Power-up state machines
   - Player transformation animations
   - Damage and power-down logic
   - Temporary power-ups (invincibility)

3. **Interactive Blocks:**
   - Question mark blocks
   - Hit detection from below
   - Content spawning (coins, power-ups)
   - Multiple-use blocks

4. **Advanced Features:**
   - Fireball projectiles
   - Hidden collectibles
   - Object pooling for performance
   - Spatial hashing for collision optimization

5. **Mario-Specific Implementation:**
   - Complete collectible/power-up integration
   - UI display for score, coins, power-ups
   - Combo indicators
   - Transform animations

### Key Takeaways

✅ **Collectibles drive exploration** — Place them strategically to reward skillful play

✅ **Power-ups create progression** — State machines manage transformations smoothly

✅ **Feedback is critical** — Sounds, particles, and popups make collecting satisfying

✅ **Performance matters** — Use spatial hashing and object pooling for many collectibles

✅ **Polish sells the experience** — Smooth animations and effects make a huge difference

---

## Next Steps

### Immediate Practice

1. **Complete the exercises** in `b-exercises.md`
2. **Study the solutions** in `c-solutions.md`
3. **Reference the cheat sheet** in `d-notes.md`

### Next Topic

**Unit 05, Topic 02: Enemy AI**
- Learn to create intelligent enemy behaviors
- Implement patrol, chase, and attack patterns
- Build enemy spawners and waves
- Create boss encounters

### Continue Building Your Game

Add to your Mario game:
- More collectible types (gems, stars, 1-ups)
- Additional power-ups (cape, raccoon tail, etc.)
- Secret areas with hidden collectibles
- Achievement system for collecting everything
- Persistent coin counter across levels

---

**You now have the tools to create engaging collectibles and power-up systems! Your game will feel rewarding and strategic. Time to add enemies in the next topic!** 🎮✨
