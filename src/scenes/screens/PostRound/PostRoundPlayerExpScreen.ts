import { RoundConstants } from '~/utils/RoundConstants'
import { PlayerStatConfig, PostRound } from '../../PostRound'
import { Screen } from '../Screen'
import TeamMgmt, { PlayerAgentConfig, TeamConfig } from '~/scenes/TeamMgmt'
import { PostRoundPlayerExp } from '~/core/ui/PostRoundPlayerExp'
import {
  PLAYER_POTENTIAL_TO_EXP_MAPPING,
  PlayerAttributes,
  PlayerRank,
} from '~/utils/PlayerConstants'
import { Side } from '~/core/Agent'
import { Button } from '~/core/ui/Button'
import { Save, SaveKeys } from '~/utils/Save'
import { Utilities } from '~/utils/Utilities'
import { RANK_DIFF_UPSET_PROBABILITIES } from '~/utils/TeamConstants'

export interface PlayerStatGrowthConfig {
  curr: number
  max: number
  gain: number
  oldRank: PlayerRank
  newRank: PlayerRank
}

export class PostRoundPlayerExpScreen implements Screen {
  private scene: PostRound
  private titleText: Phaser.GameObjects.Text
  private continueButton!: Button
  private playerExpCards: PostRoundPlayerExp[] = []
  private playerExpGrowthMapping: {
    [key: string]: {
      [key in PlayerAttributes]?: PlayerStatGrowthConfig
    }
  } = {}

  // Static constants
  public static ROUND_WIN_EXP_MODIFIER = 2
  public static MVP_EXP_MODIFIER = 1.5

  constructor(scene: PostRound) {
    this.scene = scene
    this.titleText = this.scene.add.text(RoundConstants.WINDOW_WIDTH / 2, 30, 'Post Round', {
      fontSize: '30px',
      color: 'black',
    })
    this.titleText.setPosition(
      RoundConstants.WINDOW_WIDTH / 2 - this.titleText.displayWidth / 2,
      this.titleText.y + 10
    )
    this.playerExpGrowthMapping = this.createPlayerExpGrowthMapping(
      this.scene.playerTeamConfig,
      this.scene.playerStats[Side.PLAYER],
      this.scene.winningSide === Side.PLAYER
    )
    this.setupPlayerExpCards()
    this.setupContinueButton()
    this.setVisible(false)
  }

  setVisible(isVisible: boolean) {
    this.titleText.setVisible(isVisible)
    this.playerExpCards.forEach((card) => {
      card.setVisible(isVisible)
    })
    this.continueButton.setVisible(isVisible)
  }

  setupContinueButton() {
    this.continueButton = new Button({
      scene: this.scene,
      x: RoundConstants.WINDOW_WIDTH / 2,
      y: RoundConstants.WINDOW_HEIGHT - 50,
      backgroundColor: 0x444444,
      width: 150,
      height: 50,
      text: 'Continue',
      textColor: 'white',
      fontSize: '20px',
      onClick: () => {
        this.setVisible(false)
        this.goToTeamMgmtScreen()
      },
    })
  }

  applyExpGrowth(
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

  goToTeamMgmtScreen() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    // Add experience for player team
    const playerTeam = allTeams[Save.getData(SaveKeys.PLAYER_TEAM_NAME)] as TeamConfig
    this.applyExpGrowth(playerTeam, this.playerExpGrowthMapping)

    // Add experience for opponent CPU team
    const cpuTeam = allTeams[this.scene.cpuTeamConfig.name] as TeamConfig
    const cpuExpGrowthMapping = this.createPlayerExpGrowthMapping(
      this.scene.cpuTeamConfig,
      this.scene.playerStats[Side.CPU],
      this.scene.winningSide === Side.CPU
    )
    this.applyExpGrowth(cpuTeam, cpuExpGrowthMapping)

    if (this.scene.winningSide === Side.PLAYER) {
      playerTeam.wins++
      cpuTeam.losses++
    } else {
      playerTeam.losses++
      cpuTeam.wins++
    }

    const otherTeams = this.simulateOtherTeamMatches()
    const newAllTeams = otherTeams
      .concat(cpuTeam)
      .concat(playerTeam)
      .reduce((acc, curr) => {
        acc[curr.name] = curr
        return acc
      }, {})

    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, newAllTeams)

