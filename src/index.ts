import '~/env'

import { SapphireClient } from '@sapphire/framework'
import { ActivityType, GatewayIntentBits } from 'discord.js'

import { config } from '~/constants'
import { log } from '~/utils/logger'

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  loadMessageCommandListeners: true,
  defaultPrefix: config.DEFAULT_PREFIX,
})

void client.login(config.TOKEN)

client.once('clientReady', () => {
  log.info('Client is ready')

  client.user?.setPresence({
    activities: [
      {
        type: ActivityType.Listening,
        name: config.DEFAULT_PRESENCE,
      },
    ],
  })
})

process.on('uncaughtException', (error) => {
  log.error({ error, stack: error.stack }, 'Uncaught exception')
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1)
  }
})

process.on('unhandledRejection', (reason, promise) => {
  log.error({ reason, promise }, 'Unhandled promise rejection')
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1)
  }
})
