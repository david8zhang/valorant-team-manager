import { Side } from '~/core/Agent'
import { PostRound } from '../PostRound'
import { Screen } from './Screen'
import { PostRoundTeam } from '~/core/ui/PostRoundTeam'
import { Constants } from '~/utils/Constants'
import { TeamConfig } from '../TeamMgmt'
import { PostRoundTeamStats } from '~/core/ui/PostRoundTeamStats'

export class PostRoundTeamStatsScreen implements Screen {
  private postRoundText!: Phaser.GameObjects.Text
  private postRoundTeamStats!: PostRoundTeamStats
  private scene: PostRound

  constructor(scene: PostRound) {
    this.scene = scene
    this.setupPostRoundTeams()
    this.setupContinueButton()
    this.setupPostRoundTeamStats()
    this.setupPostRoundText()
  }

  setVisible(isVisible: boolean) {}

  onRender(): void {}

  setupPostRoundTeams() {
    const playerTeam = new PostRoundTeam(this.scene, {
      position: {
        x: 150,
        y: Constants.WINDOW_HEIGHT / 2,
      },
      teamConfig: this.scene.playerTeamConfig,
    })
    const cpuTeam = new PostRoundTeam(this.scene, {
      position: {
        x: Constants.WINDOW_WIDTH - 150,
        y: Constants.WINDOW_HEIGHT / 2,
      },
      teamConfig: this.scene.cpuTeamConfig,
    })
  }

  setupContinueButton() {}

  setupPostRoundText() {
    this.postRoundText = this.scene.add.text(
      Constants.WINDOW_WIDTH / 2,
      Constants.WINDOW_HEIGHT / 2,
      `${this.scene.winningSide === Side.PLAYER ? 'Victory' : 'Defeat'}`,
      {
        fontSize: '50px',
        color: 'black',
      }
    )
    this.postRoundText.setPosition(
      Constants.WINDOW_WIDTH / 2 - this.postRoundText.displayWidth / 2,
      Constants.WINDOW_HEIGHT / 6 - this.postRoundText.displayHeight / 2
    )
  }

  setupPostRoundTeamStats() {
    this.postRoundTeamStats = new PostRoundTeamStats(this.scene, {
      position: {
        x: Constants.WINDOW_WIDTH / 2,
        y: Constants.WINDOW_HEIGHT / 2 - 50,
      },
      totalKills: {
        [Side.PLAYER]: this.scene.teamStats.PLAYER.totalKills,
        [Side.CPU]: this.scene.teamStats.CPU.totalKills,
      },
      totalDeaths: {
        [Side.PLAYER]: this.scene.teamStats.PLAYER.totalDeaths,
        [Side.CPU]: this.scene.teamStats.CPU.totalDeaths,
      },
      totalAssists: {
        [Side.PLAYER]: this.scene.teamStats.PLAYER.totalAssists,
        [Side.CPU]: this.scene.teamStats.CPU.totalAssists,
      },
    })
  }
}
