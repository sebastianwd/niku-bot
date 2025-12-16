import type { Args } from '@sapphire/framework'
import { Command } from '@sapphire/framework'
import type { Message } from 'discord.js'
import { ResultAsync } from 'neverthrow'

import { searchVideos, type Video } from '~/services/youtube/youtube'

export class YTCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'yt',
      aliases: ['youtube'],
      description: 'Search for a video on YouTube',
    })
  }

  public async messageRun(message: Message, args: Args) {
    const query = await ResultAsync.fromPromise(args.rest('string'), () => new Error('Provide a valid search query.'))

    if (query.isErr()) {
      return message.reply(query.error.message)
    }

    const search = await ResultAsync.fromPromise(
      searchVideos(query.value),
      () => new Error('Failed to search for videos.'),
    )

    if (search.isErr()) {
      return message.reply(search.error.message)
    }

    const result = search.value.videos.length > 0 ? search.value.videos[0] : null
    if (!result) {
      return message.reply(`No results for '${query.value}'.`)
    }

    const url = `https://www.youtube.com/watch?v=${(result as Video).video_id}`

    return message.reply(url)
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const query = interaction.options.getString('query', true)

    await interaction.reply({
      content: 'Searching...',
    })

    const search = await ResultAsync.fromPromise(searchVideos(query), () => new Error('Failed to search for videos.'))

    if (search.isErr()) {
      return interaction.editReply(search.error.message)
    }

    const result = search.value.videos.length > 0 ? search.value.videos[0] : null
    if (!result) {
      return interaction.editReply(`No results for '${query}'.`)
    }

    const url = `https://www.youtube.com/watch?v=${(result as Video).video_id}`

    return interaction.editReply(url)
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('yt')
        .setDescription('Search for a video on YouTube')
        .addStringOption((option) =>
          option.setName('query').setDescription('The query to search for').setRequired(true),
        ),
    )
  }
}
