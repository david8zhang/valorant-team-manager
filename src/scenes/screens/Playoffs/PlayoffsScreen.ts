import { RoundConstants } from '~/utils/RoundConstants'
import TeamMgmt, { TeamConfig } from '../../TeamMgmt'
import { Screen } from '../Screen'
import { Save, SaveKeys } from '~/utils/Save'
import { Utilities } from '~/utils/Utilities'
import { Matchup } from './Matchup'
import { FinalsMatchup } from './FinalsMatchup'
import { Button } from '~/core/ui/Button'
import { SimulationUtils } from '~/utils/SimulationUtils'

export interface PlayoffMatchupTeam {
  fullTeamName: string
  shortTeamName: string
  score: number
}

export interface PlayoffMatchup {
  team1: PlayoffMatchupTeam
  team2: PlayoffMatchupTeam
  hasStarted: boolean
  nextMatchIndex: number
  nextMatchTeamKey: string
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

  constructor(scene: TeamMgmt) {
    this.scene = scene
    this.setupContinueButton()
    this.setVisible(false)
  }

  setupContinueButton() {
    this.continueButton = new Button({
      scene: this.scene,
      x: RoundConstants.WINDOW_WIDTH - 60,
      y: 30,
      width: 100,
      height: 40,
      text: 'Continue',
      onClick: () => {
        this.updatePlayoffBracket()
      },
      fontSize: '14px',
      textColor: 'black',
      strokeWidth: 1,
      strokeColor: 0x000,
    })
  }

  simulatePlayoffGame() {
    const matchups = this.playoffBracket[this.currRound] as PlayoffMatchup[]
    console.log(matchups, this.currRound)
    const allTeamConfigs = Save.getData(SaveKeys.ALL_TEAM_CONFIGS) as { [key: string]: TeamConfig }
    const matchupsForSimulation = matchups
      .filter((matchup) => {
        return matchup.team1.score < 3 && matchup.team2.score < 3 // Only simulate rounds that haven't ended yet
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
    // Save.setData(SaveKeys.ALL_TEAM_CONFIGS, allTeamConfigs)

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
          const nextMatch = nextRoundMatchups[matchup.nextMatchIndex] as PlayoffMatchup
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
      }
    }
  }

  updatePlayoffBracket() {
    this.simulatePlayoffGame()
    this.processRoundEnd()
    this.setupFirstRoundMatchups()
    this.setupSecondRoundMatchups()
    this.setupFinalsMatchup()
  }

  setupPlayoffBracket() {
    const savedPlayoffBracket = Save.getData(SaveKeys.PLAYOFF_BRACKET) as PlayoffBracket
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
            nextMatchIndex: -1,
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
          nextMatchIndex: Math.floor(i / 2),
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
          nextMatchIndex: Math.floor(i / 2),
          nextMatchTeamKey: `team${Math.round(i % 2) + 1}`,
          hasStarted: false,
        })
      }
      this.playoffBracket = newPlayoffBracket
    } else {
      this.playoffBracket = savedPlayoffBracket
    }
  }

  setupFirstRoundMatchups() {
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

  setupSecondRoundMatchups() {
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

  setupFinalsMatchup() {
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
    this.continueButton.setVisible(isVisible)
  }

  onRender(data?: any): void {
    this.setupPlayoffBracket()
    this.setupFirstRoundMatchups()
    this.setupSecondRoundMatchups()
    this.setupFinalsMatchup()
  }
}
