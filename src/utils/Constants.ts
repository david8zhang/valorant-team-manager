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
  public static MAP_WIDTH = 640
  public static MAP_HEIGHT = 480

  public static WINDOW_WIDTH = 640
  public static WINDOW_HEIGHT = 540

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
}
