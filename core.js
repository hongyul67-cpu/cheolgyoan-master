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
    R.list = shuffle(pool).slice(0, Math.min(20, pool.length));
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
    E.list = shuffle(src).slice(0, Math.min(n, src.length));
    E.ans = E.list.map(function () { return -1; });
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
    var opts = el('div', 'opts');
    q.c.forEach(function (t, idx) {
      var b = el('button', 'opt' + (E.ans[E.i] === idx ? ' sel' : ''), '<span class="n">' + (idx + 1) + '</span><span>' + esc(t) + '</span>');
      b.onclick = function () {
        E.ans[E.i] = idx;
        $$('.opt', opts).forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
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
      var un = E.ans.filter(function (a) { return a < 0; }).length;
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
        (i === E.i ? 'background:var(--rail);color:#fff;' : E.ans[i] >= 0 ? 'background:#0f2417;color:var(--acc);' : 'background:var(--panel2);color:var(--dim);');
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
      if (E.ans[i] === q.a) { correct++; byTag[t].ok++; }
      else wrongIdx.push(i + 1);
    });
    var score = Math.round(correct / E.list.length * 100);
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
        var my = E.ans[i], ok = my === q.a;
        return '<div class="wrongitem"><div class="q">' + (i + 1) + '. ' + (ok ? '⭕ ' : '❌ ') + esc(q.q) + '</div>' +
          '<div class="a">내 답: ' + (my < 0 ? '미응답' : (my + 1) + '. ' + esc(q.c[my])) +
          '<br>정답: <i>' + (q.a + 1) + '. ' + esc(q.c[q.a]) + '</i><br>' + q.why + '</div></div>';
      }).join('') + '</div>';

    host.innerHTML = html;
    // 페이지별 추가 판정(예: 실전 모의고사의 과락 판정)을 끼워 넣을 수 있는 후크
    if (typeof CG.onGraded === 'function') {
      try {
        var extra = CG.onGraded({ score: score, correct: correct, total: E.list.length, byTag: byTag, durationSec: dur });
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
      if (w.ResultCollector) {
        ResultCollector.open({
          score: score, correct: correct, total: E.list.length,
          wrong: wrongIdx, durationSec: dur
        });
      }
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
