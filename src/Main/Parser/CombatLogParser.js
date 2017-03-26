import Buffs from './Modules/Core/Buffs';
import Combatants from './Modules/Core/Combatants';
import RefactorMe from './RefactorMe';

import Ilterendi from './Modules/Legendaries/Ilterendi';
import Velens from './Modules/Legendaries/Velens';

// Talents
export const SPELL_ID_RULE_OF_LAW = 214202;

export const DRAPE_OF_SHAME_ITEM_ID = 142170;

class CombatLogParser {
  static enabledModules = {
    buffs: Buffs,
    combatants: Combatants,
    refactorMe: RefactorMe,
    ilterendi: Ilterendi,
    velens: Velens,
  };

  player = null;
  fight = null;

  modules = {};

  get fightDuration() {
    return this.fight.end_time - this.fight.start_time;
  }
  _timestamp = null;
  get currentTimestamp() {
    return this._timestamp;
  }

  constructor(player, fight) {
    this.player = player;
    this.fight = fight;

    Object.keys(this.constructor.enabledModules).forEach(key => {
      const value = this.constructor.enabledModules[key];
      this.modules[key] = new value(this);
    });
  }

  parseEvents(events) {
    return new Promise((resolve, reject) => {
      events.forEach(event => {
        this._timestamp = event.timestamp;

        this.parseEvent(event);
      });

      resolve(events.length);
    });
  }
  parseEvent(event) {
    const methodName = `parse_${event.type}`;
    this.constructor.tryCall(this, methodName, event);
    Object.keys(this.modules).forEach(key => {
      const module = this.modules[key];
      this.constructor.tryCall(module, methodName, event);
    });
  }
  static tryCall(object, methodName, event) {
    const method = object[methodName];
    if (method) {
      method.call(object, event);
    }
  }

  byPlayer(event) {
    return (event.sourceID === this.player.id);
  }
  toPlayer(event) {
    return (event.targetID === this.player.id);
  }
}

export default CombatLogParser;
