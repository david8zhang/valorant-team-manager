export enum GunTypes {
  PISTOL = 'PISTOL',
  SMG = 'SMG',
  RIFLE = 'RIFLE',
}

export enum Range {
  LONG = 'LONG',
  MEDIUM = 'MEDIUM',
  SHORT = 'SHORT',
}

export interface GunConfig {
  damage: {
    body: number
    head: number
    armsAndLegs: number
  }
  fireDelay: number
  rangeAccModifiers: {
    [key in Range]: number
  }
  cost: number
  texture: string
}

export const getRangeForPoints = (
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
) => {
  const distance = Phaser.Math.Distance.Between(pointA.x, pointA.y, pointB.x, pointB.y)
  if (distance <= 75) {
    return Range.SHORT
  }
  if (distance > 75 && distance <= 175) {
    return Range.MEDIUM
  }
  if (distance > 175) {
    return Range.LONG
  }
}

export const GUN_CONFIGS: {
  [key in GunTypes]: GunConfig
} = {
  [GunTypes.PISTOL]: {
    damage: {
      body: 25,
      head: 75,
      armsAndLegs: 20,
    },
    fireDelay: 500,
    rangeAccModifiers: {
      [Range.LONG]: 0.65,
      [Range.MEDIUM]: 0.8,
      [Range.SHORT]: 1,
    },
    cost: 0,
    texture: 'classic-icon-cropped',
  },
  [GunTypes.SMG]: {
    damage: {
      body: 25,
      head: 75,
      armsAndLegs: 20,
    },
    fireDelay: 100,
    rangeAccModifiers: {
      [Range.LONG]: 0.5,
      [Range.MEDIUM]: 0.75,
      [Range.SHORT]: 1,
    },
    cost: 1000,
    texture: 'spectre-icon-cropped',
  },
  [GunTypes.RIFLE]: {
    damage: {
      head: 150,
      body: 40,
      armsAndLegs: 35,
    },
    fireDelay: 200,
    rangeAccModifiers: {
      [Range.LONG]: 0.8,
      [Range.MEDIUM]: 1,
      [Range.SHORT]: 1,
    },
    cost: 2000,
    texture: 'vandal-icon-cropped',
  },
}
