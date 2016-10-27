//================================================================
// Chronosv2 Plugins - Death Common Event
// Cv2_DeathCommonEvent.js
// Released under the MIT License. See LICENSE file at
// https://github.com/chronosv2/Cv2MVPlugins/blob/master/LICENSE
// for details.
// You can also receive the latest version of each of these
// plugins from https://github.com/chronosv2/Cv2MVPlugins
//
// As per the above license, you are free to use this project
// for any commercial or non-commercial purposes. All I ask is
// that you give credit -- "Chronosv2" will suffice. If you feel
// so inclined, let me know about any projects you make using
// these plugins -- I'd love to see them!
//================================================================

var Imported = Imported || {};
Imported.Cv2_DeathCommonEvent = true;
/*:
 * @plugindesc [v1.2.0] Calls a Common Event on character death.
 * @author chronosv2
 *
 * @param DCE Fallthrough
 * @desc If this is set to true and a character has both a class DCE
 * and actor DCE, both will be run. Valid values: true / false
 * @default false
 *
 * @param All Ally Dead DCE
 * @desc Common Event run when ALL allies are dead.
 * Set to 0 to disable. See Help for important info.
 * @default 0
 *
 * @param All Enemy Dead DCE
 * @desc Common Event run when ALL Enemies are dead.
 * Set to 0 to disable.
 * @default 0
 *
 * @param Any Ally DCE
 * @desc Common Event run when ANY ally dies.
 * Set to 0 to disable.
 * @default 0
 *
 * @param Any Enemy DCE
 * @desc Common Event run when ANY enemy dies.
 * Set to 0 to disable.
 * @default 0
 *
 * @help Version 1.2.0 (9:54 PM, January 25, 2016)
 *
 * This plugin does not implement any commands.
 *
 * Parameters:
 * - All Ally Dead DCE: The Event ID to be run when All Allies are dead.
 * This actually runs before Game Over, so it could be used to check
 * for a condition to revive a party member, for example.
 * IMPORTANT NOTE: Due to an error on my part, it turns out Game Over ran
 * even if the party was revived. If you use All Ally Dead DCE, you will
 * have to handle the Game Over step yourself.
 * - All Enemy Dead DCE: The Event ID to be run when All Enemies are dead.
 * This actually runs before Battle Victory. I'm not exactly sure what
 * this could be used for but it could be useful I'm sure.
 * - Any Ally Dead DCE: The Event ID to be run when any Ally dies.
 * This will only be run if the actor does not have an Actor or Class
 * DCE.
 * - Any Enemy Dead DCE: The Event ID to be run when any Enemy dies.
 * See above for information about fallthrough.
 *
 * Place the notetag <DeathCommonEvent:[id]> in the note box for
 * an actor, class or enemy that needs a common event when they die.
 *
 * Example:
 *   <DeathCommonEvent:3>
 *
 * Compatible with Hime's Common Event Queue, available at:
 * http://forums.rpgmakerweb.com/index.php?/topic/47857-common-event-queue/
 * http://himeworks.com/2015/10/common-event-queue-mv/
 *
 * Place this plugin BELOW Common Event Queue if you are using it.
 * If you are using Hime's Common Event Queue and have DCE Fallthrough
 * set to 'true', if a Class has a DCE and an Actor possessing that
 * Class also has a DCE, both will be called.
 *
 * If you are NOT using Hime's Common Event Queue, Class DCE will
 * override Actor DCE -- if an Actor has both only Class will run.
*/

(function () {
	var parameters = PluginManager.parameters('Cv2_DeathCommonEvent');
	var THCmEvtQueue = !!Imported.CommonEventQueue;
	var DCEFallThrough = (parameters['DCE Fallthrough'].toLowerCase() === 'true');
	var DCEAllAllyDead = Number(parameters['All Ally Dead DCE'] || 0);
	var DCEAllEnemyDead = Number(parameters['All Enemy Dead DCE'] || 0);
	var DCEAnyAllyDead = Number(parameters['Any Ally DCE'] || 0);
	var DCEAnyEnemyDead = Number(parameters['Any Enemy DCE'] || 0);

	if (!THCmEvtQueue && DCEFallThrough) {
		console.log("Hime's Common Event Queue plugin not found. DCE Fallthrough will do nothing.");
	}

	var Cv2_Game_BattlerBase_die = Game_BattlerBase.prototype.die;
	Game_BattlerBase.prototype.die = function() {
		// console.log("'.die' called.");
		//console.log(this.name() + " isAlive: " + this.isAlive() + " (Should be false)");
		if (this.isActor()) {
			// console.log("Actor ID: " + this._actorId);
			var ActorID = this._actorId;
			if ($gameActors.actor(ActorID).currentClass().meta.DeathCommonEvent) {
				// console.log("Class's DCE: " + Number($gameActors.actor(ActorID).currentClass().meta.DeathCommonEvent));
				$gameTemp.reserveCommonEvent(Number($gameActors.actor(ActorID).currentClass().meta.DeathCommonEvent));
				if (this.actor().meta.DeathCommonEvent && THCmEvtQueue && DCEFallThrough) {
					// console.log("Actor's DCE: " + Number(this.actor().meta.DeathCommonEvent));
					$gameTemp.reserveCommonEvent(Number(this.actor().meta.DeathCommonEvent));
				}
			} else if (this.actor().meta.DeathCommonEvent) {
				// console.log("Actor's DCE: " + Number(this.actor().meta.DeathCommonEvent));
				$gameTemp.reserveCommonEvent(Number(this.actor().meta.DeathCommonEvent));
			} else if (DCEAnyAllyDead > 0) {
				$gameTemp.reserveCommonEvent(DCEAnyAllyDead);
			}
			if (DCEAllAllyDead > 0) {
				var RunDCE = true;
				for (i = 0; i < this.friendsUnit().members().length; i++) {
					if (i === this.index()) continue;
					if (this.friendsUnit().members()[i].isAlive()) {
						RunDCE = false;
					}
				}
				if (RunDCE === true) {
					BattleManager._canLose = true;
					$gameTemp.reserveCommonEvent(DCEAllAllyDead);
				}
			}
		} else {
			if (this.isEnemy()) {
				// console.log("Enemy ID " + this._enemyId + " died.");
				if (this.enemy().meta.DeathCommonEvent) {
					// console.log("Actor's DCE: " + Number(this.enemy().meta.DeathCommonEvent));
					$gameTemp.reserveCommonEvent(Number(this.enemy().meta.DeathCommonEvent));
				} else if (DCEAnyEnemyDead > 0) {
					$gameTemp.reserveCommonEvent(DCEAnyEnemyDead);
				}
				if (DCEAllEnemyDead > 0) {
					var RunDCE = true;
					for (i = 0; i < this.friendsUnit().members().length; i++) {
						if (i === this.index()) continue;
						if (this.friendsUnit().members()[i].isAlive()) {
							RunDCE = false;
						}
					}
					if (RunDCE === true) {
						$gameTemp.reserveCommonEvent(DCEAllEnemyDead);
					}
				}
			}
		}
		Cv2_Game_BattlerBase_die.call(this);
	};
})();
