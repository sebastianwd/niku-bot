import '~/env'

import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { Events, Listener } from '@sapphire/framework'
import { streamText } from 'ai'
import type { Message } from 'discord.js'

import { config } from '~/constants'
import { log } from '~/utils/logger'

const openrouter = createOpenRouter({
  apiKey: config.OPENROUTER_API_KEY,
})

export class MessageListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'messageCreateConversation',
      event: Events.MessageCreate,
    })
  }

  public async run(message: Message) {
    if (message.author.bot || !message.content) {
      return
    }

    const isMentioned = message.mentions.has(this.container.client.user!)
    const isDM = !message.guild

    if (!isMentioned || isDM) {
      return
    }

    const userContent = message.content.replace(new RegExp(`<@!?${this.container.client.user!.id}>`), '').trim()

    if (!userContent) {
      return
    }

    if (!config.SYSTEM_PROMPT) {
      log.warn('SYSTEM_PROMPT is not set')
    }

    try {
      if ('sendTyping' in message.channel && typeof message.channel.sendTyping === 'function') {
        await message.channel.sendTyping()
      }

      if (!config.OPENROUTER_MODEL) {
        log.error('OPENROUTER_MODEL is not set')
        return
      }

      const result = streamText({
        model: openrouter(config.OPENROUTER_MODEL),
        prompt: config.SYSTEM_PROMPT.replace('{user_content}', userContent),
      })

      await message.react('🤔')

      let fullResponse = ''
      let responseMessage: Message | null = null
      let lastUpdate = Date.now()
      const updateInterval = 1000

      for await (const delta of result.textStream) {
        fullResponse += delta

        let processedResponse = fullResponse
        if (config.PROMPT_CUTOFF_PATTERN) {
          const lastIndex = processedResponse.lastIndexOf(config.PROMPT_CUTOFF_PATTERN)
          if (lastIndex !== -1) {
            processedResponse = processedResponse.slice(lastIndex + config.PROMPT_CUTOFF_PATTERN.length).trim()
          } else {
            continue
          }
        }

        if (!responseMessage && processedResponse.length > 0) {
          responseMessage = await message.reply(processedResponse)
          lastUpdate = Date.now()
          continue
        }

        if (responseMessage) {
          const now = Date.now()
          if (now - lastUpdate >= updateInterval) {
            const displayText =
              processedResponse.length > 1900 ? `${processedResponse.slice(0, 1900)}...` : processedResponse
            await responseMessage.edit(displayText)
            lastUpdate = now
          }
        }
      }

      if (responseMessage) {
        let processedResponse = fullResponse
        if (config.PROMPT_CUTOFF_PATTERN) {
          const lastIndex = processedResponse.lastIndexOf(config.PROMPT_CUTOFF_PATTERN)
          if (lastIndex !== -1) {
            processedResponse = processedResponse.slice(lastIndex + config.PROMPT_CUTOFF_PATTERN.length).trim()
          }
        }

        if (processedResponse.length > 2000) {
          // Split into multiple messages if too long
          const chunks: string[] = []
          for (let i = 0; i < processedResponse.length; i += 2000) {
            chunks.push(processedResponse.slice(i, i + 2000))
          }
          await responseMessage.edit(chunks[0])
          if ('send' in message.channel && typeof message.channel.send === 'function') {
            for (let i = 1; i < chunks.length; i++) {
              await message.channel.send(chunks[i])
            }
          }
        } else {
          await responseMessage.edit(processedResponse)
        }
      }
    } catch (error) {
      log.error({ error }, 'Error in chatbot')
      await message.reply('Sorry, I encountered an error while processing your message.').catch(() => {})
    }
  }
}
