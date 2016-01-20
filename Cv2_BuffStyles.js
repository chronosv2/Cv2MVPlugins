//================================================================
// Chronosv2 Plugins - Buff Styles
// Cv2_BuffStyles.js
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
Imported.Cv2_BuffStyles = true;

/*:
 * @plugindesc [v1.0.0] (Requires YEP_BuffsStatesCore) Allows the choice of buff styles.
 * <Cv2 AdditiveBuffs>
 * @author chronosv2
 *
 * @param Buff Style
 * @desc Sets how buffs are handled. Options are:
 * See Help for list of styles.
 * @default: def
 *
 * @help Version 1.0.0 (5:05 PM, January 20, 2016)
 * This plugin does not provide plugin commands.
 *
 * Buff Styles List and Guide:
 * def = Default Style Multiplicitive Buffs (Stat*Mod*Buff)
 * i.e. 100 * 0.75 * 1.5 = 112.5 -> 113
 * When using default: Buff formula looks like:
 * this._buffs[paramId] * 0.25 + 1.0
 * add = Flat Additive Buffs ((Stat * Mod) + Buff)
 * i.e. (100 * 0.75) + 6 = 81
 * When using Flat Additive, formula looks like:
 * this._buffs[paramId] * 3
 * pct = Percent Additive Buffs (Stat * (Mod + Buff))
 * i.e. 100 * (0.75 + 0.50) = 125
 * When using Flat Additive, formula looks like:
 * this._buffs[paramId] * 0.10
 *
 * This plugin modifies the core way in which RPG Maker manages buffs.
 * By default, buffs are multiplicitive. For example, let's say you
 * are using the default buff rates: +/- 2 at 0.25x per buff. Aldo has
 * 100 ATK, a state that lowers his ATK by 25%, and 2 positive buffs.
 * His default ATK formula would then be 100 * 0.75 * 1.5, totaling
 * 112.5, rounded to 113.
 * An additive flat system would use a static buff value, for example
 * 3 points per buff/debuff. Using this formula, the above ATK formula
 * (+2 buff) would be rewritten as 100 * 0.75 + 6, totalling 81. Note
 * that if you use Flat Additive Style, you may wish to use some code in
 * the formula so that your HP/MP stats have a different rate from the
 * typically lower-numbered stats.
 * Additive Percentile style combines the percentages for the boost and
 * buff. For example, Aldo's -25% ATK state and +50% ATK Buff would total
 * to 125%, which would be 125 ATK.
 *
 * Please note that each style requires a different type of formula in
 * Yanfly's Buffs and States Core. See the above examples under then
 * style listing for details.
 */

if (Imported.YEP_BuffsStatesCore === true) {
    (function() {
        BuffStyle = PluginManager.parameters('Cv2_BuffStyles')['Buff Style'];
        Game_BattlerBase.prototype.param = function(paramId) {
            var value = this.paramBase(paramId) + this.paramPlus(paramId);
            switch(BuffStyle) {
                case "add":
                    value *= this.paramRate(paramId);
                    value += this.paramBuffRate(paramId);
                break;
                case "pct":
                    value *= (this.paramRate(paramId) + this.paramBuffRate(paramId));
                break;
                default:
                    value *= this.paramRate(paramId) * this.paramBuffRate(paramId);
            }
            var maxValue = this.paramMax(paramId);
            var minValue = this.paramMin(paramId);
            return Math.round(value.clamp(minValue, maxValue));
         };
    })();
} else {
    console.log("This plugin requires Yanfly's Buffs & States Core.");
    console.log("Get it from");
    console.log("http://yanfly.moe/2015/12/25/yep-50-buffs-states-core/");
}
