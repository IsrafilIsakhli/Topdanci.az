# Codebase Blueprint

This project starts as a modular monolith. The goal is to keep one deployable
backend while drawing strong boundaries between business modules from day one.

## Backend Boundary Rules

- `apps/api/src/common`: framework-level utilities shared across modules.
- `apps/api/src/config`: environment and runtime configuration.
- `apps/api/src/modules/<module>`: one business capability.
- `domain`: pure business rules, no NestJS decorators and no database calls.
- `dto`: request/response validation classes.
- `controller`: HTTP boundary only.
- `service`: application use cases.
- `prisma`: persistence boundary.

Modules must not reach into another module's database details directly. When
cross-module behavior becomes heavy, expose a service or domain event first.

## Current Modules

- `auth`: session and account entry point.
- `categories`: catalog taxonomy.
- `stores`: public stores and store applications.
- `products`: public product catalog.
- `search`: search suggestions now, external search engine later.
- `leads`: WhatsApp/phone/email/store/product view events.
- `media`: product image upload pipeline.
- `seller`: seller dashboard API boundary.
- `admin`: moderation and platform operations.

## Frontend Boundary Rules

- `apps/web/src/app`: routes only.
- `apps/web/src/components`: reusable UI.
- `apps/web/src/lib`: API client, data adapters, formatters.
- Public, seller, and admin screens should share tokens but not business state.

## Non-Negotiable Domain Rule

TopdanBazar is a lead-generation marketplace, not an e-commerce system.

Do not add:

- cart
- checkout
- order
- payment
- shipping
- delivery workflow

Use:

- lead event
- store application
- product inquiry
- WhatsApp click
- phone reveal
- seller dashboard
