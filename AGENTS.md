# 🎨 AGENTS.md — Modern Design System & AI Agent Guide
> **Beautiful, Production-Grade UI/UX for HR Dashboard**
> Stack: React + Vite + Tailwind CSS v4 + TypeScript + Radix UI + Custom Design System

---

## 📌 Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Agent Behavior Rules](#2-agent-behavior-rules)
3. [Tech Stack](#3-tech-stack)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Spacing & Layout](#6-spacing--layout)
7. [Shadows & Depth](#7-shadows--depth)
8. [Components](#8-components)
9. [Animations](#9-animations)
10. [Accessibility](#10-accessibility)
11. [File Structure](#11-file-structure)
12. [Code Quality](#12-code-quality)
13. [Output Checklist](#13-output-checklist)

---

## 1. Design Philosophy

### Core Principles
✨ **Beautiful First** — Every UI element should be visually appealing
🎯 **Purposeful** — Every design decision serves a function
⚡ **Smooth** — Animations and transitions feel natural
♿ **Accessible** — Beautiful doesn't mean exclusive
📱 **Mobile-First** — Start small, scale up gracefully

### Visual Identity
- **Clean & Modern** — Minimal visual clutter, maximum clarity
- **Subtle Depth** — Layered shadows create hierarchy
- **Vibrant Accents** — Strategic use of color for emphasis
- **Smooth Motion** — 150-300ms transitions with custom easing
- **Glass Morphism** — Subtle blur effects for elevated surfaces

---

## 2. Agent Behavior Rules

### ✅ Always
- Read the full request before writing code
- Use the **design system CSS variables** (e.g., `var(--primary-600)`, `var(--shadow-lg)`)
- Apply **smooth animations** to all interactive elements
- Write **TypeScript** with proper interfaces (no `any`)
- Add **ARIA attributes** to interactive elements
- Keep components **under 150 lines** (decompose if larger)
- Use **lucide-react** for icons (consistent 16-24px sizes)
- Start **mobile-first**, then scale up with breakpoints
- Add **loading**, **error**, and **empty** states
- Use **gradient backgrounds** for primary buttons

### ❌ Never
- Never hardcode hex colors — use design tokens
- Never use inline `style={{}}` (unless dynamic values)
- Never skip focus states — always visible rings
- Never use `any` in TypeScript
- Never create walls of text — use proper typography hierarchy
- Never mix animation timings — stay consistent
- Never remove backdrop blur from modals/overlays
- Never use harsh shadows — keep them subtle and layered

---

## 3. Tech Stack

### Core Technologies
```json
{
  "react": "^18.3.1",
  "typescript": "^5.x",
  "vite": "^6.3.5",
  "tailwindcss": "^4.1.3",
  "@radix-ui/*": "latest",
  "lucide-react": "^0.487.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "*",
  "tailwind-merge": "*"
}
```

### CSS Architecture
```
src/
├── index.css              # Tailwind v4 generated styles
├── styles/
│   └── design-system.css  # Custom design system (colors, shadows, etc.)
```

### Import Order
```tsx
// 1. React
import React, { useState, useEffect } from "react"

// 2. Third-party libraries
import axios from "axios"
import { useForm } from "react-hook-form"

// 3. Icons
import { Users, Calendar, Check } from "lucide-react"

// 4. UI Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 5. Local components
import { StatsCard } from "@/components/StatsCard"

// 6. Utils & Types
import { cn } from "@/components/ui/utils"
import type { Staff } from "@/types"
```

---

## 4. Color System

### Primary Palette (Refined Blue)
```css
--primary-50: #eff6ff   /* Background accents */
--primary-100: #dbeafe  /* Hover states */
--primary-500: #3b82f6  /* Icons, highlights */
--primary-600: #2563eb  /* Primary buttons */
--primary-700: #1d4ed8  /* Hover states */
```

### Slate Grays (Warm & Modern)
```css
--slate-50: #f8fafc     /* Page background */
--slate-100: #f1f5f9    /* Card backgrounds */
--slate-200: #e2e8f0    /* Borders */
--slate-400: #94a3b8    /* Muted text */
--slate-600: #475569    /* Secondary text */
--slate-800: #1e293b    /* Primary text */
--slate-900: #0f172a    /* Headings */
```

### Status Colors
```css
/* Success */
--success-100: #dcfce7
--success-500: #22c55e
--success-700: #15803d

/* Warning */
--warning-100: #fef3c7
--warning-500: #f59e0b

/* Error */
--error-100: #fee2e2
--error-500: #ef4444
--error-600: #dc2626

/* Purple Accent */
--purple-100: #f3e8ff
--purple-500: #a855f7
```

### Usage Examples
```tsx
// ✅ Primary button with gradient
<button className="btn-primary">
  Save Changes
</button>

// ✅ Status badge
<span className="badge badge-success">Active</span>

// ✅ Text hierarchy
<h1 className="text-primary">Page Title</h1>
<p className="text-secondary">Supporting text</p>
<span className="text-muted">Meta information</span>
```

---

## 5. Typography

### Font Stack
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale
```tsx
// Display / Hero
text-4xl (36px) — font-bold

// Page Titles
text-3xl (30px) — font-bold

// Section Headers
text-2xl (24px) — font-semibold

// Card Titles
text-xl (20px) — font-semibold

// Body Text
text-base (15px) — font-normal

// Small / Meta
text-sm (14px) — font-medium
text-xs (12px) — font-medium
```

### Best Practices
```tsx
// ✅ Good: Proper hierarchy
<div className="space-y-1">
  <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
  <p className="text-secondary">Welcome back, John</p>
</div>

// ❌ Bad: Inconsistent sizing
<h1 className="text-lg">Dashboard</h1>
<p className="text-xl">Welcome back</p>
```

---

## 6. Spacing & Layout

### Spacing Scale
```
--space-1: 4px    (0.25rem)
--space-2: 8px    (0.5rem)
--space-3: 12px   (0.75rem)
--space-4: 16px   (1rem)
--space-5: 20px   (1.25rem)
--space-6: 24px   (1.5rem)
--space-8: 32px   (2rem)
--space-10: 40px  (2.5rem)
--space-12: 48px  (3rem)
--space-16: 64px  (4rem)
```

### Layout Patterns
```tsx
// Card Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

// Page Container
<main className="min-h-screen bg-secondary">
  <div className="container mx-auto max-w-7xl px-6 py-8">
    {children}
  </div>
</main>

// Split View
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

---

## 7. Shadows & Depth

### Shadow Scale
```css
--shadow-sm:   0 1px 3px rgba(15,23,42,0.08)
--shadow-md:   0 4px 6px rgba(15,23,42,0.12)
--shadow-lg:   0 10px 15px rgba(15,23,42,0.12)
--shadow-xl:   0 20px 25px rgba(15,23,42,0.15)
--shadow-2xl:  0 25px 50px rgba(15,23,42,0.15)
```

### Glow Effects (Focus States)
```css
--glow-primary:  0 0 0 3px rgba(59,130,246,0.15)
--glow-success:  0 0 0 3px rgba(34,197,94,0.15)
--glow-error:    0 0 0 3px rgba(239,68,68,0.15)
```

### Usage
```tsx
// ✅ Card with subtle shadow
<div className="card shadow-sm hover:shadow-md transition-shadow">

// ✅ Elevated card with lift effect
<div className="card-elevated hover-lift">

// ✅ Modal with deep shadow
<div className="modal shadow-2xl">
```

---

## 8. Components

### Button Variants
```tsx
// Primary (Gradient)
<button className="btn btn-primary">
  Primary Action
</button>

// Secondary
<button className="btn btn-secondary">
  Secondary
</button>

// Ghost
<button className="btn btn-ghost">
  Ghost
</button>

// Danger
<button className="btn btn-danger">
  Delete
</button>

// Sizes
<button className="btn btn-sm">Small</button>
<button className="btn btn-md">Medium</button>
<button className="btn btn-lg">Large</button>
```

### Input Fields
```tsx
// Standard Input
<input className="input" placeholder="Enter email..." />

// With Icon
<div className="input-wrapper">
  <Search className="input-icon" />
  <input className="input input-with-icon" placeholder="Search..." />
</div>

// Error State
<input className="input input-error" aria-invalid="true" />
```

### Cards
```tsx
// Basic Card
<div className="card p-6">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-secondary">Card content goes here...</p>
</div>

// Elevated Card (Hover Lift)
<div className="card card-elevated p-6 hover-lift">
  {children}
</div>

// Glass Card
<div className="card card-glass p-6">
  {children}
</div>
```

### Badges
```tsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
<span className="badge badge-secondary">Neutral</span>
```

### Modal/Dialog
```tsx
// Modal Structure
<div className="modal-overlay" onClick={handleClose}>
  <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
    <div className="modal-header">
      <h2 className="modal-title">Modal Title</h2>
      <button className="btn btn-icon btn-ghost">
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="modal-content">
      {children}
    </div>
    <div className="modal-footer">
      <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Tables
```tsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th className="table-header-cell">Name</th>
        <th className="table-header-cell">Status</th>
        <th className="table-header-cell">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr className="table-row">
        <td className="table-cell">John Doe</td>
        <td className="table-cell"><Badge>Active</Badge></td>
        <td className="table-cell">
          <button className="btn btn-ghost btn-icon">
            <Edit className="w-4 h-4" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Loading States
```tsx
// Skeleton Loader
<div className="space-y-3">
  <div className="skeleton skeleton-title" />
  <div className="skeleton skeleton-text" />
  <div className="skeleton skeleton-text" />
</div>

// Spinner
<Loader2 className="w-6 h-6 animate-spin" />

// Button Loading
<button className="btn btn-primary" disabled={isLoading}>
  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

---

## 9. Animations

### Animation Classes
```css
.animate-fade-in      /* Basic fade in */
.animate-slide-up     /* Slide up entrance */
.animate-slide-down   /* Slide down entrance */
.animate-scale-in     /* Scale from 0.95 to 1 */
.animate-shimmer      /* Skeleton shimmer effect */
.animate-pulse        /* Pulsing indicator */
.animate-spin         /* Rotating spinner */
```

### Transition Utilities
```tsx
// Fast (150ms)
className="transition-fast hover:bg-tertiary"

// Base (200ms)
className="transition hover:shadow-md"

// Slow (300ms)
className="transition-slow hover:scale-105"
```

### Hover Effects
```tsx
// Lift on Hover
<div className="hover-lift">
  Card that lifts up
</div>

// Scale on Hover
<div className="hover-scale">
  Card that scales up
</div>
```

### Timing Guidelines
- **Micro-interactions**: 150ms (button hover, focus)
- **Standard transitions**: 200ms (color changes, small movements)
- **Entrance animations**: 300ms (modals, panels)
- **Complex sequences**: 500ms+ (multi-step animations)

---

## 10. Accessibility

### Non-Negotiable Rules
✅ Every `<img>` has `alt` text
✅ Every input has a connected `<label>`
✅ Icon buttons have `aria-label`
✅ Focus rings are always visible
✅ Color is never the only state indicator
✅ Keyboard navigation works everywhere

### ARIA Patterns
```tsx
// Icon Button
<button 
  className="btn btn-icon" 
  aria-label="Close dialog"
>
  <X className="w-5 h-5" />
</button>

// Loading State
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Spinner /> : content}
</div>

// Required Field
<Label htmlFor="email">
  Email <span aria-hidden="true" className="text-error">*</span>
</Label>
<Input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-describedby="email-error"
/>

// Error Message
{error && (
  <p id="email-error" role="alert" className="text-error text-sm">
    {error}
  </p>
)}
```

### Focus Management
```tsx
// ✅ Always visible focus ring
className="focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"

// ❌ Never remove without replacement
className="focus:outline-none" // BAD!
```

---

## 11. File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── utils.ts           # cn() utility
│   ├── StatsCard.tsx          # Reusable components
│   ├── LeaveManagementView.tsx
│   └── LeaveAllocationView.tsx
│
├── styles/
│   ├── design-system.css      # Modern design system ⭐
│   └── globals.css            # Additional globals
│
├── services/                  # API layer
│   ├── apiServices.ts
│   ├── leaveManagementService.ts
│   └── authService.ts
│
├── data/                      # Mock data
├── config/                    # Config files
├── App.tsx                    # Main app
├── main.tsx                   # Entry point
└── index.css                  # Tailwind v4
```

---

## 12. Code Quality

### TypeScript Standards
```ts
// ✅ Typed props
interface CardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

// ✅ Union types
type Status = 'pending' | 'approved' | 'rejected'

// ✅ Generics
interface ApiResponse<T> {
  data: T
  error: string | null
  status: number
}

// ❌ Never use any
const handler = (data: any) => {} // BAD
```

### Component Structure
```tsx
import { cn } from "@/components/ui/utils"
import type { HTMLAttributes } from "react"

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  isLoading?: boolean
}

export function MyComponent({ title, isLoading, className, ...props }: Props) {
  return (
    <div className={cn("card p-6", className)} {...props}>
      {isLoading ? <Spinner /> : title}
    </div>
  )
}
```

---

## 13. Output Checklist

### Visual Design
- [ ] Uses design system colors (no hex codes)
- [ ] Proper shadow depth (shadow-sm → shadow-xl)
- [ ] Smooth animations on interactive elements
- [ ] Consistent spacing (4px grid)
- [ ] Mobile-first responsive design
- [ ] Glass morphism where appropriate

### Code Quality
- [ ] TypeScript with no `any`
- [ ] All props typed with interfaces
- [ ] Named exports (no anonymous defaults)
- [ ] Proper import order
- [ ] No console.log in production

### UX & States
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Hover states visible
- [ ] Focus rings present

### Accessibility
- [ ] All images have `alt`
- [ ] Inputs have labels
- [ ] Icon buttons have `aria-label`
- [ ] Keyboard navigable
- [ ] Color not sole indicator

---

## 🎨 Quick Reference

### Most Used Classes
```tsx
// Layout
className="flex items-center gap-4"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Cards
className="card card-elevated p-6 hover-lift"

// Buttons
className="btn btn-primary btn-md"
className="btn btn-ghost btn-icon"

// Typography
className="text-2xl font-bold text-primary"
className="text-sm text-secondary"

// Status
className="badge badge-success"

// Effects
className="transition-all hover:shadow-md"
className="animate-fade-in"
```

### Color Quick Pick
```
Primary: var(--primary-600)
Success: var(--success-500)
Error: var(--error-500)
Warning: var(--warning-500)
Text: var(--text-primary/secondary/tertiary)
Background: var(--bg-primary/secondary)
Border: var(--border-light/medium)
```

---

*Last updated: Design System v2.0 — Making HR Dashboards Beautiful Again ✨*
