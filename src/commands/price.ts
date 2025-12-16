import type { Args } from '@sapphire/framework'
import { Command } from '@sapphire/framework'
import type { Message } from 'discord.js'
import { ResultAsync } from 'neverthrow'

import { CryptoService } from '~/services/crypto/crypto'
import { Cache } from '~/utils/cache'
import { log } from '~/utils/logger'

const cache = new Cache<string, string>({
  max: 20,
  ttl: 1000 * 60 * 2, // 2 minutes
})

export class PriceCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'price',
      description: 'Check the price of a cryptocurrency',
    })
  }

  public async messageRun(message: Message, args: Args) {
    const coinInput = await ResultAsync.fromPromise(args.rest('string'), () => new Error('Provide a valid coin name.'))

    if (coinInput.isErr()) {
      return message.reply(coinInput.error.message)
    }

    const input = coinInput.value.toLowerCase().replace(/\s+/g, '-')
    const cacheKey = `price:${input}`

    if (cache.has(cacheKey)) {
      const cachedResponse = cache.get(cacheKey)
      if (cachedResponse) {
        return message.reply(cachedResponse)
      }
    }

    try {
      const cryptoService = new CryptoService()
      const token = await cryptoService.getPrice(input)

      if (!token.price) {
        const errorMsg = await message.reply(`Couldn't find price for \`${input}\`.`)
        setTimeout(() => {
          errorMsg.delete().catch(() => {
            // Ignore deletion errors
          })
        }, 7000)
        return
      }

      const commandResponse = `Price of \`${input}\` is **$${token.price}** (${token.percentChange24h || 0}%).`
      cache.set(cacheKey, commandResponse)

      return message.reply(commandResponse)
    } catch (error) {
      log.error(error)
      return message.reply('Something went wrong.')
    }
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const coinName = interaction.options.getString('name', true)
    const input = coinName.toLowerCase().replace(/\s+/g, '-')
    const cacheKey = `price:${input}`

    // Check cache first
    if (cache.has(cacheKey)) {
      const cachedResponse = cache.get(cacheKey)
      if (cachedResponse) {
        return interaction.reply({
          content: cachedResponse,
        })
      }
    }

    await interaction.reply({
      content: 'Fetching price...',
    })

    try {
      const cryptoService = new CryptoService()
      const token = await cryptoService.getPrice(input)

      if (!token.price) {
        return interaction.editReply(`Couldn't find price for \`${input}\`.`)
      }

      const commandResponse = `Price of \`${input}\` is **$${token.price}** (${token.percentChange24h || 0}%).`
      cache.set(cacheKey, commandResponse)

      return interaction.editReply(commandResponse)
    } catch (error) {
      log.error(error)
      return interaction.editReply('Something went wrong.')
    }
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('price')
        .setDescription('Check the price of a cryptocurrency')
        .addStringOption((option) => option.setName('name').setDescription('Name of the coin').setRequired(true)),
    )
  }
}
