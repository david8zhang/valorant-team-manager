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
import { PlantAction } from '../../set-actions/PlantAction'
import { PostPlantAction } from '../../set-actions/PostPlantAction'
import { RetrieveSpikeAction } from '../../set-actions/RetrieveSpikeAction'
import { WaitAction } from '../../set-actions/WaitAction'
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
      const assignedActionIds = new Set<string>()
      agents.forEach((agent) => {
        const compatibleActionSeqs = randomPlay.filter((actionSeq) => {
          return (
            (actionSeq.executorRole === agent.role || actionSeq.executorRole === Role.ANY) &&
            !assignedActionIds.has(actionSeq.sequenceId)
          )
        })
        const randomSequence =
          compatibleActionSeqs[Phaser.Math.Between(0, compatibleActionSeqs.length - 1)]
        assignedActionIds.add(randomSequence.sequenceId)
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
        return new MoveToRegionAction(agent, action.args.regionName)
      }
      case ActionType.Plant: {
        return new PlantAction(agent, action.args.plantLocation)
      }
      case ActionType.PostPlant: {
        return new PostPlantAction(agent, action.args.postPlantPositionName)
      }
      case ActionType.Wait: {
        return new WaitAction(agent, action.args.waitTimeSeconds)
      }
      case ActionType.RetrieveSpike: {
        return new RetrieveSpikeAction(agent)
      }
    }
  }
}