    const currMatchIndex = Save.getData(SaveKeys.CURR_MATCH_INDEX)
    const seasonSchedule = Save.getData(SaveKeys.SEASON_SCHEDULE)
    Save.setData(SaveKeys.CURR_MATCH_INDEX, Math.min(currMatchIndex + 1, seasonSchedule.length))
    this.scene.scene.start('team-mgmt')
  }

  simulateOtherTeamMatches() {
    const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const teamsToSimulate = Object.values(allTeams).filter((team: TeamConfig) => {
      return (
        team.name !== this.scene.cpuTeamConfig.name &&
        team.name !== this.scene.playerTeamConfig.name
      )
    })
    const shuffledTeams = Utilities.shuffle([...teamsToSimulate])
    const matchups: TeamConfig[][] = []
    for (let i = 0; i <= shuffledTeams.length - 2; i += 2) {
      const matchup = [shuffledTeams[i], shuffledTeams[i + 1]]
      matchups.push(matchup)
    }
    const getAgentOverallRank = (agent: PlayerAgentConfig) => {
      return Math.round(
        Object.values(agent.attributes).reduce((acc, curr) => {
          return acc + curr
        }, 0) / Object.keys(agent.attributes).length
      )
    }

    const getOverallRank = (teamConfig: TeamConfig) => {
      return Math.round(
        teamConfig.roster.reduce((acc, curr) => {
          return acc + getAgentOverallRank(curr)
        }, 0) / teamConfig.roster.length
      )
    }

    const getMvp = (teamConfig: TeamConfig) => {
      const sortedByRank = teamConfig.roster.sort((a, b) => {
        return getAgentOverallRank(b) - getAgentOverallRank(a)
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

    const matchResults: {
      winningTeam: TeamConfig
      losingTeam: TeamConfig
      teamMvpPlayerName: string
      matchMvpPlayerName: string
    }[] = []
    matchups.forEach((teams: TeamConfig[]) => {
      const team1OvrRank = getOverallRank(teams[0])
      const team2OvrRank = getOverallRank(teams[1])
      const rankDiff = Math.abs(team2OvrRank - team1OvrRank)
      const winProbabilities = RANK_DIFF_UPSET_PROBABILITIES[rankDiff]
      const didUpset = Phaser.Math.Between(1, 100) <= winProbabilities.probability
      const lowerRankTeam = team1OvrRank > team2OvrRank ? teams[1] : teams[0]
      const higherRankTeam = team1OvrRank > team2OvrRank ? teams[0] : teams[1]
      matchResults.push({
        winningTeam: didUpset ? lowerRankTeam : higherRankTeam,
        losingTeam: didUpset ? higherRankTeam : lowerRankTeam,
        matchMvpPlayerName: didUpset ? getMvp(lowerRankTeam) : getMvp(higherRankTeam),
        teamMvpPlayerName: didUpset ? getMvp(higherRankTeam) : getMvp(lowerRankTeam),
      })
    })

    // Apply all matchup results
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
      this.applyExpGrowth(matchup.winningTeam, winningTeamGrowthMapping)
      this.applyExpGrowth(matchup.losingTeam, losingTeamGrowthMapping)
      matchup.winningTeam.wins++
      matchup.losingTeam.losses++
    })
    const teamConfigWithAppliedExp: TeamConfig[] = []
    matchResults.forEach((result) => {
      teamConfigWithAppliedExp.push(result.winningTeam)
      teamConfigWithAppliedExp.push(result.losingTeam)
    })
    return teamConfigWithAppliedExp
  }

  createPlayerExpGrowthMapping(
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

  onRender() {
    this.playerExpCards.forEach((card) => {
      card.onRender()
    })
  }

  setupPlayerExpCards() {
    const padding = 15
    const playerAgentStats = this.scene.playerStats[Side.PLAYER]
    const playerConfigs = Object.keys(playerAgentStats).map((key) => {
      return {
        ...playerAgentStats[key],
        name: key,
      }
    })
    // Calculate card widths and layout
    const cardWidth =
      TeamMgmt.BODY_WIDTH / playerConfigs.length -
      padding * ((playerConfigs.length + 1) / playerConfigs.length)
    let xPos =
      RoundConstants.WINDOW_WIDTH / 2 -
      (cardWidth * playerConfigs.length + (padding * playerConfigs.length - 1)) / 2 +
      7
    playerConfigs.forEach((config) => {
      const growthConfig = this.playerExpGrowthMapping[config.name]
      this.playerExpCards.push(
        new PostRoundPlayerExp(this.scene, {
          name: config.name,
          position: {
            x: xPos,
            y: padding + 80,
          },
          height: RoundConstants.WINDOW_HEIGHT - 200,
          width: cardWidth,
          exp: growthConfig,
        })
      )
      xPos += cardWidth + padding
    })
  }
}
