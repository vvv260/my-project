(function () {
  'use strict';
  const $ = id => document.getElementById(id), game = window.__DNW__, FX = window.MergeEffects;
  let manualPause = false;
  function syncPause() { game.pause(manualPause || !!document.querySelector('dialog[open]')); $('pauseCover').hidden = !manualPause; }
  function open(id) { $(id).showModal(); syncPause(); }
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('close', syncPause));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => $(b.dataset.close).close()));
  for (const id of ['boardBtn','boardBtn2']) $(id).addEventListener('click', () => { open('boardDialog'); window.MergeBoard.refresh(); });
  $('pauseBtn').addEventListener('click', () => { manualPause = !manualPause; syncPause(); });
  $('resumeBtn').addEventListener('click', () => { manualPause = false; syncPause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !game.state.over) { manualPause = true; syncPause(); } });
  // 截获重开，防止误触清空尚未完成的一局。
  $('resetBtn').addEventListener('click', e => { e.stopImmediatePropagation(); if (game.state.drops && !game.state.over) open('restartDialog'); else game.reset(); }, true);
  $('confirmRestart').addEventListener('click', () => { $('restartDialog').close(); manualPause = false; game.reset(); syncPause(); });
  $('restartBtn').addEventListener('click', () => { manualPause = false; syncPause(); });
  function help(effect) {
    const body = $('infoBody'); body.replaceChildren();
    if (effect) {
      const d = FX.definitions[effect]; $('infoTitle').textContent = d.icon + ' ' + d.name;
      const p = document.createElement('p'); p.textContent = d.hint + '。'; body.append(p);
      const img = document.createElement('img'); img.src = 'assets/special/01-grape-' + effect + '.png'; img.alt = d.name + '状态示例'; img.style.cssText = 'display:block;width:150px;height:150px;object-fit:contain;margin:10px auto'; body.append(img);
      const details = { blast:'爆破范围随等级小幅增加。被清除物品只计分一次，不触发它们的效果，也不会炸掉刚合成的新物品。',magnet:'合成后，在一定范围内寻找一只与新物品同级且未冰封的物品，并短暂牵引。没有符合条件的目标时不会强行合成。',ice:'角标数字表示还需投放几次。自身落下不扣次数；此后每成功投放一次，数字减1，减到0后恢复普通。',inflate:'半径增大22%，碰撞体积也随之变大。成功合成后膨胀状态结束；新物品仍可能独立随机获得效果。' };
      const detail = document.createElement('p'); detail.textContent = details[effect]; body.append(detail);
    } else {
      $('infoTitle').textContent = '同级相碰，再合大一点';
      body.innerHTML = '<p>鼠标移动瞄准，点击投放；手机按住拖动，松手投放。相同等级碰到一起会升级。</p><p>物品在警戒线上方停留超过1.5秒，本局结束。两个最高级物品合成会清场并奖励500分。</p><p>左右方向键调整落点，空格投放。打开说明或排行榜会暂停游戏。</p><p><b>四种特殊效果</b>：当前物品与下一个物品都提前显示效果。普通80%，爆裂7.5%，牵引7.5%，冰封2.5%，膨胀2.5%。合成产物独立随机，不继承旧效果。</p>';
      for (const [key,d] of Object.entries(FX.definitions)) if (key !== 'normal') {
        const p = document.createElement('p'); p.className = 'help-effect'; p.style.borderLeft = '3px solid ' + d.color;
        const b = document.createElement('b'); b.textContent = d.icon + ' ' + d.name + (d.good ? ' · 有利' : ' · 挑战');
        p.append(b,document.createTextNode(d.hint)); body.append(p);
      }
      const chain = document.createElement('img'); chain.src = $('chain').toDataURL(); chain.alt = '11级物品的合成顺序'; chain.style.width = '100%'; body.append(chain);
    }
    open('infoDialog');
  }
  $('helpBtn').addEventListener('click', () => help());
  document.querySelectorAll('[data-effect]').forEach(b => b.addEventListener('click', () => help(b.dataset.effect)));
})();
