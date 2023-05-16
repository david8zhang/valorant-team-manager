import { PlayerAgentConfig } from '~/scenes/TeamMgmt'
import { PlayerRank } from './PlayerConstants'

export class Utilities {
  public static shuffle(array: any[]) {
    let currentIndex = array.length,
      randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
  }

  public static getRankNameForEnum(rank: PlayerRank) {
    const ranks = [
      'BRONZE',
      'SILVER',
      'GOLD',
      'PLATINUM',
      'DIAMOND',
      'MASTER',
      'GRANDMASTER',
      'CHALLENGER',
    ]
    return ranks[rank]
  }

  public static getOverallRank(player: PlayerAgentConfig) {
    return Math.round(
      Object.values(player.attributes).reduce((acc, curr) => {
        return acc + curr
      }, 0) / Object.keys(player.attributes).length
    )
  }
}
