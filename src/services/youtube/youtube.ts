import type Video from 'node_modules/youtubei.js/dist/src/parser/classes/Video.js'
import type { SearchFilters } from 'node_modules/youtubei.js/dist/src/types/Misc'
import { Innertube } from 'youtubei.js'

const innertube = await Innertube.create({ lang: 'en', location: 'US' })

export type { Video }

export const searchVideos = async (query: string, options: SearchFilters = { type: 'video' }) => {
  return await innertube.search(query, options)
}

export const getVideoInfo = async (videoId: string) => {
  return await innertube.getInfo(videoId)
}

export default {
  searchVideos,
  getVideoInfo,
}
