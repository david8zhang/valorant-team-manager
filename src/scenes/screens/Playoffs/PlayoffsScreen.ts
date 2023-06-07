import { RoundConstants } from '~/utils/RoundConstants'
import TeamMgmt, { TeamConfig } from '../../TeamMgmt'
import { Screen } from '../Screen'
import { Save, SaveKeys } from '~/utils/Save'
import { Utilities } from '~/utils/Utilities'
import { Matchup } from './Matchup'
import { FinalsMatchup } from './FinalsMatchup'
import { Button } from '~/core/ui/Button'

export interface PlayoffMatchup {
  team1: {
    teamName: string
    score: string | number
  }
  team2: {
    teamName: string
    score: string | number
  }
  hasStarted: boolean
}

export interface PlayoffBracket {
  round1: PlayoffMatchup[]
  round2: PlayoffMatchup[]
  final: PlayoffMatchup | null
}

export class PlayoffsScreen implements Screen {
  private scene: TeamMgmt
  private playoffBracket!: PlayoffBracket
  private round1Matchups: Matchup[] = []
  private round2Matchups: Matchup[] = []
  private finalsMatchup: FinalsMatchup | null = null
  private continueButton!: Button

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

  getCurrRound() {
    const rounds = ['round1', 'round2', 'final']
    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i]
      const matchup = this.playoffBracket[round] as PlayoffMatchup
      if (!matchup.hasStarted) {
        return rounds[i - 1]
      }
    }
    return 'final'
  }

  simulatePlayoffGame() {
    const currRound = this.getCurrRound()
    const matchups = this.playoffBracket[currRound] as PlayoffMatchup[]
    matchups.forEach((matchup: PlayoffMatchup) => {})
  }

  updatePlayoffBracket() {
    this.simulatePlayoffGame()
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
        final: {
          team1: {
            teamName: 'TBD',
            score: 'N/A',
          },
          team2: {
            teamName: 'TBD',
            score: 'N/A',
          },
          hasStarted: false,
        },
      }
      for (let i = 0; i < 4; i++) {
        const higherSeed = top8Teams[i]
        const lowerSeed = top8Teams[7 - i]
        newPlayoffBracket.round1.push({
          team1: {
            teamName: higherSeed.shortName,
            score: 0,
          },
          team2: {
            teamName: lowerSeed.shortName,
            score: 0,
          },
          hasStarted: true,
        })
      }
      for (let i = 0; i < 2; i++) {
        newPlayoffBracket.round2.push({
          team1: {
            teamName: 'TBD',
            score: 'N/A',
          },
          team2: {
            teamName: 'TBD',
            score: 'N/A',
          },
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
    if (this.playoffBracket.final) {
      const team1 = this.playoffBracket.final.team1
      const team2 = this.playoffBracket.final.team2
      this.finalsMatchup = new FinalsMatchup(this.scene, {
        hasStarted: this.playoffBracket.final.hasStarted,
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
