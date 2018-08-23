import {Turn} from './AiChain'
import {store} from '../../store/store'

export default class BatteryBackup extends Turn {
  execute () {
    if (this.hand.batteryBackupCard !== undefined && store.getters.getCurrentPlayer.hasPowerOutage && !store.getters.getCurrentPlayer.hasGenerator) {
      this.cardToPlay = this.hand.batteryBackupCard
      this.moveType = 'enhance'
      return true
    }
  }
}

