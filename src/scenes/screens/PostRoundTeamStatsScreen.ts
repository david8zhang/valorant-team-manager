import { Side } from '~/core/Agent'
import { PostRound } from '../PostRound'
import { Screen } from './Screen'
import { PostRoundTeam } from '~/core/ui/PostRoundTeam'
import { Constants } from '~/utils/Constants'
import { PostRoundTeamStats } from '~/core/ui/PostRoundTeamStats'
import { Button } from '~/core/ui/Button'
import { PostRoundScreenKeys } from './ScreenKeys'

export class PostRoundTeamStatsScreen implements Screen {
  private postRoundText!: Phaser.GameObjects.Text
  private postRoundTeamStats!: PostRoundTeamStats
  private continueButton!: Button
  private scene: PostRound
  private playerTeam!: PostRoundTeam
  private cpuTeam!: PostRoundTeam

  constructor(scene: PostRound) {
    this.scene = scene
    this.setupPostRoundTeams()
    this.setupContinueButton()
    this.setupPostRoundTeamStats()
    this.setupPostRoundText()
  }

  setVisible(isVisible: boolean) {
    this.postRoundText.setVisible(isVisible)
    this.continueButton.setVisible(isVisible)
    this.playerTeam.setVisible(isVisible)
    this.cpuTeam.setVisible(isVisible)
    this.postRoundTeamStats.setVisible(isVisible)
  }

  onRender(): void {}

  setupPostRoundTeams() {
    this.playerTeam = new PostRoundTeam(this.scene, {
      position: {
        x: 150,
        y: Constants.WINDOW_HEIGHT / 2,
      },
      teamConfig: this.scene.playerTeamConfig,
    })
    this.cpuTeam = new PostRoundTeam(this.scene, {
      position: {
        x: Constants.WINDOW_WIDTH - 150,
        y: Constants.WINDOW_HEIGHT / 2,
      },
      teamConfig: this.scene.cpuTeamConfig,
    })
  }

  setupContinueButton() {
    this.continueButton = new Button({
      scene: this.scene,
      x: Constants.WINDOW_WIDTH / 2,
      y: Constants.WINDOW_HEIGHT - 75,
      backgroundColor: 0x444444,
      width: 150,
      height: 50,
      text: 'Continue',
      textColor: 'white',
      fontSize: '20px',
      onClick: () => {
        this.scene.renderActiveScreen(PostRoundScreenKeys.PLAYER_STATS)
      },
    })
  }

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
