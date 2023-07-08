import { RoundConstants } from '~/utils/RoundConstants'
import TeamMgmt, { TeamConfig } from '../TeamMgmt'
import { Screen } from '../Screen'
import { Save, SaveKeys } from '~/utils/Save'
import { Utilities } from '~/utils/Utilities'
import { Matchup } from './Matchup'
import { FinalsMatchup } from './FinalsMatchup'
import { Button } from '~/core/ui/Button'
import { PlayerPlayoffMatchResult, SimulationUtils } from '~/utils/SimulationUtils'
import { PlayoffMatchPreview } from '~/core/ui/PlayoffMatchPreview'
import { ScreenKeys } from '../ScreenKeys'
import { Side } from '~/core/Agent'
import { ViewLineupsScreenData } from '../ViewLineupsScreen'
import { ChampionAnnouncementModal } from '~/core/ui/ChampionAnnouncementModal'
import { PlayerEliminationModal } from '~/core/ui/PlayerEliminationModal'

export interface PlayoffMatchupTeam {
  fullTeamName: string
  shortTeamName: string
  score: number
}

export interface PlayoffMatchup {
  team1: PlayoffMatchupTeam
  team2: PlayoffMatchupTeam
  hasStarted: boolean
  nextRoundIndex: number // Used for determining which matchup to place the winner in in the next round
  nextMatchTeamKey: string
}

export interface PlayoffsScreenData {
  playoffResult?: PlayerPlayoffMatchResult
}

export enum PlayoffRound {
  ROUND_1 = 'round1',
  ROUND_2 = 'round2',
  FINAL = 'final',
  POST_FINAL = 'postFinal',
}

export interface PlayoffBracket {
  [PlayoffRound.ROUND_1]: PlayoffMatchup[]
  [PlayoffRound.ROUND_2]: PlayoffMatchup[]
  [PlayoffRound.FINAL]: PlayoffMatchup[]
}

