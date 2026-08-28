/* 철교안 마스터 공용 엔진 (core.js)
   각 과목 페이지는 window.DATA 를 정의한 뒤 CG.boot() 만 부르면 된다.
   DATA = {
     tool:'시트 탭 이름', title:'표시 제목', sub:'부제',
     learn:[{sec:'분류', title:'제목', body:'HTML', keys:['핵심1','핵심2']}],
     ox:[{q:'문장', a:true, why:'해설'}],
     quiz:[{q:'문제', c:['①','②','③','④'], a:0, why:'해설', tag:'분류'}],
     examN: 25,            // 시험 출제 문항 수 (없으면 전체)
     examMin: 25           // 시험 제한시간(분), 0이면 무제한
   }
*/
(function (w) {
  'use strict';

  var CG = {};
  var D = null;
  var LS = 'cgm_';

  /* ── 유틸 ── */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── 보기 순서 섞기 ────────────────────────────────────────
     같은 문제라도 사람마다 보기 차례가 달라야 «정답은 3번» 을 외우지 않는다.
     수업용 링크(?fix=…)로 들어오면 그날 시드로 우리끼리 난수를 만들어 쓰므로,
     다른 위젯이 난수를 몇 번 뽑든 학생 전원이 같은 시험지를 받는다. */
  function fixMode() { return !!(w.FixOrder && w.FixOrder.on); }
  function mixRnd(key) {
    if (!fixMode()) return Math.random;
    var h = 2166136261, k = String(key);
    for (var i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = (h * 16777619) >>> 0; }
    var a = ((w.FixOrder.seed >>> 0) ^ h) >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffledBy(a, rnd) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor((rnd || Math.random)() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var CIRC4 = ['①', '②', '③', '④'];
  var CIRCRE = /[①②③④]/, AGGREG = /모두 (옳|맞|정답|해당)|위 모두|위의 모두|정답이 없|해당 없/;
  /* 섞으면 안 되는 문항
     ① 복수정답 — 해설이 «1번 · 3번» 처럼 번호를 그대로 적어 둔다
     ② 문제·보기에 ①~④ 가 적힘 — 다른 뜻일 수 있다
     ③ «위 모두 옳다» 류 — 자리를 옮기면 말이 되지 않는다 */
  function mixQ(q, rnd) {
    var c = q.c || [];
    if (q.multi || c.length < 2 || CIRCRE.test(q.q || '')) return q;
    for (var i = 0; i < c.length; i++) if (CIRCRE.test(c[i]) || AGGREG.test(c[i])) return q;
    var ord = shuffledBy(c.map(function (_, k) { return k; }), rnd);   // ord[새자리]=옛자리
    var to = []; ord.forEach(function (old, now) { to[old] = now; });  // to[옛자리]=새자리
    var out = {}; for (var k2 in q) out[k2] = q[k2];
    out.c = ord.map(function (k3) { return c[k3]; });
    out.a = to[q.a];
    /* 해설이 «①②는 철도교통사고» 처럼 번호를 짚는 곳이 있어 함께 옮긴다 */
    out.why = String(q.why == null ? '' : q.why)
      .replace(/[①②③④]/g, function (ch) { var i2 = CIRC4.indexOf(ch); return (i2 < c.length && to[i2] != null) ? CIRC4[to[i2]] : ch; });
    return out;
  }
  function save(k, v) { try { localStorage.setItem(LS + D.key + '_' + k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) {
    try { var v = localStorage.getItem(LS + D.key + '_' + k); return v == null ? d : JSON.parse(v); }
    catch (e) { return d; }
  }
  function fx(name) { try { if (w.FX && w.FX[name]) return w.FX[name].apply(w.FX, [].slice.call(arguments, 1)); } catch (e) {} }
  function hasRC() {
    return !!((w.ResultCollector && w.ResultCollector.config && w.ResultCollector.config.endpoint) ||
      /[?&]rc=/.test(location.search));
  }
  CG.hasRC = hasRC;
  CG.rcQS = function () { var m = location.search.match(/[?&]rc=[^&]*/); return m ? '?' + m[0].slice(1) : ''; };

  /* ── 탭 ── */
  function initTabs() {
    $$('nav.tabs button').forEach(function (b) {
      // aria-pressed 는 접근성 + 수업모드(class-mode.js)가 현재 탭을 찾는 데 쓴다
      b.setAttribute('aria-pressed', b.classList.contains('on') ? 'true' : 'false');
      b.addEventListener('click', function () {
        $$('nav.tabs button').forEach(function (x) {
          x.classList.remove('on');
          x.setAttribute('aria-pressed', 'false');
        });
        $$('section.page').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        b.setAttribute('aria-pressed', 'true');
        var p = $('#' + b.dataset.tab);
        if (p) p.classList.add('on');
        w.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }
  CG.go = function (id) {
    var b = $('nav.tabs button[data-tab="' + id + '"]');
    if (b) b.click();
  };

  /* ══════════════ 1. 배우기 ══════════════ */
  var L = { sec: null, i: 0, list: [] };

  function learnSections() {
    var seen = [], out = [];
    D.learn.forEach(function (c) { if (seen.indexOf(c.sec) < 0) { seen.push(c.sec); out.push(c.sec); } });
    return out;
  }
  function renderLearn() {
    var host = $('#learnHost'); if (!host) return;
    var secs = learnSections();
    if (!L.sec) L.sec = load('lsec', secs[0]);
    if (secs.indexOf(L.sec) < 0) L.sec = secs[0];

    var pick = $('#learnPick');
    pick.innerHTML = '';
    secs.forEach(function (s) {
      var b = el('button', s === L.sec ? 'on' : '', esc(s));
      b.onclick = function () { L.sec = s; L.i = 0; save('lsec', s); renderLearn(); };
      pick.appendChild(b);
    });

    L.list = D.learn.filter(function (c) { return c.sec === L.sec; });
    if (L.i >= L.list.length) L.i = 0;
    var c = L.list[L.i];
    host.innerHTML = '';
    var card = el('div', 'card lrn');
    card.appendChild(el('div', 'idx', (L.i + 1) + ' / ' + L.list.length));
    card.appendChild(el('h3', '', esc(c.title)));
    card.appendChild(el('div', '', c.body));
    if (c.keys && c.keys.length) {
      var k = el('div', 'keys');
      k.appendChild(el('b', '', '⭐ 시험에 나오는 포인트'));
      var ul = el('ul');
      c.keys.forEach(function (t) { ul.appendChild(el('li', '', t)); });
      k.appendChild(ul);
      card.appendChild(k);
    }
    host.appendChild(card);

    var pg = el('div', 'pager');
    var prev = el('button', 'btn ghost', '◀ 이전');
    prev.disabled = L.i === 0;
    prev.onclick = function () { if (L.i > 0) { L.i--; renderLearn(); scrollTo({ top: 0, behavior: 'smooth' }); } };
    var bar = el('div', 'bar', '<i style="width:' + ((L.i + 1) / L.list.length * 100) + '%"></i>');
    var next = el('button', 'btn', L.i === L.list.length - 1 ? '완료 ✓' : '다음 ▶');
    next.onclick = function () {
      if (L.i < L.list.length - 1) { L.i++; renderLearn(); scrollTo({ top: 0, behavior: 'smooth' }); }
      else {
        var secs2 = learnSections(), n = secs2.indexOf(L.sec) + 1;
        fx('sound', 'clear');
        if (n < secs2.length) {
          fx('banner', { icon: '📗', title: L.sec + ' 완독!', sub: '다음: ' + secs2[n], btn: '이어서', onClose: function () { L.sec = secs2[n]; L.i = 0; save('lsec', L.sec); renderLearn(); scrollTo({ top: 0, behavior: 'smooth' }); } });
        } else {
          fx('banner', { icon: '🎓', title: '배우기 전 과정 완료!', sub: '이제 게임과 시험으로 굳혀보세요', btn: '확인' });
        }
      }
    };
    pg.appendChild(prev); pg.appendChild(bar); pg.appendChild(next);
    host.appendChild(pg);
  }

  /* ══════════════ 2. OX 스피드 ══════════════ */
  var O = { list: [], i: 0, ok: 0, run: false, wrong: [] };

  function oxStart() {
    O.list = shuffle(D.ox); O.i = 0; O.ok = 0; O.wrong = []; O.run = true;
    fx('reset');
    $('#oxStart').style.display = 'none';
    $('#oxPlay').style.display = 'block';
    oxDraw();
  }
  function oxDraw() {
    if (O.i >= O.list.length) return oxEnd();
    var q = O.list[O.i];
    $('#oxQ').textContent = q.q;
    $('#oxWhy').style.display = 'none';
    $('#oxProg').textContent = (O.i + 1) + ' / ' + O.list.length;
    $('#oxScore').textContent = O.ok;
    $$('#oxPlay .oxbtns button').forEach(function (b) { b.disabled = false; });
  }
  function oxAns(v) {
    if (!O.run) return;
    var q = O.list[O.i];
    var right = (v === q.a);
    $$('#oxPlay .oxbtns button').forEach(function (b) { b.disabled = true; });
    var box = $('#oxWhy');
    box.style.display = 'block';
    box.innerHTML = '<b>' + (right ? '⭕ 정답' : '❌ 오답') + '</b> — 정답은 <b>' + (q.a ? 'O' : 'X') + '</b><br>' + q.why;
    if (right) { O.ok++; fx('ok', $('#oxQ')); } else { O.wrong.push(q); fx('no', $('#oxQ')); }
    setTimeout(function () { O.i++; oxDraw(); }, right ? 900 : 2400);
  }
  function oxEnd() {
    O.run = false;
    $('#oxPlay').style.display = 'none';
    var host = $('#oxStart');
    host.style.display = 'block';
    var rate = Math.round(O.ok / O.list.length * 100);
    host.innerHTML =
      '<div class="result"><div class="muted">OX 스피드 결과</div>' +
      '<div class="big ' + (rate >= 70 ? 'pass' : 'fail') + '">' + rate + '%</div>' +
      '<div class="muted">' + O.ok + ' / ' + O.list.length + ' 정답 · 최고 콤보 ' + (w.FX ? FX.best() : 0) + '</div>' +
      '<div class="btnrow" style="justify-content:center"><button class="btn go" id="oxAgain">다시 도전</button></div></div>' +
      (O.wrong.length ? '<div class="card"><h3>❌ 틀린 문장 복습 (' + O.wrong.length + ')</h3>' +
        O.wrong.map(function (q) {
          return '<div class="wrongitem"><div class="q">' + esc(q.q) + '</div>' +
            '<div class="a">정답 <i>' + (q.a ? 'O' : 'X') + '</i> — ' + q.why + '</div></div>';
        }).join('') + '</div>' : '');
    $('#oxAgain').onclick = oxStart;
    fx('sound', 'clear');
  }

  function initOX() {
    if (!$('#oxPlay')) return;
    $('#oxPlay').querySelector('.o').onclick = function () { oxAns(true); };
    $('#oxPlay').querySelector('.x').onclick = function () { oxAns(false); };
    $('#oxGo').onclick = oxStart;
  }

  /* ══════════════ 3. 랠리(4지선다 연습) ══════════════ */
  var R = { list: [], i: 0, ok: 0, wrong: [] };

  function rallyStart(tag) {
    var pool = tag && tag !== '전체' ? D.quiz.filter(function (q) { return q.tag === tag; }) : D.quiz;
    var rrnd = mixRnd('rally|' + D.key + '|' + (tag || ''));
    R.list = shuffledBy(pool, rrnd).slice(0, Math.min(20, pool.length)).map(function (q) { return mixQ(q, rrnd); });
    R.i = 0; R.ok = 0; R.wrong = [];
    fx('reset');
    $('#rlSetup').style.display = 'none';
    $('#rlPlay').style.display = 'block';
    rallyDraw();
  }
  function rallyDraw() {
    if (R.i >= R.list.length) return rallyEnd();
    var q = R.list[R.i];
    var host = $('#rlPlay');
    host.innerHTML = '';
    var box = el('div', 'qbox');
    var head = el('div', 'qhead');
    head.appendChild(el('span', 'qtag', esc(q.tag || '')));
    head.appendChild(el('span', 'qnum', (R.i + 1) + ' / ' + R.list.length + ' · 정답 ' + R.ok));
    box.appendChild(head);
    box.appendChild(el('div', 'qtext', esc(q.q)));
    var opts = el('div', 'opts');
    var order = q._ord || (q._ord = null);
    q.c.forEach(function (t, idx) {
      var b = el('button', 'opt', '<span class="n">' + (idx + 1) + '</span><span>' + esc(t) + '</span>');
      b.onclick = function () {
        $$('.opt', opts).forEach(function (x) { x.disabled = true; });
        var right = idx === q.a;
        b.classList.add(right ? 'ok' : 'ng');
        if (!right) $$('.opt', opts)[q.a].classList.add('ok');
        if (right) { R.ok++; fx('ok', b); } else { R.wrong.push(q); fx('no', b); }
        var why = el('div', 'why', '<b>' + (right ? '정답!' : '오답') + '</b> ' + q.why);
        box.appendChild(why);
        var nx = el('div', 'btnrow');
        var nb = el('button', 'btn', R.i === R.list.length - 1 ? '결과 보기' : '다음 문제 ▶');
        nb.onclick = function () { R.i++; rallyDraw(); scrollTo({ top: 0, behavior: 'smooth' }); };
        nx.appendChild(nb);
        box.appendChild(nx);
        nb.focus();
      };
      opts.appendChild(b);
    });
    box.appendChild(opts);
    host.appendChild(box);
  }
  function rallyEnd() {
    var rate = Math.round(R.ok / R.list.length * 100);
    $('#rlPlay').innerHTML =
      '<div class="result"><div class="muted">랠리 결과</div>' +
      '<div class="big ' + (rate >= 60 ? 'pass' : 'fail') + '">' + rate + '점</div>' +
      '<div class="muted">' + R.ok + ' / ' + R.list.length + ' 정답</div></div>' +
      (R.wrong.length ? '<div class="card"><h3>❌ 오답 노트 (' + R.wrong.length + ')</h3>' +
        R.wrong.map(function (q) {
          return '<div class="wrongitem"><div class="q">' + esc(q.q) + '</div>' +
            '<div class="a">정답 <i>' + (q.a + 1) + '. ' + esc(q.c[q.a]) + '</i><br>' + q.why + '</div></div>';
        }).join('') + '</div>' : '');
    var row = el('div', 'btnrow');
    row.style.justifyContent = 'center';
    var again = el('button', 'btn go', '다시 도전');
    again.onclick = function () { $('#rlPlay').style.display = 'none'; $('#rlSetup').style.display = 'block'; };
    row.appendChild(again);
    $('#rlPlay').appendChild(row);
    fx('sound', 'clear');
  }
  function initRally() {
    if (!$('#rlSetup')) return;
    var tags = ['전체'];
    D.quiz.forEach(function (q) { if (q.tag && tags.indexOf(q.tag) < 0) tags.push(q.tag); });
    var pick = $('#rlPick');
    tags.forEach(function (t) {
      var b = el('button', '', esc(t));
      b.onclick = function () { rallyStart(t); };
      pick.appendChild(b);
    });
  }

  /* ══════════════ 4. CBT 시험 ══════════════ */
  var E = { list: [], ans: [], i: 0, t0: 0, timer: null, limit: 0, done: false };

  CG.examStart = function (n, min, pool) {
    var src = pool || D.quiz;
    n = n || src.length;
    var ernd = mixRnd('exam|' + D.key + '|' + n + '|' + src.length);
    E.list = shuffledBy(src, ernd).slice(0, Math.min(n, src.length)).map(function (q) { return mixQ(q, ernd); });
    E.ans = E.list.map(function (q) { return q.multi ? [] : -1; });
    E.i = 0; E.done = false;
    E.t0 = Date.now();
    E.limit = (min || 0) * 60;
    $('#exSetup').style.display = 'none';
    $('#exResult').style.display = 'none';
    $('#exPlay').style.display = 'block';
    if (E.timer) clearInterval(E.timer);
    if (E.limit) {
      E.timer = setInterval(function () {
        var left = E.limit - Math.floor((Date.now() - E.t0) / 1000);
        var tEl = $('#exTime');
        if (tEl) tEl.textContent = '⏱ ' + Math.floor(Math.max(0, left) / 60) + ':' + ('0' + (Math.max(0, left) % 60)).slice(-2);
        if (left <= 0) { clearInterval(E.timer); examGrade(); }
      }, 500);
    }
    examDraw();
  };
  /* 복수정답 문항 지원 — q.multi 가 true 면 q.a 는 정답 인덱스 배열이고
     E.ans[i] 도 인덱스 배열이 된다. multi 가 없는 문항은 예전 그대로 동작한다. */
  function ansArr(v) { return Array.isArray(v) ? v.slice() : (v >= 0 ? [v] : []); }
  function answered(i) { var v = E.ans[i]; return Array.isArray(v) ? v.length > 0 : v >= 0; }
  function keyArr(q) { return q.multi ? (q.a || []).slice() : [q.a]; }
  function isRight(q, v) {
    var k = keyArr(q).sort(function (x, y) { return x - y; });
    var m = ansArr(v).sort(function (x, y) { return x - y; });
    return k.length === m.length && k.every(function (x, i) { return x === m[i]; });
  }
  function fmtPick(q, v) {
    var m = ansArr(v);
    if (!m.length) return '미응답';
    return m.map(function (i) { return (i + 1) + '. ' + esc(q.c[i]); }).join('  /  ');
  }
  function fmtKey(q) {
    return keyArr(q).map(function (i) { return (i + 1) + '. ' + esc(q.c[i]); }).join('  /  ');
  }
  function examDraw() {
    var q = E.list[E.i];
    var host = $('#exPlay');
    host.innerHTML = '';
    var box = el('div', 'qbox');
    var head = el('div', 'qhead');
    head.appendChild(el('span', 'qtag', esc(q.tag || '')));
    head.appendChild(el('span', 'qnum', '<span id="exTime"></span> &nbsp; ' + (E.i + 1) + ' / ' + E.list.length));
    box.appendChild(head);
    box.appendChild(el('div', 'qtext', esc(q.q)));
    if (q.multi) box.appendChild(el('div', 'multihint', '\u203b \ubcf5\uc218\uc815\ub2f5 \ubb38\ud56d\uc785\ub2c8\ub2e4 \u2014 \uc5ec\ub7ec \uac1c\ub97c \uace0\ub97c \uc218 \uc788\uace0, \uace0\ub978 \ubcf4\uae30\ub97c \ub2e4\uc2dc \ub204\ub974\uba74 \ud574\uc81c\ub429\ub2c8\ub2e4.'));
    var opts = el('div', 'opts');
    q.c.forEach(function (t, idx) {
      var on = q.multi ? ansArr(E.ans[E.i]).indexOf(idx) >= 0 : E.ans[E.i] === idx;
      var b = el('button', 'opt' + (on ? ' sel' : ''), '<span class="n">' + (idx + 1) + '</span><span>' + esc(t) + '</span>');
      b.onclick = function () {
        if (q.multi) {
          var a = E.ans[E.i], p = a.indexOf(idx);
          if (p >= 0) { a.splice(p, 1); b.classList.remove('sel'); }
          else { a.push(idx); a.sort(function (x, y) { return x - y; }); b.classList.add('sel'); }
        } else {
          E.ans[E.i] = idx;
          $$('.opt', opts).forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
        }
        drawSheet();
      };
      opts.appendChild(b);
    });
    box.appendChild(opts);
    var row = el('div', 'btnrow');
    var pv = el('button', 'btn ghost', '◀ 이전');
    pv.disabled = E.i === 0;
    pv.onclick = function () { E.i--; examDraw(); };
    var nx = el('button', 'btn', '다음 ▶');
    nx.disabled = E.i === E.list.length - 1;
    nx.onclick = function () { E.i++; examDraw(); };
    var sb = el('button', 'btn warn', '제출하고 채점');
    sb.onclick = function () {
      var un = E.ans.filter(function (a, i) { return !answered(i); }).length;
      if (un && !confirm('아직 안 푼 문제가 ' + un + '문항 있습니다. 채점할까요?')) return;
      examGrade();
    };
    row.appendChild(pv); row.appendChild(nx); row.appendChild(sb);
    box.appendChild(row);
    host.appendChild(box);
    var sheet = el('div', 'card');
    sheet.innerHTML = '<h3>답안지</h3><div id="exSheet" style="display:flex;flex-wrap:wrap;gap:5px"></div>';
    host.appendChild(sheet);
    drawSheet();
  }
  function drawSheet() {
    var s = $('#exSheet'); if (!s) return;
    s.innerHTML = '';
    E.list.forEach(function (q, i) {
      var b = el('button', '', String(i + 1));
      b.style.cssText = 'width:34px;height:34px;border-radius:7px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;border:1px solid var(--line);' +
        (i === E.i ? 'background:var(--rail);color:#fff;' : answered(i) ? 'background:#0f2417;color:var(--acc);' : 'background:var(--panel2);color:var(--dim);');
      b.onclick = function () { E.i = i; examDraw(); scrollTo({ top: 0, behavior: 'smooth' }); };
      s.appendChild(b);
    });
  }
  function examGrade() {
    if (E.done) return;
    E.done = true;
    if (E.timer) clearInterval(E.timer);
    var dur = Math.round((Date.now() - E.t0) / 1000);
    var correct = 0, wrongIdx = [], byTag = {};
    E.list.forEach(function (q, i) {
      var t = q.tag || '기타';
      byTag[t] = byTag[t] || { n: 0, ok: 0 };
      byTag[t].n++;
      if (isRight(q, E.ans[i])) { correct++; byTag[t].ok++; }
      else wrongIdx.push(i + 1);
    });
    // 문항별 결과 — 페이지가 오답 기록 등에 쓸 수 있게 넘긴다
    var detail = E.list.map(function (q, i) {
      return { id: q._id || null, ok: isRight(q, E.ans[i]), my: E.ans[i], ans: q.a, tag: q.tag || '' };
    });
    var score = Math.round(correct / E.list.length * 100);
    if (w.RankKit) w.RankKit.award(score);   /* 랭킹전 RP 정산 */
    $('#exPlay').style.display = 'none';
    var host = $('#exResult');
    host.style.display = 'block';

    var pass = score >= 60;
    var html = '<div class="card result">' +
      '<div class="muted">' + esc(D.title) + ' 시험 결과</div>' +
      '<div class="big ' + (pass ? 'pass' : 'fail') + '">' + score + '점</div>' +
      '<div class="muted">' + correct + ' / ' + E.list.length + ' 정답 · ' + Math.floor(dur / 60) + '분 ' + (dur % 60) + '초</div>' +
      '<div class="gradebox">' +
      Object.keys(byTag).map(function (t) {
        return '<div><b>' + Math.round(byTag[t].ok / byTag[t].n * 100) + '</b><span>' + esc(t) + ' (' + byTag[t].ok + '/' + byTag[t].n + ')</span></div>';
      }).join('') + '</div>' +
      '<div class="notice" style="text-align:left"><b>합격 기준</b> — 실제 시험은 <b>과목당 40점 이상</b>이면서 <b>전 과목 평균 60점 이상</b>이어야 합격입니다. 위 과목별 점수에서 40점 미만이 있으면 과락입니다.</div>' +
      '<div class="btnrow" style="justify-content:center">' +
      '<button class="btn go" id="exAgain">새 문제로 다시</button>' +
      (hasRC() ? '<button class="btn" id="exSend">📤 선생님께 결과 제출</button>' : '') +
      '</div></div>';

    html += '<div class="card"><h3>📝 전체 해설 (오답 ' + wrongIdx.length + '문항)</h3>' +
      E.list.map(function (q, i) {
        var ok = isRight(q, E.ans[i]);
        return '<div class="wrongitem"><div class="q">' + (i + 1) + '. ' + (ok ? '⭕ ' : '❌ ') + esc(q.q) + '</div>' +
          '<div class="a">내 답: ' + fmtPick(q, E.ans[i]) +
          '<br>정답: <i>' + fmtKey(q) + '</i><br>' + q.why + '</div></div>';
      }).join('') + '</div>';

    host.innerHTML = html;
    // 페이지별 추가 판정(예: 실전 모의고사의 과락 판정)을 끼워 넣을 수 있는 후크
    if (typeof CG.onGraded === 'function') {
      try {
        var extra = CG.onGraded({ score: score, correct: correct, total: E.list.length, byTag: byTag, durationSec: dur, detail: detail });
        if (extra) {
          var box = el('div', '');
          box.innerHTML = extra;
          host.insertBefore(box, host.firstChild);
        }
      } catch (e) {}
    }
    scrollTo({ top: 0, behavior: 'smooth' });
    fx('sound', pass ? 'clear' : 'up');
    if (pass) fx('banner', { icon: '🎉', title: score + '점 — 합격선 통과!', sub: esc(D.title), stars: score >= 90 ? 3 : score >= 75 ? 2 : 1, btn: '확인' });

    $('#exAgain').onclick = function () { $('#exResult').style.display = 'none'; $('#exSetup').style.display = 'block'; };
    var sd = $('#exSend');
    if (sd) sd.onclick = function () {
      if (!w.ResultCollector) return;
      if (!(ResultCollector.config && ResultCollector.config.endpoint)) {
        alert(['이 링크로는 제출이 되지 않아요.', '',
          '선생님이 나눠 준 제출용 링크(주소 뒤에 ?rc=... 가 붙은 링크)로',
          '들어와야 반·번호를 입력하고 결과를 보낼 수 있습니다.', '',
          '연습은 지금 이대로 계속 하셔도 됩니다.'].join(String.fromCharCode(10)));
        return;
      }
      /* 어느 과목·범위였는지 mode 로, 오답은 무엇을 틀렸는지로 (규약 §1 ①②) */
      var shorten = function (t, len) {
        t = String(t == null ? '' : t).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return t.length > len ? t.slice(0, len - 1) + '\u2026' : t;
      };
      var wrongTexts = (wrongIdx || []).map(function (i) {
        var q = E.list[i];
        if (!q) return (i + 1) + '\ubc88';
        var ch = q.c || q.choices || q.opts || [];
        var my = (E.ans && E.ans[i] != null) ? ch[E.ans[i]] : null;
        var an = ch[q.a != null ? q.a : q.answer];
        return (i + 1) + '\ubc88 ' + (my ? shorten(my, 16) : '\ubb34\uc751\ub2f5') +
               '\u2192' + (an ? shorten(an, 16) : '?');
      });
      ResultCollector.open({
        score: score, correct: correct, total: E.list.length,
        mode: (D.title || '철교안') + ' — ' + (E.title || '모의고사'),
        wrong: wrongTexts, durationSec: dur,
        extra: ['철도교통안전관리자 대비 학습']
      });
    };
    var best = load('best', 0);
    if (score > best) save('best', score);
  }

  /* ══════════════ 부팅 ══════════════ */
  CG.boot = function (data) {
    D = data || w.DATA;
    w.DATA = D;
    if (!D.key) D.key = (D.tool || D.title || 'x').replace(/\s/g, '');
    initTabs();
    if ($('#learnHost')) renderLearn();
    initOX();
    initRally();
    // 허브로 돌아가는 링크에 ?rc= 유지
    $$('a.homelink').forEach(function (a) {
      if (a.getAttribute('href') && a.getAttribute('href').indexOf('?') < 0) a.href = a.getAttribute('href') + CG.rcQS();
    });
    var b = load('best', 0);
    if (b && $('#bestScore')) $('#bestScore').textContent = b + '점';
  };

  w.CG = CG;
})(window);
