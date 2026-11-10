/* 独立服务榜单，不使用原作者的服务器或凭据。 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let runPromise = null, pending = null, submitted = false, busy = false, generation = 0;
  const input = $('nickInput');
  input.value = localStorage.getItem('merge-effects.nickname') || '';
  input.addEventListener('input', () => localStorage.setItem('merge-effects.nickname', input.value.trim().slice(0, 12)));
  async function request(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(8000) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || '排行榜暂时无法连接');
    return body;
  }
  function startRun() {
    generation++; pending = null; submitted = false;
    runPromise = request('/api/runs', { method: 'POST', body: '{}' }).catch(() => null);
    $('submitBtn').disabled = false; $('submitBtn').hidden = false;
  }
  async function submit() {
    if (!pending || submitted || busy) return;
    const version = generation, result = { ...pending };
    busy = true; $('submitBtn').disabled = true;
    $('submitMsg').textContent = '正在保存成绩…';
    try {
      const run = await runPromise;
      if (version !== generation) return;
      if (!run) throw new Error('未连接排行榜服务，本局无法上传；个人最高分仍已保存。');
      await request('/api/scores', { method: 'POST', body: JSON.stringify({ ...result, runId: run.id, name: input.value.trim() || '玩家' }) });
      if (version !== generation) return;
      submitted = true; $('submitMsg').textContent = '成绩已保存到排行榜'; $('submitBtn').hidden = true;
    } catch (e) {
      if (version === generation) $('submitMsg').textContent = e.message;
    } finally { busy = false; $('submitBtn').disabled = false; }
  }
  async function refresh() {
    const list = $('boardList'); list.replaceChildren();
    const message = document.createElement('p'); message.className = 'empty'; message.textContent = '正在读取…'; list.append(message);
    try {
      const rows = await request('/api/scores'); list.replaceChildren();
      if (!rows.length) { message.textContent = '还没有成绩。完成第一局，留下你的名字。'; list.append(message); }
      rows.forEach((row, index) => {
        const item = document.createElement('div'); item.className = 'board-row';
        const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = String(index + 1).padStart(2, '0');
        const name = document.createElement('div'); name.textContent = row.name;
        const note = document.createElement('small'); note.textContent = '最高 ' + (row.maxTier + 1) + ' 级 · ' + new Date(row.at).toLocaleDateString('zh-CN'); name.append(note);
        const score = document.createElement('strong'); score.textContent = row.score.toLocaleString('zh-CN');
        item.append(rank, name, score); list.append(item);
      });
    } catch { message.textContent = '排行榜服务未连接。请通过“启动游戏”打开；单机合成仍可继续。'; list.replaceChildren(message); }
  }
  window.MergeBoard = { startRun, refresh, onGameOver(result) { pending = result; $('submitMsg').textContent = result.score > 0 ? '填写昵称后，点击提交成绩' : '本局尚未得分，再试一次吧'; $('submitBtn').hidden = result.score <= 0; } };
  $('submitBtn').addEventListener('click', submit);
  $('boardRefresh').addEventListener('click', refresh);
})();
