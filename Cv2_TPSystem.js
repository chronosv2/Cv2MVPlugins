//================================================================
// Chronosv2 Plugins - Cv2 TP System
// Cv2_TPSystem.js
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
Imported.Cv2_TPSystem = true;

/*:
 * @plugindesc [v1.2.1] Implements new TP functions such as Individual Max TP,
 * Class-based TP and expression-based Initial TP values in combat.
 * @author chronosv2
 *
 * @param Equipment Mod MaxTP
 * @desc Enables checking equipment for tags. (See Help)
 * OPTIONS: true  |  false
 * @default false
 *
 * @param Custom TP Display
 * @desc Enables changing TP Stat name or hiding TP bar.
 * OPTIONS: true  |  false
 * @default false

 *
 * @help Version 1.2.1 (4:08 PM, 12/10/2015)
 * This plugin does not implement any commands.
 *
 * This plugin can be used to modify a number of TP-related functions for a character.
 * Place this plugin near the bottom of your Combat Plugins. If you have any plugins
 * that modify how TP works, place this plugin below them.
 *
 * Then in your Actors, use the following Note Tags:
 * To just change a character's Max TP, use this:
 * <TPMax:[TP Maximum]>
 * Example: <TPMax:150>
 * In this example, the Actor's Max TP would be set to 150.
 *
 * If you only want the character's TP to change from default if a Switch is activated,
 * use this:
 * <TPMaxSwitch:[Switch ID]>
 * Example: <TPMaxSwitch:13>
 * In this example, if Switch 13 is on, the value set in the <TPMax:#> Tag will be used.
 * If the switch is off the default TP (either set by the core engine or another MaxTP
 * script) will be used.
 *
 * If you want to have the character's Max TP based on their class, use this:
 * <ClassTP:[Class ID],[Max TP Value];[Class ID],[Max TP Value];[Class ID],[Max TP Value];[Class ID],[Max TP Value]>
 * Example: <ClassTP:1,120;3,200;4,70;5,25>
 * In this example, Class ID 1 would have a Max TP value of 120. Class 2, since it was
 * left out of the tag, would have its default value (see below). Class 3 would have a
 * TP Max of 200, Class 4 would have a TP Max of 70 and Class 5 would have a TP Max of 25.
 * Any Class IDs you do not include in this tag will be given a Max TP of either the
 * default (100), the TPMax Tag's value, or if there's a TPMaxSwitch Tag, the TPMax value
 * if the switch is on.
 * Repeat the [ID],[Value] pair as many times as you need, separating each ID/Value pair
 * by a semicolon (;).
 *
 * If you want to have the character's Class-based Max TP only activate if a Switch is
 * turned on, use this:
 * <ClassTPSwitch:[Class ID],[Switch ID];[Class ID],[Switch ID];[Class ID],[Switch ID]>
 * Example: <ClassTPSwitch:1,7;4,9;5,22>
 * In this example Class 1 would get its custom TP value if Switch 7 is on, Class 4
 * would have its custom value if 9 is on, and 5 would get its custom value if 22 is on.
 * If a class ID has a custom TP value but no Switch assigned to it in this Tag, it will
 * always have its value.
 * Again, repeat the [ID],[Switch ID] pair as many times as you need, separating each
 * ID/Switch ID pair by a semicolon (;).
 *
 * Advanced Users: If you want to change an Actor's Start-of-Battle TP set to something
 * other than the default Random 0 to 25, use this:
 * <TPFormula:[JavaScript Expression]>
 * Example: <TPFormula:10+(Math.random()*15)>
 * In this example the Actor's starting combat TP will be set to 10 plus a random value
 * between 0 and 15 (for a total of 10-25).
 * If you enter an Invalid JavaScript expression into this tag, it will output the error
 * to the console along with the name of the Actor the tag belongs to.
 *
 * Customized TP Display:
 * If the Custom TP Display parameter is set to true, then the following tags can be used
 * in Actors and Classes:
 * <TPName:[Name]>
 * Example: <TPName:PWR>
 * Sets the character's TP stat name to the item specified in [Name]. In the example, the
 * TP name for the Actor or Class would be PWR.
 * <HideTP:1>
 * If this tag is present in an Actor or Class notebox, the Actor's TP bar will be hidden.
 *
 * Max TP by Equipment:
 * If the Equipment Mod MaxTP parameter is set to true, then Equipment (Weapons, Armor)
 * can also have the following notetags:
 * <TPPriority:[Priority]>
 * Example:
 * <TPPriority:32>
 * This value represents how prominent the TP Max modification is. The equipped item with
 * the highest Priority will have its TP Max applied.
 * <TPMax:[TP Maximum]>
 * As above, but only the equipment with the highest priority will apply.
 * <TPFormula:[formula]>
 * ADVANCED: Again, as above, but only the equipment with the highest priority will apply.
 *
 * Equipment Examples:
 * Weapon:
 * <TPPriority:10> <TPMax:35> <TPFormula: 10+(Math.random()*10)>
 * Shield:
 * <TPPriority:28> <TPMax:120>
 * Armor:
 * <TPPriority:24> <TPMax:100> <TPFormula: 15>
 * Accessory:
 * <TPPriority:22> <TPMax:150> <TPFormula: 10+(Math.random()*5)>
 *
 * The system will check each piece of equipment, starting from the weapon and moving
 * through one by one. The item with the highest TPPriority is used for Max TP value.
 * In this case, even though the actor has an Accessory equipped that grants 150
 * Max TP, the Shield has a higher priority (28 vs. 22) and therefore the actor's Max
 * TP is set to 120.
 * The character's start-of-battle TP will be set to 15, because it was the item with
 * the highest priority (the Shield didn't have a formula to use).
*/

