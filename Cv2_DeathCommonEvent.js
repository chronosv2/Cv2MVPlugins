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
 * @plugindesc [v1.1.2] Calls a Common Event on character death.
 * @author chronosv2
 *
 * @param DCE Fallthrough
 * @desc If this is set to true and a character has both a class DCE
 * and actor DCE, both will be run. Valid values: true / false
 * @default false
 *
 * @help Version 1.1.2 (4:07 PM, 12/10/2015)
 *
 * This plugin does not implement any commands.
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

	if (!THCmEvtQueue && DCEFallThrough) {
		console.log("Hime's Common Event Queue plugin not found. DCE Fallthrough will do nothing.");
	}

	var Cv2_Game_BattlerBase_die = Game_BattlerBase.prototype.die;
	Game_BattlerBase.prototype.die = function() {
		// console.log("'.die' called.");
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
			}
		} else {
			if (this.isEnemy()) {
				// console.log("Enemy ID " + this._enemyId + " died.");
				if (this.enemy().meta.DeathCommonEvent) {
					// console.log("Actor's DCE: " + Number(this.enemy().meta.DeathCommonEvent));
					$gameTemp.reserveCommonEvent(Number(this.enemy().meta.DeathCommonEvent));
				}

			}
		}
		Cv2_Game_BattlerBase_die.call(this);
	};
})();
