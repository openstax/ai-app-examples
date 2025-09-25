# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (includes setup script that prompts for Promptly API key on first run)
- `npm run build` - Build the app for production using TypeScript and Vite
- `npm run lint` - Run ESLint
- `npm run ci:typecheck` - Run TypeScript type checking without emitting files
- `npm run ci:spelling` - Check spelling using cspell
- `npm run ci` - Run all CI checks (lint and all ci scripts)

## Architecture Overview

This is a React/TypeScript application that demonstrates AI integration patterns using OpenStax's Promptly API. The app is built with Vite and designed to be deployed as a static site.

### Key Architecture Components

**Authentication & API Integration**
- Uses OpenStax Accounts for authentication via `src/context/AuthProvider.tsx`
- Integrates with OpenStax Promptly API for AI operations through `src/utils/ai.ts`
- API configuration in `src/config.ts` defines prompt IDs and available models
- Authentication flow retrieves session tokens to authenticate API calls

**Routing & Navigation**
- Uses React Router with HashRouter for GitHub Pages compatibility
- Main routes defined in `src/main.tsx`: Home, GenerateText, GenerateJson, Chat

**AI Integration Patterns**
The app demonstrates three core AI interaction patterns:

1. **Text Generation** (`src/pages/GenerateText/`) - Single prompt → single response
2. **Chat** (`src/pages/Chat/`) - Conversational interface with message history
3. **Structured Data** (`src/pages/GenerateJson/`) - JSON output with Zod schema validation

**Feedback & Metadata Collection**
All AI operations return an `executionId` that enables additional data collection:

- **Feedback System** (`src/components/FeedbackComponent.tsx`) - Presentational component for Thumbs up/down ratings with optional text feedback
- **ExecutionFeedback** (`src/components/ExecutionFeedback.tsx`) - Full feeback api integration using FeedbackComponent given an executionId prop.
- **Metadata Tracking** - Custom metadata can be associated with executions (e.g., user interactions, answer selections)
- API functions: `setFeedback(executionId, {rating, feedback})` and `setMetadata(executionId, metadata)` in `src/utils/ai.ts`

**Schema Management**
- Uses Zod for runtime schema validation and JSON schema generation
- Schemas defined in `src/pages/GenerateJson/schemas.ts` for assessment questions
- Types are derived from Zod schemas rather than defined separately

**Styling Architecture**
- No CSS framework - uses simple CSS modules per component/page
- Each page has its own `style.css` file
- Global styles in `src/index.css`

### Key Files

- `src/utils/ai.ts` - Core API integration functions (generateText, generateJson, generateChat, setFeedback, setMetadata)
- `src/utils/auth.ts` - Authentication utilities
- `src/config.ts` - API configuration and model definitions
- `src/pages/GenerateJson/schemas.ts` - Zod schemas for structured data generation
- `src/components/FeedbackComponent.tsx` - Reusable feedback UI component with thumbs up/down and text input
- `src/components/ExecutionFeedback.tsx` - Wrapper component that connects feedback UI to AI execution tracking

### Adding New Tools

1. Create a new page in `src/pages/[ToolName]/`
2. Add route to `src/main.tsx`
3. Add navigation link in `src/pages/Home/index.tsx`
4. Follow existing patterns for API integration and styling

### Environment Setup

The app requires a `VITE_API_KEY` environment variable for Promptly API access. The setup script (`scripts/setup.js`) handles initial configuration by prompting for the API key on first run.
