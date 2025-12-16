export const config = {
  TOKEN: process.env.TOKEN || '',
  BOT_OWNER_ID: process.env.BOT_OWNER_ID || '',
  CMC_API_KEY: process.env.CMC_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || '',
  SYSTEM_PROMPT: process.env.SYSTEM_PROMPT || '',
  PROMPT_CUTOFF_PATTERN: process.env.PROMPT_CUTOFF_PATTERN || '',
  DEFAULT_PREFIX: process.env.DEFAULT_PREFIX || ',',
  DEFAULT_PRESENCE: process.env.DEFAULT_PRESENCE || '',
}
