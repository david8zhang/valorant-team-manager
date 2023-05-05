export enum Sites {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum RoundState {
  PREROUND = 'PREROUND',
  MID_ROUND = 'MID_ROUND',
  PRE_PLANT_ROUND = 'PRE_PLANT_ROUND',
  POST_PLANT_ROUND = 'POST_PLANT_ROUND',
  POSTROUND = 'POSTROUND',
}

export class Constants {
  public static TEAM_MGMT_SIDEBAR_WIDTH = 200
  public static TEAM_NAME_PLACEHOLDER = 'Guangdong Tigers'
  public static TEAM_SHORT_NAME = 'GDT'

  public static KILL_CREDITS_AMOUNT = 500
  public static ASSIST_CREDITS_AMOUNT = 250

  public static PREROUND_TIME_SEC = 5
  public static MID_ROUND_TIME_SEC = 100

  public static TOP_BAR_HEIGHT = 60
  public static BOTTOM_BAR_HEIGHT = 60
  public static RIGHT_BAR_WIDTH = 250

  public static MAP_WIDTH = 640
  public static MAP_HEIGHT = 480

  public static WINDOW_WIDTH = Constants.MAP_WIDTH + Constants.RIGHT_BAR_WIDTH
  public static WINDOW_HEIGHT =
    Constants.MAP_HEIGHT + Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT

  public static SORT_LAYERS = {
    UI: 30,
    Player: 20,
    TopLayer: 10,
    BottomLayer: 0,
  }

  //TODO: Move map stuff to another file
  public static PLAYER_AGENT_CONFIGS = [
    {
      name: 'player-1',
      texture: 'player-agent',
      stats: {
        accuracyPct: 90,
        headshotPct: 22,
        reactionTimeMs: 170,
      },
    },
    {
      name: 'player-2',
      texture: 'player-agent',
      stats: {
        accuracyPct: 95,
        headshotPct: 20,
        reactionTimeMs: 190,
      },
    },
    {
      name: 'player-3',
      texture: 'player-agent',
      stats: {
        accuracyPct: 95,
        headshotPct: 30,
        reactionTimeMs: 210,
      },
    },
  ]

  public static CPU_AGENT_CONFIGS = [
    {
      name: 'cpu-1',
      texture: 'cpu-agent',
      stats: {
        accuracyPct: 90,
        headshotPct: 25,
        reactionTimeMs: 170,
      },
    },
    {
      name: 'cpu-2',
      texture: 'cpu-agent',
      stats: {
        accuracyPct: 97,
        headshotPct: 22,
        reactionTimeMs: 180,
      },
    },
    {
      name: 'cpu-3',
      texture: 'cpu-agent',
      stats: {
        accuracyPct: 90,
        headshotPct: 30,
        reactionTimeMs: 210,
      },
    },
  ]
}
