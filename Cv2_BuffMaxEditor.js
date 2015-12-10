//================================================================
// Chronosv2 Plugins - Max Buff Editor
// Cv2_BuffMaxEditor.js
//================================================================

var Imported = Imported || {};
Imported.Cv2_BuffMaxEditor = true;

/*:
 * @plugindesc [v0.7.0] Changes Engine Buff/Debuff Settings.
 * @author chronosv2
 *
 * @param Max Buffs
 * @desc The number of buffs that can be applied to a character.
 * Value must be positive. Default: 2
 * @default 2
 *
 * @param Max Debuffs
 * @desc The number of debuffs that can be applied to a character.
 * Value must be negative. Default: -2
 * @default -2
 *
 * @param Buff Multiplier
 * @desc The amount a buff or debuff alters a stat. Value should
 * be greater than 0 but less than 1. Default: 0.25
 * @default 0.25
 *
 * @help Version 0.7.0 (8:11 PM, October 23, 2015)
 * This plugin does not provide plugin commands.
 * 
 * Please note the acceptable ranges for values.
 * Going outside of these ranges will reset them to their defaults.
 *
 * Max Buffs: Range +1 ~ +??? (No idea what the upper limit for the engine is.)
 * Max Debuffs: Range -1 ~ -??? (Again, no idea what the lower limit for the
 * engine is.)
 * Buff Multiplier: Range +0.0001 ~ +1.0000
 *
 * Note that, unless you really want to have a field day balancing your game,
 * it's best to keep the Buff Multiplier value low.
 * My advice is to stick with the total value at buff/debuff max to be
 * equal to ±0.50.
 * The engine default is 2 steps up or down at 0.25 (25%) change, for a
 * total of 0.50 either way.
 */

(function() {

    var parameters = PluginManager.parameters('Cv2_BuffMaxEditor');
    var MaxPos = Number(parameters['Max Buffs'] || 2);
    var MaxNeg = Number(parameters['Max Debuffs'] || -2);
	var BuffAmt = Number(parameters['Buff Multiplier'] || 0.25);
	
	if (MaxPos < 1) {
		MaxPos = 2;
		console.log("Maximum Buffs invalid. Setting to default (2).");
	}
	
	if (MaxNeg > -1) {
		MaxNeg = -2;
		console.log("Maximum Debuffs invalid. Setting to default (-2).");
	}

	if (BuffAmt <= 0 || BuffAmt > 1) {
		BuffAmt = 0.25;
		console.log("Buff Multiplier invalid. Setting to default (0.25).");
		console.log("Valid Range: 0.01 to 0.99");
	}
	
	Game_BattlerBase.prototype.isMaxBuffAffected = function(paramId) {
		return this._buffs[paramId] === MaxPos;
	};

	Game_BattlerBase.prototype.isMaxDebuffAffected = function(paramId) {
		return this._buffs[paramId] === MaxNeg;
	};

	Game_BattlerBase.prototype.paramBuffRate = function(paramId) {
		return this._buffs[paramId] * BuffAmt + 1.0;
	};

	Game_BattlerBase.prototype.buffIconIndex = function(buffLevel, paramId) {
		if (buffLevel > 0) {
			return Game_BattlerBase.ICON_BUFF_START + Math.round(Math.abs(buffLevel) / Math.abs(MaxPos)) * 8 + paramId;
		} else if (buffLevel < 0) {
			return Game_BattlerBase.ICON_DEBUFF_START + Math.round(Math.abs(buffLevel) / Math.abs(MaxNeg)) * 8 + paramId;
		} else {
			return 0;
		}
	};
	
})();