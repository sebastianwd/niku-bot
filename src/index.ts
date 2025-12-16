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

client.once('ready', () => {
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

process.on('uncaughtException', (stderr) => {
  log.error('uncaughtException')
  log.trace(stderr.message)
})

process.on('unhandledRejection', (stderr) => {
  log.error('unhandledRejection')
  log.trace(stderr as string)
})
