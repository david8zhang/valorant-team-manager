import { Agent, Side } from '~/core/Agent'
import Game from '~/scenes/Game'
import { Role } from '~/utils/Constants'
import { SET_PLAYS_ATTACK } from '~/utils/CPUConstants'
import { BehaviorStatus } from '../../BehaviorStatus'
import { BehaviorTreeNode } from '../../BehaviorTreeNode'
import { Blackboard } from '../../Blackboard'
import { ActionConfig } from '../../set-actions/ActionConfig'
import { ActionType } from '../../set-actions/ActionType'
import { MoveToRegionAction } from '../../set-actions/MoveToRegionAction'
import { TeamBlackboardKeys } from './TeamBlackboardKeys'

export class AssignActions extends BehaviorTreeNode {
  constructor(blackboard: Blackboard) {
    super('AssignActions', blackboard)
  }

  public process(): BehaviorStatus {
    const existingAgentActionMapping = this.blackboard.getData(
      TeamBlackboardKeys.AGENT_ACTION_SEQUENCE_MAPPING
    )
    if (!existingAgentActionMapping) {
      const playbook = Game.instance.attackSide === Side.CPU ? SET_PLAYS_ATTACK : []
      const randomPlay = playbook[Phaser.Math.Between(0, playbook.length - 1)]
      const agents = this.blackboard.getData(TeamBlackboardKeys.AGENTS) as Agent[]
      const agentToActionsMapping = {}
      agents.forEach((agent) => {
        const compatibleActionSeqs = randomPlay.filter((actionSeq) => {
          return actionSeq.executorRole === agent.role || actionSeq.executorRole === Role.ANY
        })
        const randomSequence =
          compatibleActionSeqs[Phaser.Math.Between(0, compatibleActionSeqs.length - 1)]
        console.log(randomSequence)

        const actionSeqObjects = randomSequence.actionSeq.map((action) => {
          return this.convertToClass(agent, action)
        })
        agentToActionsMapping[agent.name] = actionSeqObjects
      })
      this.blackboard.setData(
        TeamBlackboardKeys.AGENT_ACTION_SEQUENCE_MAPPING,
        agentToActionsMapping
      )
    }
    return BehaviorStatus.SUCCESS
  }

  convertToClass(agent: Agent, action: ActionConfig) {
    switch (action.actionType) {
      case ActionType.MoveToRegion: {
        console.log(action.args.regionName)
        return new MoveToRegionAction(agent, action.args.regionName)
      }
    }
  }
}
