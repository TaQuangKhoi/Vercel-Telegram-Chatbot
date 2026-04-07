---
description: "Use when writing, refactoring, or reviewing any TypeScript/Next.js code. Enforces Clean Architecture, SOLID principles, and KISS. Apply to new files, new features, API routes, bot handlers, services, and utilities."
applyTo: "src/**"
---

# Architecture Guidelines: Clean Architecture, SOLID, KISS

## Layer Structure

Organize code into distinct layers. Dependencies only point **inward**:

```
src/
  domain/       ← Business entities & interfaces (no framework imports)
  application/  ← Use cases, orchestration (depends on domain only)
  infrastructure/ ← Redis, Telegraf, HTTP (implements domain interfaces)
  app/           ← Next.js routes, Entry points (depends on application)
  lib/           ← Shared infrastructure singletons (bot, redis)
```

- `domain/` must never import from `infrastructure/`, `app/`, or `lib/`
- `application/` must never import from `infrastructure/` directly — depend on interfaces
- `app/api/` routes must be thin: parse request → call use case → return response

## SOLID

### Single Responsibility
- One class/module = one reason to change
- Separate bot command handlers from business logic
- Route handlers only: parse input, call use case, format output

```ts
// Bad: handler doing everything
bot.on(message('text'), async (ctx) => {
  await redis.incr(`user:${ctx.from.id}:messages`);
  const count = await redis.get(`user:${ctx.from.id}:messages`);
  ctx.reply(`Echo: "${ctx.message.text}"\nMessage #${count}`);
});

// Good: handler delegates to a use case
bot.on(message('text'), async (ctx) => {
  const result = await echoMessageUseCase.execute({
    userId: ctx.from.id,
    text: ctx.message.text,
  });
  ctx.reply(result.replyText);
});
```

### Open/Closed
- Extend behavior via new classes/modules, not by editing existing ones
- Use handler registries or strategy patterns for new bot commands

### Liskov Substitution
- Subtypes must be substitutable for their base types without breaking behavior
- Ensure interface implementations fulfill the full contract

### Interface Segregation
- Define narrow, role-specific interfaces; avoid fat interfaces
- `IMessageStore` for persistence, `IMessageFormatter` for formatting — not one combined interface

### Dependency Inversion
- High-level modules (use cases) depend on abstractions, not concrete implementations
- Inject dependencies; never `new` a concrete infrastructure class inside a use case

```ts
// Bad
class EchoMessageUseCase {
  async execute(input: EchoInput) {
    const redis = new Redis(); // ← concrete dependency
    await redis.incr(`user:${input.userId}:messages`);
  }
}

// Good
class EchoMessageUseCase {
  constructor(private readonly store: IMessageStore) {}
  async execute(input: EchoInput) {
    await this.store.incrementMessageCount(input.userId);
  }
}
```

## KISS

- Solve the actual problem, not a hypothetical future problem
- Prefer a plain function over a class if no state is needed
- Prefer `async/await` over promise chains
- Avoid abstractions that are only used once
- If a module is < 20 lines and has one caller, keep it inline

## TypeScript Conventions

- Prefer `interface` over `type` for object shapes that may be implemented or extended
- Use `type` for unions, primitives, and computed types
- Avoid `any`; use `unknown` at system boundaries and narrow with type guards
- Export only what is needed by other modules

## Next.js API Routes

- Route handlers are the outermost layer — keep them thin
- Validate input at the route boundary before passing to use cases
- Return structured JSON errors with appropriate status codes

```ts
// Thin route handler
export async function POST(req: NextRequest) {
  const body = await req.json();
  await bot.handleUpdate(body);
  return NextResponse.json({ status: 'ok' });
}
```

## What NOT to do

- Do not put business logic in `app/api/` route files
- Do not import `telegraf` or `@upstash/redis` directly in use cases or domain
- Do not create abstractions (base classes, generic utilities) for single-use code
- Do not add comments explaining *what* code does — write self-documenting code instead
