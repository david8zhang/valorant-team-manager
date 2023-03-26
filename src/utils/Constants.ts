export enum Sites {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum RoundState {
  PREROUND = 'PREROUND',
  PRE_PLANT_ROUND = 'PRE_PLANT_ROUND',
  POST_PLANT_ROUND = 'POST_PLANT_ROUND',
  POSTROUND = 'POSTROUND',
}

export enum GunTypes {
  PISTOL = 'PISTOL',
  SMG = 'SMG',
  RIFLE = 'RIFLE',
}

export interface GunConfig {
  damage: {
    body: number
    head: number
    armsAndLegs: number
  }
  fireDelay: number
}

export class Constants {
  public static PREROUND_TIME_SEC = 5
  public static PREPLANT_ROUND_TIME_SEC = 100
  public static POSTPLANT_ROUND_TIME_SEC = 45
  public static POST_ROUND = 10

  public static TOP_BAR_HEIGHT = 60
  public static BOTTOM_BAR_HEIGHT = 60
  public static RIGHT_BAR_WIDTH = 340

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

  // TODO: Add accuracy modifiers based on distance to target
  public static GUN_CONFIGS: {
    [key in GunTypes]: GunConfig
  } = {
    [GunTypes.PISTOL]: {
      damage: {
        body: 25,
        head: 75,
        armsAndLegs: 20,
      },
      fireDelay: 500,
    },
    [GunTypes.SMG]: {
      damage: {
        body: 25,
        head: 75,
        armsAndLegs: 20,
      },
      fireDelay: 100,
    },
    [GunTypes.RIFLE]: {
      damage: {
        head: 150,
        body: 40,
        armsAndLegs: 35,
      },
      fireDelay: 200,
    },
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