export class PlayoffsScreen implements Screen {
  private scene: TeamMgmt
  private playoffBracket!: PlayoffBracket
  private round1Matchups: Matchup[] = []
  private round2Matchups: Matchup[] = []
  private finalsMatchup: FinalsMatchup | null = null
  private continueButton!: Button
  private currRound: PlayoffRound = PlayoffRound.ROUND_1
  private playoffMatchPreview: PlayoffMatchPreview | null = null
  private champAnnounceModal!: ChampionAnnouncementModal
  private playerElimModal!: PlayerEliminationModal

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setVisible(false)
  }

  handlePlayerPlayoffResult(playoffResult: PlayerPlayoffMatchResult) {
    const currRoundMatchups = this.playoffBracket[this.currRound] as PlayoffMatchup[]
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME) as string
    const playerRound = currRoundMatchups.find((matchup) => {
      return (
        matchup.team1.fullTeamName === playerTeamName ||
        matchup.team2.fullTeamName === playerTeamName
      )
    })
    if (playerRound) {
      const playerTeam =
        playerRound.team1.fullTeamName === playerTeamName ? playerRound.team1 : playerRound.team2
      const cpuTeam =
        playerRound.team1.fullTeamName === playerTeamName ? playerRound.team2 : playerRound.team1
      if (playoffResult.winningSide === Side.PLAYER) {
        playerTeam.score++
      } else {
        cpuTeam.score++
      }
      if (cpuTeam.score === 3) {
        this.playerElimModal.setVisible(true)
      }
      this.processRoundEnd()
      this.setupOrUpdateFirstRoundMatchups()
      this.setupOrUpdateSecondRoundMatchups()
      this.setupOrUpdateFinalsMatchup()
    }
  }

  setupPlayerPlayoffMatchPreview() {
    const playerMatchup = this.getActivePlayerMatchup()
    if (playerMatchup) {
      const allTeamConfigs = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as {
        [key: string]: TeamConfig
      }
      const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME) as string
      const opponentTeamName =
        playerMatchup.team1.fullTeamName === playerTeamName
          ? playerMatchup.team2.fullTeamName
          : playerMatchup.team1.fullTeamName
      const opponentTeamConfig = allTeamConfigs[opponentTeamName] as TeamConfig
      this.playoffMatchPreview = new PlayoffMatchPreview(this.scene, {
        x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
        y: RoundConstants.WINDOW_HEIGHT / 2,
        width: 550,
        height: RoundConstants.WINDOW_HEIGHT - 50,
        matchup: playerMatchup,
        onViewLineups: () => {
          const viewLineupsScreenData: ViewLineupsScreenData = {
            opponentTeam: opponentTeamConfig,
            isPlayoffGame: true,
          }
          this.scene.renderActiveScreen(ScreenKeys.VIEW_LINEUPS, viewLineupsScreenData)
        },
        onStartMatch: () => {
          this.scene.startPlayoffGame(opponentTeamConfig)
        },
      })
      this.playoffMatchPreview.setVisible(false)
    }
  }

  setupContinueButton() {
    if (this.continueButton) {
      this.continueButton.destroy()
    }
    this.continueButton = new Button({
      scene: this.scene,
      x: RoundConstants.WINDOW_WIDTH - 60,
      y: 30,
      width: 100,
      height: 40,
      text: 'Continue',
      onClick: () => {
        this.progressPlayoffRound()
      },
      fontSize: '14px',
      textColor: 'black',
      strokeWidth: 1,
      strokeColor: 0x000,
    })
  }

  simulatePlayoffGame() {
    const matchups = this.playoffBracket[this.currRound] as PlayoffMatchup[]
    const allTeamConfigs = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME)
    const isPlayerTeamInMatchup = (matchup: PlayoffMatchup) => {
      return (
        matchup.team1.fullTeamName === playerTeamName ||
        matchup.team2.fullTeamName === playerTeamName
      )
    }
    const matchupsForSimulation = matchups
      .filter((matchup) => {
        return matchup.team1.score < 3 && matchup.team2.score < 3 && !isPlayerTeamInMatchup(matchup)
      })
      .map((matchup: PlayoffMatchup) => {
        const team1Config = allTeamConfigs[matchup.team1.fullTeamName]
        const team2Config = allTeamConfigs[matchup.team2.fullTeamName]
        return [team1Config, team2Config]
      })

    const matchupResults = SimulationUtils.simulateMatches(matchupsForSimulation)

    // Apply EXP after match
    const teamConfigsWithAppliedExp = SimulationUtils.applyMatchResults(matchupResults)
    teamConfigsWithAppliedExp.forEach((teamConfig: TeamConfig) => {
      allTeamConfigs[teamConfig.name] = teamConfig
    })

    // Update results
    const winningTeamNames = new Set(
      matchupResults.map((matchupResult) => {
        return matchupResult.winningTeam.name
      })
    )
    matchups.forEach((matchup) => {
      if (winningTeamNames.has(matchup.team1.fullTeamName)) {
        matchup.team1.score++
      } else if (winningTeamNames.has(matchup.team2.fullTeamName)) {
        matchup.team2.score++
      }
    })
    Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeamConfigs)
    Save.setData(SaveKeys.PLAYOFF_BRACKET, this.playoffBracket)
  }

  getNextRound(currRound: PlayoffRound): PlayoffRound {
    switch (currRound) {
      case PlayoffRound.ROUND_1: {
        return PlayoffRound.ROUND_2
      }
      case PlayoffRound.ROUND_2: {
        return PlayoffRound.FINAL
      }
      default:
        return PlayoffRound.ROUND_1
    }
  }

  processRoundEnd() {
    // Populate next round
    if (this.currRound !== PlayoffRound.FINAL) {
      const nextRound = this.getNextRound(this.currRound)
      const nextRoundMatchups = this.playoffBracket[nextRound] as PlayoffMatchup[]
      const matchups = this.playoffBracket[this.currRound] as PlayoffMatchup[]
      matchups.forEach((matchup) => {
        if (matchup.team1.score === 3 || matchup.team2.score === 3) {
          const winningTeam = matchup.team1.score === 3 ? matchup.team1 : matchup.team2
          const nextMatch = nextRoundMatchups[matchup.nextRoundIndex] as PlayoffMatchup
          nextMatch[matchup.nextMatchTeamKey] = {
            ...winningTeam,
            score: 0,
          }
          nextMatch.hasStarted = true
        }
      })
      const completedMatchups = matchups.filter((matchup) => {
        return matchup.team1.score === 3 || matchup.team2.score === 3
      })
      if (completedMatchups.length === matchups.length) {
        this.currRound = nextRound
        Save.setData(SaveKeys.CURR_PLAYOFF_ROUND, this.currRound)
      }
    }
  }

  progressPlayoffRound() {
    // Handle player playoff preview
    this.showPlayerPlayoffMatchPreview()
    this.simulatePlayoffGame()
    this.processRoundEnd()
    this.setupOrUpdateFirstRoundMatchups()
    this.setupOrUpdateSecondRoundMatchups()
    this.setupOrUpdateFinalsMatchup()
    this.announceChampionIfApplicable()
  }

  getActivePlayerMatchup() {
    const matchups = this.playoffBracket[this.currRound] as PlayoffMatchup[]
    const playerTeamName = Save.getData(SaveKeys.PLAYER_TEAM_NAME) as string
    const playerMatchup = matchups.find((matchup) => {
      return (
        matchup.team1.fullTeamName === playerTeamName ||
        matchup.team2.fullTeamName === playerTeamName
      )
    })

    if (playerMatchup) {
      const team1Score = playerMatchup.team1.score
      const team2Score = playerMatchup.team2.score
      // If the current round is over for the player team, return null
      if (team1Score === 3 || team2Score === 3) {
        return null
      }
    }
    return playerMatchup
  }

  showPlayerPlayoffMatchPreview() {
    if (this.playoffMatchPreview) {
      const playerMatchup = this.getActivePlayerMatchup()
      if (playerMatchup) {
        this.playoffMatchPreview?.updatePlayerMatchup(playerMatchup.team1, playerMatchup.team2)
        this.playoffMatchPreview.setVisible(true)
      }
    }
  }

  setupPlayoffBracket() {
    const savedPlayoffBracket = Save.getData(SaveKeys.PLAYOFF_BRACKET) as PlayoffBracket
    const savedCurrPlayoffRound =
      (Save.getData(SaveKeys.CURR_PLAYOFF_ROUND) as PlayoffRound) || PlayoffRound.ROUND_1
    if (!savedPlayoffBracket) {
      const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
      const top8Teams = Object.values(allTeams)
        .sort((a, b) => {
          return Utilities.getWinLossRatio(b) - Utilities.getWinLossRatio(a)
        })
        .slice(0, 8)
      const newPlayoffBracket: PlayoffBracket = {
        round1: [],
        round2: [],
        final: [
          {
            team1: {
              fullTeamName: 'TBD',
              shortTeamName: 'TBD',
              score: -1,
            },
            team2: {
              fullTeamName: 'TBD',
              shortTeamName: 'TBD',
              score: -1,
            },
            nextRoundIndex: -1,
            nextMatchTeamKey: 'N/A',
            hasStarted: false,
          },
        ],
      }
      for (let i = 0; i < 4; i++) {
        const higherSeed = top8Teams[i]
        const lowerSeed = top8Teams[7 - i]
        newPlayoffBracket.round1.push({
          team1: {
            fullTeamName: higherSeed.name,
            shortTeamName: higherSeed.shortName,
            score: 0,
          },
          team2: {
            fullTeamName: lowerSeed.name,
            shortTeamName: lowerSeed.shortName,
            score: 0,
          },
          nextRoundIndex: Math.floor(i / 2),
          nextMatchTeamKey: `team${Math.round(i % 2) + 1}`,
          hasStarted: true,
        })
      }
      for (let i = 0; i < 2; i++) {
        newPlayoffBracket.round2.push({
          team1: {
            fullTeamName: 'TBD',
            shortTeamName: 'TBD',
            score: -1,
          },
          team2: {
            fullTeamName: 'TBD',
            shortTeamName: 'TBD',
            score: -1,
          },
          nextRoundIndex: Math.floor(i / 2),
          nextMatchTeamKey: `team${Math.round(i % 2) + 1}`,
          hasStarted: false,
        })
      }
      this.playoffBracket = newPlayoffBracket
      Save.setData(SaveKeys.PLAYOFF_BRACKET, this.playoffBracket)
      Save.setData(SaveKeys.CURR_PLAYOFF_ROUND, this.currRound)
    } else {
      this.playoffBracket = savedPlayoffBracket
    }
    this.currRound = savedCurrPlayoffRound
  }

  setupOrUpdateFirstRoundMatchups() {
    if (this.round1Matchups.length > 0) {
      this.round1Matchups.forEach((matchup: Matchup) => {
        matchup.destroy()
      })
      this.round1Matchups = []
    }
    const paddingBetweenRect = 15
    const matchupRectWidth =
      (RoundConstants.WINDOW_WIDTH -
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH -
        paddingBetweenRect * 5) /
      4
    const matchupRectHeight = 100
    let xPos = RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + 15
    const yPos = RoundConstants.WINDOW_HEIGHT - matchupRectHeight / 2 - 15
    this.playoffBracket.round1.forEach((matchup: PlayoffMatchup) => {
      const newMatchup = new Matchup(this.scene, {
        hasStarted: matchup.hasStarted,
        width: matchupRectWidth,
        height: matchupRectHeight,
        position: {
          x: xPos,
          y: yPos,
        },
        team1: matchup.team1,
        team2: matchup.team2,
      })
      this.round1Matchups.push(newMatchup)
      xPos += matchupRectWidth + 15
    })
  }

  setupOrUpdateSecondRoundMatchups() {
    if (this.round2Matchups.length > 0) {
      this.round2Matchups.forEach((matchup: Matchup) => {
        matchup.destroy()
      })
      this.round2Matchups = []
    }
    const paddingBetweenRect = 15
    const matchupRectWidth =
      (RoundConstants.WINDOW_WIDTH -
        RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH -
        paddingBetweenRect * 5) /
      3
    const matchupRectHeight = 125
    let xPos =
      (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2 -
      matchupRectWidth -
      10
    const yPos = RoundConstants.WINDOW_HEIGHT - matchupRectHeight * 2
    this.playoffBracket.round2.forEach((matchup: PlayoffMatchup) => {
      const newMatchup = new Matchup(this.scene, {
        hasStarted: matchup.hasStarted,
        width: matchupRectWidth,
        height: matchupRectHeight,
        position: {
          x: xPos,
          y: yPos,
        },
        team1: matchup.team1,
        team2: matchup.team2,
        fontSize: '25px',
      })
      this.round2Matchups.push(newMatchup)
      xPos += matchupRectWidth + 20
    })
  }

  setupOrUpdateFinalsMatchup() {
    if (this.finalsMatchup) {
      this.finalsMatchup.destroy()
      this.finalsMatchup = null
    }
    const team1 = this.playoffBracket.final[0].team1
    const team2 = this.playoffBracket.final[0].team2
    this.finalsMatchup = new FinalsMatchup(this.scene, {
      hasStarted: this.playoffBracket.final[0].hasStarted,
      team1,
      team2,
      position: {
        x: (RoundConstants.TEAM_MGMT_SIDEBAR_WIDTH + RoundConstants.WINDOW_WIDTH) / 2,
        y: 175,
      },
      width: 200,
      height: 75,
    })
  }

  setVisible(isVisible: boolean): void {
    this.round1Matchups.forEach((matchup: Matchup) => {
      matchup.setVisible(isVisible)
    })
    this.round2Matchups.forEach((matchup: Matchup) => {
      matchup.setVisible(isVisible)
    })
    if (this.finalsMatchup) {
      this.finalsMatchup.setVisible(isVisible)
    }
    if (this.continueButton) {
      this.continueButton.setVisible(isVisible)
    }
    if (!isVisible && this.playoffMatchPreview) {
      this.playoffMatchPreview.setVisible(isVisible)
    }
    if (this.champAnnounceModal) {
      this.champAnnounceModal.setVisible(isVisible)
    }
    if (this.playerElimModal) {
      this.playerElimModal.setVisible(isVisible)
    }
  }

  getChampion() {
    if (this.currRound === PlayoffRound.FINAL) {
      const finalsMatchup = (this.playoffBracket[this.currRound] as PlayoffMatchup[])[0]
      const allTeams = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
      if (finalsMatchup.team1.score === 3) {
        return allTeams[finalsMatchup.team1.fullTeamName]
      } else if (finalsMatchup.team2.score === 3) {
        return allTeams[finalsMatchup.team2.fullTeamName]
      }
    }
    return null
  }

  setupChampionAnnouncementModal() {
    if (this.champAnnounceModal) {
      this.champAnnounceModal.destroy()
    }
    this.champAnnounceModal = new ChampionAnnouncementModal(this.scene, {
      champion: null,
      onContinue: () => {
        this.endPlayoffsAndSeason()
      },
      depth: RoundConstants.SORT_LAYERS.UI,
    })
    this.champAnnounceModal.setVisible(false)
  }

  setupPlayerElimModal() {
    if (this.playerElimModal) {
      this.playerElimModal.destroy()
    }
    this.playerElimModal = new PlayerEliminationModal(this.scene, {
      onContinue: () => {
        this.playerElimModal.setVisible(false)
      },
      depth: RoundConstants.SORT_LAYERS.UI + 10,
    })
    this.playerElimModal.setVisible(false)
  }

  endPlayoffsAndSeason() {
    Utilities.convertRookies()
    Utilities.decrementContractDurations()
    // Reset playoff bracket
    Save.setData(SaveKeys.CURR_PLAYOFF_ROUND, null)
    Save.setData(SaveKeys.PLAYOFF_BRACKET, null)
    this.scene.renderActiveScreen(ScreenKeys.DRAFT, {
      isNewDraft: true,
    })
  }

  announceChampionIfApplicable() {
    const champion = this.getChampion()
    if (champion) {
      this.champAnnounceModal.updateChampion(champion)
      this.champAnnounceModal.setVisible(true)
    }
  }

  onRender(data?: { playoffResult: PlayerPlayoffMatchResult }): void {
    this.setupPlayoffBracket()
    this.setupContinueButton()
    this.setupPlayerPlayoffMatchPreview()
    this.setupChampionAnnouncementModal()
    this.setupPlayerElimModal()
    if (data && data.playoffResult) {
      this.handlePlayerPlayoffResult(data.playoffResult)
    } else {
      this.setupOrUpdateFirstRoundMatchups()
      this.setupOrUpdateSecondRoundMatchups()
      this.setupOrUpdateFinalsMatchup()
    }
    this.announceChampionIfApplicable()
  }
}