(function() {
	var parameters = PluginManager.parameters('Cv2_TPSystem');
	var CheckEquips = (parameters['Equipment Mod MaxTP'].toLowerCase() === 'true');
    var CustomTPDisp = (parameters['Custom TP Display'].toLowerCase() === 'true');

    var Cv2_Game_BattlerBase_maxTp = Game_BattlerBase.prototype.maxTp;
    Game_BattlerBase.prototype.maxTp = function() {
        if (this.isActor()) {
            if (this.actor().meta.ClassTP) {
                var aClass = this._classId;
                //console.log("ClassID: " + aClass)
                if (aClass > 0) {
                var aClasses = this.actor().meta.ClassTP.split(';');
                if (this.actor().meta.ClassTPSwitch) {
                    //console.log("Character has Classes with Switch-based TP.");
                    aClassSwitch = this.actor().meta.ClassTPSwitch.split(';');
                } else {
                    aClassSwitch = null;
                }
                //console.log("Character Class: " + aClass);
                //console.log("Character ClassTP Meta: " + aClasses);
                    for (var i of aClasses) {
                        var aData = i.split(',');
                        //console.log("ClassTP Class: " + aData);
                        var aClassID = Number(aData[0]);
                        var aClassTP = Number(aData[1]);
                        if (aClass === aClassID) {
                            if (aClassSwitch) {
                                for (var j of aClassSwitch) {
                                    aSwData = j.split(',');
                                    aClassSwClass = Number(aSwData[0]);
                                    aClassSwID = Number(aSwData[1]);
                                    if (aClassSwClass != aClassID) {
                                        continue;
                                    }
                                    //console.log("Checking Class " + aClassSwClass + " for Switch " + aClassSwID);
                                    if (aClassID === aClassSwClass) {
                                        //console.log("Switch is " + $gameSwitches.value(aClassSwID));
                                        if ($gameSwitches.value(aClassSwID)) {
//											this._maxTP = aClassTP;
                                            return aClassTP;
                                        }
                                    }
                                }
                            } else {
                                //console.log("Return: " + aClassTP);
                                this._maxTP = aClassTP;
                                return aClassTP;
                            }
                        }
                    }
                }
            }
            if (CheckEquips === true) {
                var eqPriority = -1;
                var eqTPMax = -1;
                for (var eq of this._equips) {
                    if (eq.isEquipItem()) {
                        if (eq.object().meta.TPPriority) {
                            if (Number(eq.object().meta.TPPriority) > eqPriority) {
                                eqPriority = Number(eq.object().meta.TPPriority);
                                if (eq.object().meta.TPMax) {
                                    eqTPMax = Number(eq.object().meta.TPMax);
                                }
                            }
                        }
                    }
                }
                if (eqTPMax >= 0) {
                    return eqTPMax;
                }
            }

            if (this.actor().meta.TPMax) {
                aMaxTP = Number(this.actor().meta.TPMax);
                if (this.actor().meta.TPMaxSwitch) {
                    var aSwitch = Number(this.actor().meta.TPMaxSwitch);
                    if ($gameSwitches.value(aSwitch)) {
                        this._maxTP = aMaxTP;
                        return aMaxTP;
                    } else {
                        return this._maxTP = Cv2_Game_BattlerBase_maxTp.call(this);
                    }
                } else {
                    this._maxTP = aMaxTP;
                    return aMaxTP;
                }
            } else {
                return this._maxTP = Cv2_Game_BattlerBase_maxTp.call(this);Cv2_Game_BattlerBase_maxTp.call(this);
            }
        } else {
            return this._maxTP = Cv2_Game_BattlerBase_maxTp.call(this);Cv2_Game_BattlerBase_maxTp.call(this);
        }
    };

    var Cv2_Game_BattlerBase_tpRate = Game_BattlerBase.prototype.tpRate;
    Game_BattlerBase.prototype.tpRate = function() {
        if (this.isActor() && this._maxTP != 100) {
            return this.tp / this._maxTP;
        } else {
            return Cv2_Game_BattlerBase_tpRate.call(this);
        }
    };

    var Cv2_Game_Battler_initTp = Game_Battler.prototype.initTp;
    Game_Battler.prototype.initTp = function() {
        if (this.isActor()) {
//          var eqTPFormula = '';
            if (CheckEquips === true) {
                var eqPriority = -1;
                var eqTPFormula = null;
                var eqEquipName = null;
                for (var eq of this._equips) {
                    if (eq.isEquipItem()) {
                        if (eq.object().meta.TPPriority) {
                            if (Number(eq.object().meta.TPPriority) > eqPriority) {
                                eqPriority = Number(eq.object().meta.TPPriority);
                                if (eq.object().meta.TPFormula) {
                                    eqTPFormula = eq.object().meta.TPFormula;
                                    eqEquipName = eq.object().name;
                                }
                            }
                        }
                    }
                }
                try {
                    if (eqTPFormula !== null) {
                        InitialTP = eval(eqTPFormula);
                        //console.log(InitialTP);
                        this.setTp(Math.round(InitialTP));
                        return;
                    }
                } catch(e) {
                    console.log("Error in " + this.name() + "'s " + eqEquipName + " TP Init formula.");
                    console.log(e.toString());
                    Cv2_Game_Battler_initTp.call(this);
                    return;
                }
            }

            if (this.actor().meta.TPFormula) {
                try {
                    // console.log(this.actor().meta.TPFormula)
                    InitialTP = eval(this.actor().meta.TPFormula);
                    // console.log(InitialTP);
                    this.setTp(Math.round(InitialTP));
                } catch (e) {
                    console.log("Error in " + this.name() + " TP Init formula.");
                    console.log(e.toString());
                    Cv2_Game_Battler_initTp.call(this);
                }
            } else {
                Cv2_Game_Battler_initTp.call(this);
            }
        } else {
            Cv2_Game_Battler_initTp.call(this);
        }
        //this.setTp(Math.randomInt(25));
    };

    if (CustomTPDisp === true) {
		var Cv2_Window_Base_drawActorTp = Window_Base.prototype.drawActorTp;
		Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
			width = width || 96;
			//console.log(actor.currentClass());
			if (!actor.actor().meta.HideTP && !actor.currentClass().meta.HideTP) {
				if (actor.actor().meta.TPName || actor.currentClass().meta.TPName) {
					var color1 = this.tpGaugeColor1(actor);
					var color2 = this.tpGaugeColor2(actor);
					this.drawGauge(x, y, width, actor.tpRate(), color1, color2);
					this.changeTextColor(this.systemColor());
					if (actor.currentClass().meta.TPName) {
						this.drawText(actor.currentClass().meta.TPName, x, y, 54);
					} else if (actor.actor().meta.TPName) {
						this.drawText(actor.actor().meta.TPName, x, y, 54);
					} else {
						this.drawText(TextManager.tpA, x, y, 44);
					}
					//this.drawText(TextManager.tpA, x, y, 44);
					this.changeTextColor(this.tpColor(actor));
					this.drawText(actor.tp, x + width - 64, y, 64, 'right');
				} else {
					Cv2_Window_Base_drawActorTp.call(this,actor,x,y,width);
				}
			}
		};
    }
}());
