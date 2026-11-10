/* 四种效果的统一定义；概率、说明和界面均使用同一份数据。 */
(function (root) {
  'use strict';
  const definitions = {
    normal: { name: '普通', icon: '○', color: '#807767', hint: '相同等级相碰，合成更高一级', weight: .80 },
    blast: { name: '爆裂', icon: '✹', color: '#e56e33', hint: '合成时小范围爆破，清除物品并得分', weight: .075, good: true },
    magnet: { name: '牵引', icon: '∩', color: '#7960c9', hint: '合成后吸引附近一只同级物品', weight: .075, good: true },
    ice: { name: '冰封', icon: '❄', color: '#348cc0', hint: '暂不能合成，再投放3次后解冻', weight: .025, good: false },
    inflate: { name: '膨胀', icon: '↗', color: '#c06591', hint: '体积增大22%，合成后恢复正常', weight: .025, good: false }
  };
  function roll(random = Math.random) {
    let n = random();
    for (const [key, d] of Object.entries(definitions)) { n -= d.weight; if (n < 0) return key; }
    return 'inflate';
  }
  function radiusScale(effect) { return effect === 'inflate' ? 1.22 : 1; }
  function canMerge(a, b) { return a.tier === b.tier && !a.iceLeft && !b.iceLeft; }
  function clearScore(tier) { return Math.max(1, tier * (tier + 1) / 2); }
  const api = { definitions, roll, radiusScale, canMerge, clearScore, rules: 'effects-v1' };
  root.MergeEffects = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
