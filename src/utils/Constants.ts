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
  public static INITIAL_SPIKE_POSITION_CPU_SIDE = {
    x: 312,
    y: 408,
  }

  public static INITIAL_SPIKE_POSITION_PLAYER_SIDE = {
    x: 344,
    y: 56,
  }

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

  public static A_SITE_CENTER_POS: { x: number; y: number } = {
    x: 48,
    y: 64,
  }

  public static B_SITE_CENTER_POS: { x: number; y: number } = {
    x: 600,
    y: 264,
  }

  public static A_SITE_POSITIONS: any[] = []
  public static B_SITE_POSITIONS: any[] = []
  public static A_SITE_START: { x: number; y: number } = { x: 8, y: 8 }
  public static A_SITE_END: { x: number; y: number } = { x: 88, y: 120 }
  public static B_SITE_START: { x: number; y: number } = { x: 568, y: 216 }
  public static B_SITE_END: { x: number; y: number } = { x: 632, y: 312 }

  public static CALC_A_SITE_POSITIONS() {
    const start = Constants.A_SITE_START
    const end = Constants.A_SITE_END
    for (let x = start.x; x <= end.x; x += 16) {
      for (let y = start.y; y <= end.y; y += 16) {
        Constants.A_SITE_POSITIONS.push({ x, y })
      }
    }
  }

  public static CALC_B_SITE_POSITIONS() {
    const start = Constants.B_SITE_START
    const end = Constants.B_SITE_END
    for (let x = start.x; x <= end.x; x += 16) {
      for (let y = start.y; y <= end.y; y += 16) {
        Constants.B_SITE_POSITIONS.push({ x, y })
      }
    }
  }
}
