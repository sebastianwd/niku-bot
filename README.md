# Niku Bot

A Discord bot built with Sapphire Framework.

## Features

- **AI Chatbot**: Responds to mentions and DMs with streaming AI responses via OpenRouter
- **Crypto Prices**
- **YouTube Search**

## Requirements

- Node.js >= 22.13.1
- pnpm

## Configuration

Create a `.env` file in the root directory:

```env
# Discord
TOKEN=                    # Discord bot token
BOT_OWNER_ID=            # Your Discord user ID

# AI (OpenRouter)
OPENROUTER_API_KEY=      # OpenRouter API key
OPENROUTER_MODEL=        # Model identifier (e.g., "anthropic/claude-3-opus")
SYSTEM_PROMPT=           # System prompt template with {user_content} placeholder

# Crypto
CMC_API_KEY=             # CoinMarketCap API key (optional, falls back to CoinGecko)
```

## Scripts

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Project Structure

```
src/
  commands/     # Discord commands
  listeners/    # Event listeners
  services/     # External API services
  utils/        # Utilities
  constants.ts  # Configuration
  index.ts      # Entry point
```
