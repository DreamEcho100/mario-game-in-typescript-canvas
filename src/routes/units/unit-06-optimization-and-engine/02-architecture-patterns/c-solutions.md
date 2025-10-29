# Architecture Patterns - Solutions

**Unit 06: Optimization, Polish & Engine Abstractions | Topic 02 | Complete Solutions**

---

All solutions follow the comprehensive patterns from the lesson.

## Key Patterns

**ECS Implementation:**
- EntityManager for entity/component storage
- Systems iterate over components
- Data and logic separated

**Event Bus:**
- Map of event names to handler arrays
- on/off/emit methods
- Decouples producers and consumers

**Command Pattern:**
- Interface with execute() and undo()
- Store previous state for undo
- Queue commands for delayed execution

**Factory:**
- Centralized creation logic
- Switch on type
- Configure components per entity type

**Service Locator:**
- Static Map of services
- Type-safe get method
- Register once, access anywhere

---

**Build incrementally using lesson examples!**
