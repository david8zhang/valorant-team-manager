import { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { PLAYER_POTENTIAL_TO_EXP_MAPPING, PlayerAttributes } from './PlayerConstants'
import {
  PlayerStatGrowthConfig,
  PostRoundPlayerExpScreen,
} from '~/scenes/screens/PostRound/PostRoundPlayerExpScreen'
import { RANK_DIFF_UPSET_PROBABILITIES } from './TeamConstants'
import { Utilities } from './Utilities'

export interface ExpGrowthMapping {
  [key: string]: {
    [key in PlayerAttributes]?: PlayerStatGrowthConfig
  }
}

export class SimulationUtils {
  public static getTeamOverallRank(teamConfig: TeamConfig) {
    return Math.round(
      teamConfig.roster.reduce((acc, curr) => {
        return acc + Utilities.getOverallPlayerRank(curr)
      }, 0) / teamConfig.roster.length
    )
  }

  public static getMvp(teamConfig: TeamConfig) {
    const sortedByRank = teamConfig.roster.sort((a, b) => {
      return Utilities.getOverallPlayerRank(b) - Utilities.getOverallPlayerRank(a)
    })
    let mvpName = sortedByRank[sortedByRank.length - 1].name
    for (let i = 0; i < sortedByRank.length; i++) {
      const isMvp = Phaser.Math.Between(0, 1) == 1
      if (isMvp) {
        return sortedByRank[i].name
      }
    }
    return mvpName
  }

  public static simulateMatches(matchups: TeamConfig[][]) {
    const matchResults: {
      winningTeam: TeamConfig
      losingTeam: TeamConfig
      teamMvpPlayerName: string
      matchMvpPlayerName: string
    }[] = []
    matchups.forEach((teams: TeamConfig[]) => {
      const team1OvrRank = SimulationUtils.getTeamOverallRank(teams[0])
      const team2OvrRank = SimulationUtils.getTeamOverallRank(teams[1])
      const rankDiff = Math.abs(team2OvrRank - team1OvrRank)
      const winProbabilities = RANK_DIFF_UPSET_PROBABILITIES[rankDiff]
      const didUpset = Phaser.Math.Between(1, 100) <= winProbabilities.probability
      const lowerRankTeam = team1OvrRank > team2OvrRank ? teams[1] : teams[0]
      const higherRankTeam = team1OvrRank > team2OvrRank ? teams[0] : teams[1]
      matchResults.push({
        winningTeam: didUpset ? lowerRankTeam : higherRankTeam,
        losingTeam: didUpset ? higherRankTeam : lowerRankTeam,
        matchMvpPlayerName: didUpset
          ? SimulationUtils.getMvp(lowerRankTeam)
          : SimulationUtils.getMvp(higherRankTeam),
        teamMvpPlayerName: didUpset
          ? SimulationUtils.getMvp(higherRankTeam)
          : SimulationUtils.getMvp(lowerRankTeam),
      })
    })
    return matchResults
  }

  public static applyMatchResults(
    matchResults: {
      winningTeam: TeamConfig
      losingTeam: TeamConfig
      teamMvpPlayerName: string
      matchMvpPlayerName: string
    }[],
    updateTeamRegSeasonRecord: boolean = false
  ) {
    matchResults.forEach((matchup) => {
      const winningTeamPlayerStats = {}
      matchup.winningTeam.roster.forEach((playerConfig) => {
        winningTeamPlayerStats[playerConfig.name] = {
          matchMvp: matchup.matchMvpPlayerName === playerConfig.name,
          teamMvp: matchup.teamMvpPlayerName === playerConfig.name,
        }
      })
      const winningTeamGrowthMapping = this.createPlayerExpGrowthMapping(
        matchup.winningTeam,
        winningTeamPlayerStats,
        true
      )

      const losingTeamPlayerStats = {}
      matchup.losingTeam.roster.forEach((playerConfig) => {
        losingTeamPlayerStats[playerConfig.name] = {
          matchMvp: matchup.matchMvpPlayerName === playerConfig.name,
          teamMvp: matchup.teamMvpPlayerName === playerConfig.name,
        }
      })
      const losingTeamGrowthMapping = this.createPlayerExpGrowthMapping(
        matchup.losingTeam,
        losingTeamPlayerStats,
        true
      )
      SimulationUtils.applyExpGrowth(matchup.winningTeam, winningTeamGrowthMapping)
      SimulationUtils.applyExpGrowth(matchup.losingTeam, losingTeamGrowthMapping)
      if (updateTeamRegSeasonRecord) {
        matchup.winningTeam.wins++
        matchup.losingTeam.losses++
      }
    })
    const teamConfigWithAppliedExp: TeamConfig[] = []
    matchResults.forEach((result) => {
      teamConfigWithAppliedExp.push(result.winningTeam)
      teamConfigWithAppliedExp.push(result.losingTeam)
    })
    return teamConfigWithAppliedExp
  }

  public static createPlayerExpGrowthMapping(
    teamConfig: TeamConfig,
    playerStats: { [key: string]: { matchMvp: boolean; teamMvp: boolean } },
    didWin: boolean
  ) {
    const expGrowthMapping = {}
    const playerConfigs = teamConfig.roster.filter((config: PlayerAgentConfig) => config.isStarting)
    playerConfigs.forEach((config) => {
      const expRange = PLAYER_POTENTIAL_TO_EXP_MAPPING[config.potential]
      Object.keys(config.attributes).forEach((key) => {
        const attr = key as PlayerAttributes
        let expGainAmt = Phaser.Math.Between(expRange.low, expRange.high)
        if (didWin) {
          expGainAmt *= PostRoundPlayerExpScreen.ROUND_WIN_EXP_MODIFIER
        }
        if (playerStats[config.name].matchMvp || playerStats[config.name].teamMvp) {
          expGainAmt = Math.round(expGainAmt * PostRoundPlayerExpScreen.MVP_EXP_MODIFIER)
        }

        // PlayerRank maps to a number (Bronze = 0, Silver = 1, etc.). EXP gain rate is log base 2
        const maxExpAmount = 100 * Math.pow(2, config.attributes[attr])
        if (!expGrowthMapping[config.name]) {
          expGrowthMapping[config.name] = {}
        }
        expGrowthMapping[config.name][attr] = {
          curr: config.experience[attr],
          max: maxExpAmount,
          gain: expGainAmt,
          oldRank: config.attributes[attr],
          newRank:
            config.experience[attr] + expGainAmt >= maxExpAmount
              ? config.attributes[attr] + 1
              : config.attributes[attr],
        }
      })
    })
    return expGrowthMapping
  }

  public static applyExpGrowth(
    teamConfig: TeamConfig,
    expGrowthMapping: { [key: string]: { [key in PlayerAttributes]?: PlayerStatGrowthConfig } }
  ) {
    const startingLineup = teamConfig.roster.filter(
      (config: PlayerAgentConfig) => config.isStarting
    )
    startingLineup.forEach((agent) => {
      const expGrowth = expGrowthMapping[agent.name]
      const playerAttributes = agent.attributes
      const playerExp = agent.experience
      Object.keys(expGrowth).forEach((key: string) => {
        const attr = key as PlayerAttributes
        playerAttributes[attr] = expGrowth[attr]!.newRank
        playerExp[attr] =
          (expGrowth[attr]!.curr + expGrowth[attr]!.gain) %
          (100 * Math.pow(2, expGrowth[attr]!.oldRank))
      })
      agent.attributes = playerAttributes
      agent.experience = playerExp
    })
  }
}
