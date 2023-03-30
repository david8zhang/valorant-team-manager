import { ActionType } from '~/core/behavior-tree/set-actions/ActionType'
import { Role } from './Constants'

export const POST_PLANT_POSITIONS = {
  A: [
    {
      position: {
        x: 568,
        y: 312,
      },
      name: 'A_Main',
      holdPosition: {
        x: 586,
        y: 152,
      },
      control: ['A-Plant', 'Heaven'],
      vulnerable: ['A-Main'],
    },
    {
      position: {
        x: 632,
        y: 104,
      },
      name: 'A_Site_TopRight',
      holdPosition: {
        x: 520,
        y: 200,
      },
      control: ['A-Door', 'A-Plant'],
      vulnerable: ['A-Main', 'Heaven'],
    },
    {
      position: {
        x: 616,
        y: 232,
      },
      name: 'A_Site_BottomRight_Corner',
      holdPosition: {
        x: 600,
        y: 88,
      },
      control: ['Heaven', 'A-Plant'],
      vulnerable: ['A-Main'],
    },
    {
      position: {
        x: 536,
        y: 104,
      },
      name: 'A_Site_TopLeft',
      holdPosition: {
        x: 584,
        y: 248,
      },
      control: ['A-Plant'],
      vulnerable: ['Heaven'],
    },
    {
      position: {
        x: 536,
        y: 232,
      },
      name: 'A_Site_BottomLeft_Corner',
      holdPosition: {
        x: 600,
        y: 88,
      },
      control: ['Heaven', 'A-Plant'],
      vulnerable: ['A-Main'],
    },
    {
      position: {
        x: 632,
        y: 312,
      },
      name: 'A_Site_Wine',
      holdPosition: {
        x: 472,
        y: 296,
      },
      control: ['A-Main'],
      vulnerable: ['A-Plant'],
    },
  ],
}

/**
 * Standard push with all players through A site
 * - All 3 path from A-Lobby through A-Main onto site
 * - Spike planter plants on default, while other players pick post plant locations
 */
export const A_SITE_STACKED_PUSH = [
  {
    executorRole: Role.ANY,
    actionSeq: [
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Lobby',
        },
      },
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Main',
        },
      },
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Door',
        },
      },
    ],
  },
  {
    executorRole: Role.ANY,
    actionSeq: [
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Lobby',
        },
      },
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Main',
        },
      },
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'Heaven',
        },
      },
    ],
  },
  {
    executorRole: Role.ANY,
    actionSeq: [
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Lobby',
        },
      },
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Main',
        },
      },
      {
        actionType: ActionType.MoveToRegion,
        args: {
          regionName: 'A-Plant',
        },
      },
    ],
  },
]

export const ALL_POST_PLANT_POSITIONS = [...POST_PLANT_POSITIONS.A]
export const SET_PLAYS_ATTACK = [A_SITE_STACKED_PUSH]
