/* ══════════════════════════════════════════════════════════════
   철교안 마스터 — 그림 모음 (보조09 · 2026-10-01)
   공용 그리기 도우미 links/fig.js 를 쓴다. 과목 페이지 4개(core.js 배우기)와 index.html(lesson.js 슬라이드)이 함께 부른다.

   한 칸의 모양
     키: { cap:'캡션 한 줄', cards:['배우기 카드 제목'…], draw:function(){ … } }
       cards — law/mgmt/raileng/elective.html 의 DATA.learn[].title 과 **똑같이**.
               core.js 가 그 카드 본문 아래(⭐ 포인트 위)에 그림을 붙인다.
     순서 = 한 카드에 그림이 여러 장이면 이 파일에 적힌 순서대로 나온다.

   그림 내용은 배우기 카드 본문(국가법령정보센터 원문 · 「철도의 건설기준에 관한 규정」 ·
   철도차량운전규칙 · 도시철도운전규칙 · 공단 시험안내에서 옮긴 것)에 적힌 값만 쓴다.
   카드에 없는 수치는 넣지 않았다. 예시 숫자는 캡션에 「예시」라고 적었다.
   정답 이름표(ans:true)는 슬라이드에서 빈칸 답과 겹칠 때 labels:false 로 ? 가 된다.
   ══════════════════════════════════════════════════════════════ */
var FIGS = (function () {
  var F = window.FIG;
  if (!F) return {};
  var C = F.C;
  var t = F.t, box = F.box, line = F.line, arrow = F.arrow, callout = F.callout, circle = F.circle;

  /* ── 작은 도우미 ─────────────────────────── */
  function dot(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 4) + '" fill="' + (c || C.ink) + '"/>'; }
  function rect(x, y, w, h, fill, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r || 0) + '" fill="' + fill + '"' +
      (o.c ? ' stroke="' + o.c + '" stroke-width="' + (o.w || 1.4) + '"' : '') + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') +
      (o.op != null ? ' opacity="' + o.op + '"' : '') + '/>';
  }
  /* 옆에서 본 열차 한 량 — (x,y) 왼쪽 위, 폭 w, 높이 h */
  function car(x, y, w, h, o) {
    o = o || {};
    var c = o.c || C.ink, s = '';
    s += F.path('M' + (x + 6) + ',' + y + ' H' + (x + w - 14) + ' Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + 14) +
      ' V' + (y + h) + ' H' + x + ' V' + (y + 6) + ' Q' + x + ',' + y + ' ' + (x + 6) + ',' + y + ' Z',
      { fill: o.fill || C.blueL, c: c, w: 1.6 });
    var nw = Math.max(2, Math.floor((w - 24) / 22));
    for (var i = 0; i < nw; i++) s += rect(x + 8 + i * 22, y + 7, 14, h * 0.32, '#fff', { c: c, w: 1 });
    s += dot(x + w * 0.2, y + h + 5, 5, c) + dot(x + w * 0.32, y + h + 5, 5, c) +
      dot(x + w * 0.68, y + h + 5, 5, c) + dot(x + w * 0.8, y + h + 5, 5, c);
    return s;
  }
  /* 사람 — 머리 중심 (x,y) */
  function person(x, y, o) {
    o = o || {};
    var c = o.c || C.ink, s = o.s || 1;
    return circle(x, y, 11 * s, { fill: o.fill || '#fff', c: c, w: 1.8 }) +
      F.path('M' + (x - 18 * s) + ',' + (y + 44 * s) + ' Q' + (x - 18 * s) + ',' + (y + 16 * s) + ' ' + x + ',' + (y + 16 * s) +
        ' Q' + (x + 18 * s) + ',' + (y + 16 * s) + ' ' + (x + 18 * s) + ',' + (y + 44 * s) + ' Z', { fill: o.fill || '#fff', c: c, w: 1.8 });
  }
  /* 시간줄 위의 눈금 핀 */
  function pin(x, y1, y2, c) { return line(x, y1, x, y2, { c: c || C.ink, w: 1.6 }) + dot(x, y2, 4.5, c || C.ink); }
  /* 선로(평면) — y 중심, 두 레일 간격 g */
  function railPlan(x1, x2, y, g, o) {
    o = o || {};
    var s = '', step = o.step || 16;
    for (var x = x1 + 6; x < x2 - 2; x += step) s += line(x, y - g / 2 - 5, x, y + g / 2 + 5, { c: o.tie || '#b08a63', w: 3 });
    return s + line(x1, y - g / 2, x2, y - g / 2, { c: o.c || C.ink, w: 2.2 }) + line(x1, y + g / 2, x2, y + g / 2, { c: o.c || C.ink, w: 2.2 });
  }
  function tag(x, y, w, txt, fill, c) { return box(x, y, w, 26, { fill: fill || C.grayL, c: c || C.line, w: 1.2, r: 13, label: txt, size: 13, b: 0 }); }
  /* 레일 단면 — 가운데 cx, 밑면 y, 배율 sc (높이 24·sc) */
  function railProf(cx, y, sc) {
    sc = sc || 1;
    var h = function (v) { return v * sc; };
    return F.poly([[cx - h(10), y], [cx + h(10), y], [cx + h(10), y - h(4)], [cx + h(2.5), y - h(6)], [cx + h(2.5), y - h(16)],
      [cx + h(7), y - h(17)], [cx + h(7), y - h(24)], [cx - h(7), y - h(24)], [cx - h(7), y - h(17)], [cx - h(2.5), y - h(16)],
      [cx - h(2.5), y - h(6)], [cx - h(10), y - h(4)]], { close: 1, fill: '#9ca3af', c: C.ink, w: 1.4 });
  }
  /* 도미노 5개 — rm 번째(0부터)를 빼낸 그림 */
  function dominoFig(labels, rm) {
    var base = 156, s = line(16, base, 464, base, { c: C.ink, w: 2 });
    labels.forEach(function (lb, i) {
      var cx = 56 + i * 92;
      if (i === rm) {
        s += rect(cx - 12, base - 88, 24, 88, 'none', { c: C.red, w: 1.6, dash: '5 4' });
        s += arrow(cx, base - 94, cx, 32, { c: C.red, w: 2.4 });
        s += t(cx, 20, '빼낸다', { a: 'm', b: 1, size: 14, c: C.red });
      } else {
        var r = i < rm ? 24 : 0, col = i < rm ? C.orange : C.blue;
        s += F.g(rect(-24, -88, 24, 88, i < rm ? C.orangeL : C.blueL, { c: col, w: 1.8, r: 3 }) +
          t(-12, -44, String(i + 1), { a: 'm', b: 1, size: 16, c: col, halo: false }), { x: cx + 12, y: base, r: r });
      }
      s += t(cx, base + 32, lb, { a: 'm', size: 13, b: i === rm ? 1 : 0, c: i === rm ? C.red : C.ink, ans: i === rm });
    });
    s += t(240, 222, (rm + 1) + '번째를 빼면 뒤의 도미노는 넘어지지 않는다', { a: 'm', size: 14, b: 1 });
    return F.svg(480, 238, s);
  }
  /* 재해 구성비 피라미드 — layers: 위에서부터 [수, 이름] */
  function pyramidFig(layers, note1, note2) {
    var n = layers.length, top = 16, bot = 196, h = (bot - top) / n, s = '';
    var fills = [[C.redL, C.red], [C.orangeL, C.orange], [C.yellowL, '#a16207'], [C.greenL, C.green]];
    if (n === 3) fills = [fills[0], fills[1], fills[3]];
    function hw(y) { return 200 * (y - top) / (bot - top); }
    layers.forEach(function (L, i) {
      var y1 = top + i * h, y2 = y1 + h, mid = (y1 + y2) / 2;
      s += F.poly([[240 - hw(y1), y1], [240 + hw(y1), y1], [240 + hw(y2), y2], [240 - hw(y2), y2]], { close: 1, fill: fills[i][0], c: fills[i][1], w: 1.6 });
      if (hw(mid) < 70) {
        s += t(240, mid + 6, L[0], { a: 'm', b: 1, size: 16, c: fills[i][1], halo: false });
        s += callout(240 + hw(mid) - 4, mid + 4, 240 + hw(mid) + 30, mid + 4, L[1], { size: 14, b: 1 });
      } else {
        s += t(240, mid - 9, L[0], { a: 'm', b: 1, size: 18, c: fills[i][1], halo: false });
        s += t(240, mid + 13, L[1], { a: 'm', size: 13, halo: false });
      }
    });
    s += t(240, 218, note1, { a: 'm', size: 13, b: 1 });
    if (note2) s += t(240, 240, note2, { a: 'm', size: 13, c: C.sub });
    return F.svg(480, note2 ? 256 : 234, s);
  }

  return {

  /* ═════════════════ 교통법규 — 시험 안내 ═════════════════ */
  exam_bar: { cards: ['시험 구성과 합격 기준'],
    cap: '시험 구성 — 1교시 50문항 가운데 철도안전법이 35문항',
    draw: function () {
      var s = t(20, 26, '1교시 · 교통법규 50문항 (50분)', { b: 1, size: 17 });
      s += box(20, 42, 88, 48, { fill: C.grayL, label: '교통안전법\n10', size: 14, r: 4 });
      s += box(108, 42, 308, 48, { fill: C.blueL, c: C.blue, label: '철도안전법 35', size: 18, lc: C.blue, r: 4 });
      s += box(416, 42, 44, 48, { fill: C.grayL, label: '5', size: 16, r: 4 });
      s += callout(438, 90, 414, 110, '철도산업발전기본법 5', { a: 'e', size: 13 });
      s += t(20, 144, '2교시 · 75문항 (75분, 과목당 25분)', { b: 1, size: 17 });
      s += box(20, 160, 146, 48, { fill: C.grayL, label: '교통안전관리론\n25', size: 14, r: 4 });
      s += box(167, 160, 146, 48, { fill: C.grayL, label: '철도공학\n25', size: 14, r: 4 });
      s += box(314, 160, 146, 48, { fill: C.purpleL, c: C.purple, label: '선택 1과목\n25', size: 14, r: 4 });
      s += t(240, 228, '1교시 문항당 2점 · 2교시 문항당 4점', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 246, s);
    } },

  pass_line: { cards: ['시험 구성과 합격 기준'],
    cap: '합격 — 모든 과목 40점 이상이면서 평균 60점 이상 (점수는 예시)',
    draw: function () {
      var s = line(96, 22, 126, 22, { c: C.red, w: 2, dash: '6 4' }) + t(132, 22, '과락선 40점', { size: 13, c: C.red, b: 1 });
      s += line(262, 22, 292, 22, { c: C.green, w: 2, dash: '2 4' }) + t(298, 22, '평균 기준 60점', { size: 13, c: C.green, b: 1, ans: true });
      var sub = ['법규', '관리', '공학', '선택'];
      function panel(x0, who, sc, ok, msg) {
        var p = t(x0 + 105, 50, who, { a: 'm', b: 1, size: 15 }), base = 222, k = 1.5;
        p += line(x0 + 10, base, x0 + 206, base, { c: C.ink, w: 1.6 });
        sc.forEach(function (v, i) {
          var x = x0 + 26 + i * 46, bad = v < 40;
          p += rect(x, base - v * k, 30, v * k, bad ? C.redL : C.blueL, { c: bad ? C.red : C.blue, w: 1.4 });
          p += t(x + 15, base - v * k - 11, String(v), { a: 'm', size: 13, b: 1, c: bad ? C.red : C.ink });
          p += t(x + 15, base + 14, sub[i], { a: 'm', size: 13 });
        });
        p += line(x0 + 10, base - 40 * k, x0 + 206, base - 40 * k, { c: C.red, w: 2, dash: '6 4' });
        p += line(x0 + 10, base - 60 * k, x0 + 206, base - 60 * k, { c: C.green, w: 2, dash: '2 4' });
        p += t(x0 + 105, 262, msg, { a: 'm', b: 1, size: 14, c: ok ? C.green : C.red });
        return p;
      }
      s += panel(16, '수험생 A', [72, 58, 64, 70], true, '평균 66 → 합격');
      s += panel(256, '수험생 B', [90, 85, 35, 80], false, '평균 72.5 여도 과락 → 불합격');
      s += line(240, 40, 240, 250, { c: C.grayM, w: 1.2, dash: '5 5' });
      return F.svg(480, 280, s);
    } },

  /* ═════════════════ 교통안전법 ═════════════════ */
  chkdiag: { cards: ['목적과 용어 정의', '교통수단안전점검 · 교통시설안전진단'],
    cap: '점검은 교통행정기관이 교통수단을, 진단은 교통안전진단기관이 교통시설을',
    draw: function () {
      var s = box(16, 40, 132, 60, { fill: C.blueL, c: C.blue, label: '교통행정기관', size: 15, ans: true });
      s += arrow(152, 70, 318, 70, { c: C.blue });
      s += t(235, 55, '교통수단안전점검', { a: 'm', b: 1, c: C.blue, size: 15 });
      s += t(235, 88, '주기적 · 수시', { a: 'm', size: 13, c: C.sub });
      s += car(330, 44, 130, 42, { fill: C.blueL });
      s += t(395, 112, '교통수단', { a: 'm', b: 1, size: 15 });
      s += line(16, 128, 464, 128, { c: C.edge, w: 1.4 });
      s += box(16, 148, 132, 60, { fill: C.orangeL, c: C.orange, label: '교통안전\n진단기관', size: 15, ans: true });
      s += arrow(152, 178, 318, 178, { c: C.orange });
      s += t(235, 163, '교통시설안전진단', { a: 'm', b: 1, c: C.orange, size: 15 });
      s += t(235, 196, '시·도지사에게 등록', { a: 'm', size: 13, c: C.sub });
      /* 교량 위 선로 */
      s += rect(330, 168, 130, 10, C.grayM, { c: C.ink, w: 1.4 });
      s += rect(346, 178, 14, 30, C.grayL, { c: C.ink, w: 1.4 }) + rect(430, 178, 14, 30, C.grayL, { c: C.ink, w: 1.4 });
      s += line(326, 208, 464, 208, { c: C.sub, w: 1.4 });
      s += line(330, 162, 460, 162, { c: C.ink, w: 2.2 });
      s += t(395, 226, '교통시설', { a: 'm', b: 1, size: 15 });
      return F.svg(480, 242, s);
    } },

  plan_tree: { cards: ['국가교통안전기본계획 체계'],
    cap: '교통안전계획 — 기본계획은 5년, 시행계획은 매년 · 국가 · 시·도 · 시·군·구가 각각 세운다',
    draw: function () {
      var s = box(20, 26, 440, 36, { fill: C.blueL, c: C.blue, label: '기본계획 — 5년', size: 16, lc: C.blue });
      for (var i = 0; i < 5; i++) s += box(20 + i * 89, 70, 84, 34, { fill: C.greenL, c: C.green, label: '시행계획', size: 13, b: 0 });
      s += t(240, 122, '시행계획은 해마다 세운다 (매년)', { a: 'm', size: 13, c: C.green, b: 1 });
      s += line(16, 140, 464, 140, { c: C.edge, w: 1.4 });
      var rows = [['국가', '국토교통부장관'], ['시·도', '시·도지사'], ['시·군·구', '시장·군수·구청장']];
      rows.forEach(function (r, k) {
        var y = 156 + k * 44;
        s += box(20, y, 96, 34, { fill: C.grayL, label: r[0], size: 15 });
        s += t(134, y + 17, '세우는 사람:', { size: 13, c: C.sub });
        s += t(216, y + 17, r[1], { size: 15, b: 1 });
        if (k < 2) s += arrow(68, y + 34, 68, y + 44, { head: 8, w: 1.6 });
      });
      return F.svg(480, 296, s);
    } },

  diag_when: { cards: ['교통수단안전점검 · 교통시설안전진단'],
    cap: '교통시설안전진단을 받는 때 — 설치 전 · 사용 개시 전 · 큰 사고 뒤(명령)',
    draw: function () {
      var s = t(16, 24, '교통시설안전진단은 언제?', { b: 1, size: 17 });
      s += box(20, 92, 90, 30, { fill: C.grayL, label: '계획', size: 14, r: 2 });
      s += box(110, 92, 120, 30, { fill: C.yellowL, label: '설치 공사', size: 14, r: 2 });
      s += box(230, 92, 230, 30, { fill: C.greenL, label: '사용 (운영)', size: 14, r: 2 });
      var P = [[110, '1', '설치 전', '설치자'], [230, '2', '사용 개시 전', '설치·관리자'], [370, '3', '큰 사고 뒤', '명령에 따라']];
      P.forEach(function (p) {
        s += line(p[0], 52, p[0], 92, { c: C.orange, w: 2 }) + F.num(p[0], 50, p[1], { c: C.orange });
        s += t(p[0], 146, p[2], { a: 'm', b: 1, size: 15 }) + t(p[0], 166, p[3], { a: 'm', size: 13, c: C.sub });
      });
      s += F.path('M362,70 L374,70 L366,80 L378,80 L360,92 L366,82 L356,82 Z', { fill: C.red, c: C.red, w: 1 });
      s += t(240, 198, '진단은 교통안전진단기관이 · 비용은 진단받는 자 부담', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 214, s);
    } },

  acc_flow: { cards: ['교통사고 조사와 자료 보관'],
    cap: '중대한 교통사고 뒤 — 원인조사 → 재발방지 권고 → 30일 이내 답 · 자료는 5년 보관',
    draw: function () {
      var s = box(16, 36, 150, 56, { fill: C.redL, c: C.red, label: '중대한\n교통사고', size: 15 });
      s += t(91, 110, '결함 → 사망·중상 추정', { a: 'm', size: 13 });
      s += t(91, 130, '중상 = 3주 이상 치료', { a: 'm', size: 13, c: C.red, b: 1 });
      s += arrow(168, 64, 196, 64, { head: 9 });
      s += box(198, 36, 110, 56, { fill: C.grayL, label: '원인조사', size: 15 });
      s += arrow(310, 64, 338, 64, { head: 9 });
      s += box(340, 36, 124, 56, { fill: C.blueL, c: C.blue, label: '재발방지\n권고', size: 15 });
      s += arrow(390, 94, 280, 158, { head: 9, c: C.green });
      s += arrow(420, 94, 420, 158, { head: 9, c: C.sub });
      s += t(300, 130, '30일 이내', { a: 'e', b: 1, size: 15, c: C.orange });
      s += box(196, 160, 150, 46, { fill: C.greenL, c: C.green, label: '이행계획서 제출', size: 14 });
      s += box(356, 160, 108, 46, { fill: C.grayL, label: '필요 없으면\n이유를 문서로', size: 13, b: 0 });
      s += line(16, 222, 464, 222, { c: C.edge, w: 1.2 });
      s += t(16, 242, '교통사고관련자료 — 발생한 날부터 5년 보관', { size: 15, b: 1, c: C.blue });
      return F.svg(480, 260, s);
    } },

  qual_give_take: { cards: ['교통안전관리자 자격 (제53조·제54조)'],
    cap: '교통안전관리자 자격 — 주는 사람은 국토교통부장관, 뺏는 사람은 시·도지사',
    draw: function () {
      var s = person(240, 58, { fill: C.yellowL });
      s += t(240, 132, '교통안전관리자', { a: 'm', b: 1, size: 15 });
      s += box(16, 62, 134, 50, { fill: C.blueL, c: C.blue, label: '국토교통부장관', size: 14, ans: true });
      s += arrow(152, 87, 212, 87, { c: C.blue });
      s += t(83, 132, '주는 사람', { a: 'm', b: 1, c: C.blue, size: 15 });
      s += t(83, 152, '시험 · 자격증명서 교부', { a: 'm', size: 13 });
      s += box(330, 62, 134, 50, { fill: C.redL, c: C.red, label: '시·도지사', size: 15, ans: true });
      s += arrow(328, 87, 268, 87, { c: C.red });
      s += t(397, 132, '뺏는 사람', { a: 'm', b: 1, c: C.red, size: 15 });
      s += t(397, 152, '취소 · 1년 이내 정지', { a: 'm', size: 13 });
      s += line(16, 172, 464, 172, { c: C.edge, w: 1.2 });
      s += t(240, 194, '결격 — 실형 종료 뒤 · 자격 취소 뒤 2년이 안 지나면', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 212, s);
    } },

  officer_edu: { cards: ['교통안전담당자 (제54조의2)'],
    cap: '교통안전담당자 교육 — 신규교육은 6개월 이내 1회, 보수교육은 2년마다 1회',
    draw: function () {
      var s = t(16, 24, '교통안전담당자 교육 시간줄', { b: 1, size: 17 });
      s += arrow(30, 110, 462, 110, { w: 2 });
      s += pin(44, 110, 76, C.ink) + t(44, 62, '직무 시작', { a: 'm', b: 1, size: 14 });
      s += rect(44, 96, 96, 14, C.blueL, { c: C.blue, w: 1.2 });
      s += t(92, 134, '6개월 이내', { a: 'm', b: 1, size: 14, c: C.blue });
      s += t(92, 152, '신규교육 1회', { a: 'm', size: 13 });
      [220, 320, 420].forEach(function (x, i) {
        s += pin(x, 110, 80, C.green) + t(x, 66, '보수교육', { a: 'm', size: 13, b: 1, c: C.green });
        s += t(x, 132, '+' + (2 * (i + 1)) + '년', { a: 'm', size: 13, c: C.sub });
      });
      s += t(320, 158, '시작 연도 기준 2년마다', { a: 'm', size: 13, c: C.green, b: 1 });
      s += line(16, 176, 464, 176, { c: C.edge, w: 1.2 });
      s += box(16, 188, 130, 34, { fill: C.grayL, label: '해지 · 퇴직', size: 14 });
      s += arrow(150, 205, 222, 205, { head: 9 });
      s += t(186, 192, '30일 이내', { a: 'm', size: 13, b: 1, c: C.orange });
      s += t(230, 205, '다른 담당자를 지정', { size: 14, b: 1 });
      return F.svg(480, 236, s);
    } },

  committee: { cards: ['심의기구와 그 밖의 제도'],
    cap: '계획마다 심의하는 곳이 다르다 — 철도안전 종합계획만 철도산업위원회',
    draw: function () {
      var s = t(121, 22, '계획', { a: 'm', b: 1, size: 15 }) + t(363, 22, '심의하는 곳', { a: 'm', b: 1, size: 15 });
      var R = [['국가교통안전 기본·시행계획', '국가교통위원회', 36], ['시·도 교통안전기본계획', '지방교통위원회', 84],
        ['시·군·구 교통안전기본계획', '시·군·구 교통안전\n정책심의위원회', 132]];
      R.forEach(function (r) {
        var h = r[2] === 132 ? 44 : 38;
        s += box(16, r[2], 210, h, { fill: C.grayL, label: r[0], size: 14, b: 0 });
        s += arrow(228, r[2] + h / 2, 258, r[2] + h / 2, { head: 8 });
        s += box(262, r[2], 202, h, { fill: C.blueL, c: C.blue, label: r[1], size: 14, ans: true });
      });
      s += line(16, 192, 464, 192, { c: C.red, w: 1.2, dash: '6 4' });
      s += t(16, 206, '철도안전법', { size: 13, c: C.red, b: 1 });
      s += box(16, 216, 210, 38, { fill: C.redL, c: C.red, label: '철도안전 종합계획', size: 14 });
      s += arrow(228, 235, 258, 235, { head: 8, c: C.red });
      s += box(262, 216, 202, 38, { fill: C.redL, c: C.red, label: '철도산업위원회', size: 15, lc: C.red, ans: true });
      return F.svg(480, 268, s);
    } },

  tsa_penalty: { cards: ['운행기록장치·교통문화지수·벌칙'],
    cap: '교통안전법 벌칙 — 징역·벌금(형벌)이 가장 무겁고, 과태료는 1천만원 · 500만원',
    draw: function () {
      var s = t(16, 24, '교통안전법 벌칙 사다리', { b: 1, size: 17 });
      var R = [[300, '2년 이하 징역 · 2천만원 이하 벌금', '미등록 진단 · 명의대여 · 비밀누설', C.redL, C.red],
        [150, '1천만원 이하 과태료', '운행기록장치 미장착·조작 · 사고 후 진단 안 함', C.orangeL, C.orange],
        [75, '500만원 이하 과태료', '관리규정 미제출 · 담당자 미지정 · 자료 미보관', C.yellowL, '#a16207']];
      R.forEach(function (r, k) {
        var y = 44 + k * 66;
        s += rect(16, y, r[0], 30, r[3], { c: r[4], w: 1.6, r: 4 });
        if (k === 0) s += t(26, y + 15, r[1], { size: 14, b: 1, c: r[4] });
        else s += t(26 + r[0], y + 15, r[1], { size: 14, b: 1, c: r[4], ans: k === 2 });
        s += t(20, y + 46, r[2], { size: 13, c: C.sub });
      });
      s += t(464, 59, '형벌', { a: 'e', size: 13, b: 1, c: C.red });
      s += t(464, 125, '과태료', { a: 'e', size: 13, b: 1, c: C.orange });
      s += t(464, 191, '과태료', { a: 'e', size: 13, b: 1, c: '#a16207' });
      return F.svg(480, 250, s);
    } },

  /* ═════════════════ 철도안전법 ═════════════════ */
  acc_tree: { cards: ['철도사고 · 준사고 · 운행장애'],
    cap: '철도사고 · 철도준사고 · 운행장애 — 사고가 났나, 날 뻔했나, 운행에 지장만 줬나',
    draw: function () {
      var s = arrow(440, 20, 40, 20, { c: C.sub, w: 1.4, head: 9 }) + t(240, 20, '무거운 쪽', { a: 'm', size: 13, c: C.sub, hw: 8 });
      var col = [[12, '철도사고', C.redL, C.red], [166, '철도준사고', C.orangeL, C.orange], [320, '운행장애', C.yellowL, '#a16207']];
      col.forEach(function (c) { s += box(c[0], 36, 148, 40, { fill: c[2], c: c[3], label: c[1], size: 16, lc: c[3] }); });
      s += t(86, 100, '철도교통사고', { a: 'm', b: 1, size: 14 }) + t(86, 120, '충돌 · 탈선 · 열차화재', { a: 'm', size: 13 });
      s += t(86, 150, '철도안전사고', { a: 'm', b: 1, size: 14 }) + t(86, 170, '철도화재 · 시설파손', { a: 'm', size: 13 });
      s += t(240, 100, '사고가 날 뻔한 것', { a: 'm', b: 1, size: 14 });
      s += t(240, 124, '정지신호 무단 통과', { a: 'm', size: 13, ans: true });
      s += t(240, 146, '레일 파손', { a: 'm', size: 13 }) + t(240, 168, '위험물 누출', { a: 'm', size: 13 });
      s += t(394, 100, '정차역 무단 통과', { a: 'm', b: 1, size: 14, ans: true });
      s += t(394, 120, '(관제 사전승인 없이)', { a: 'm', size: 13, c: C.sub });
      s += t(394, 150, '운행 지연', { a: 'm', b: 1, size: 14 }) + t(394, 170, '20 · 30 · 60분 이상', { a: 'm', size: 13 });
      s += line(163, 90, 163, 180, { c: C.edge, w: 1.2 }) + line(317, 90, 317, 180, { c: C.edge, w: 1.2 });
      s += rect(12, 192, 456, 34, C.redL, { r: 8 });
      s += t(240, 209, '함정 — 사전승인 없는 정차역 통과는 사고가 아니라 운행장애', { a: 'm', size: 14, b: 1, c: C.red, halo: false });
      return F.svg(480, 240, s);
    } },

  delay_bar: { cards: ['철도사고 · 준사고 · 운행장애'],
    cap: '운행장애가 되는 지연 — 고속·전동열차 20분 · 일반여객열차 30분 · 화물·기타열차 60분 이상',
    draw: function () {
      var s = t(16, 24, '열차 종류별 지연 기준', { b: 1, size: 17 });
      var x0 = 150, k = 5;
      var R = [['고속·전동열차', 20, C.red], ['일반여객열차', 30, C.orange], ['화물·기타열차', 60, C.blue]];
      R.forEach(function (r, i) {
        var y = 44 + i * 44;
        s += t(16, y + 15, r[0], { size: 15, b: 1 });
        s += rect(x0, y, r[1] * k, 30, r[2] === C.red ? C.redL : (r[2] === C.orange ? C.orangeL : C.blueL), { c: r[2], w: 1.6, r: 4 });
        s += t(x0 + r[1] * k - 8, y + 15, r[1] + '분 이상', { a: 'e', size: 15, b: 1, c: r[2], ans: true });
      });
      s += line(x0, 184, x0 + 300, 184, { w: 1.4 });
      for (var m = 0; m <= 60; m += 10) {
        s += line(x0 + m * k, 180, x0 + m * k, 188, { w: 1.2 });
        s += t(x0 + m * k, 202, m + (m === 60 ? '분' : ''), { a: 'm', size: 13, c: C.sub });
      }
      return F.svg(480, 216, s);
    } },

  sms_cycle: { cards: ['종합계획과 안전관리체계'],
    cap: '안전관리체계 — 승인받고, 해마다 검사받고, 지적받으면 14일 안에 고칠 계획을 낸다',
    draw: function () {
      var s = box(15, 40, 150, 56, { fill: C.blueL, c: C.blue, label: '승인\n국토교통부장관', size: 14 });
      s += box(315, 40, 150, 56, { fill: C.greenL, c: C.green, label: '정기검사\n1년마다 1회', size: 14 });
      s += box(315, 162, 150, 56, { fill: C.orangeL, c: C.orange, label: '시정조치명령', size: 15 });
      s += box(15, 162, 150, 56, { fill: C.grayL, label: '시정조치계획서\n14일 이내 제출', size: 14 });
      s += arrow(167, 68, 313, 68, { c: C.ink });
      s += t(240, 54, '7일 전 검사계획 통보', { a: 'm', size: 13, b: 1 });
      s += arrow(390, 98, 390, 160, { c: C.ink });
      s += t(382, 129, '문제 발견', { a: 'e', size: 13 });
      s += arrow(313, 190, 167, 190, { c: C.ink });
      s += arrow(90, 160, 90, 98, { c: C.ink });
      s += t(98, 129, '고쳐서 유지', { size: 13 });
      s += t(240, 240, '수시검사 — 사고·운행장애가 났거나 우려될 때', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 256, s);
    } },

  year_cal: { cards: ['종합계획과 안전관리체계', '안전투자 공시·수준평가·보칙'],
    cap: '철도안전 한 해 달력 — 2월 말 전년도 실적 · 3월 말 수준평가 · 10월 말 다음 연도 시행계획',
    draw: function () {
      var x0 = 16, w = 448 / 12, s = '';
      for (var m = 0; m < 12; m++) s += box(x0 + m * w, 80, w, 32, { fill: m % 2 ? '#fff' : C.grayL, c: C.line, w: 1, r: 0, label: (m + 1) + '월', size: 13, b: 0 });
      var feb = x0 + 2 * w, mar = x0 + 3 * w, oct = x0 + 10 * w;
      s += pin(feb, 80, 58, C.blue) + t(feb, 26, '2월 말', { a: 'm', b: 1, size: 15, c: C.blue }) + t(feb, 44, '전년도 실적 제출', { a: 'm', size: 13 });
      s += pin(mar, 112, 136, C.orange) + t(mar, 154, '3월 말', { a: 'm', b: 1, size: 15, c: C.orange }) + t(mar, 172, '안전관리 수준평가', { a: 'm', size: 13 });
      s += pin(oct, 80, 58, C.green) + t(oct - 8, 26, '10월 말', { a: 'm', b: 1, size: 15, c: C.green }) + t(oct - 8, 44, '다음 연도 시행계획 제출', { a: 'm', size: 13 });
      s += t(464, 198, '안전투자 예산 규모 — 매년 공시', { a: 'e', size: 13, c: C.sub });
      return F.svg(480, 214, s);
    } },

  license_flow: { cards: ['운전면허 ① 종류·결격·검사', '운전면허 ② 시험·갱신·취소'],
    cap: '철도차량 운전면허를 받는 순서 — 검사 두 가지 합격 → 교육훈련 → 필기 → 기능',
    draw: function () {
      var s = '';
      var L = ['신체\n검사', '운전적성\n검사', '운전교육\n훈련', '필기\n시험', '기능\n시험', '운전\n면허'];
      var fills = [C.grayL, C.grayL, C.greenL, C.blueL, C.blueL, C.yellowL];
      L.forEach(function (l, i) {
        var x = 12 + i * 78;
        s += box(x, 56, 66, 50, { fill: fills[i], label: l, size: 14 });
        if (i < 5) s += arrow(x + 67, 81, x + 77, 81, { head: 7, w: 1.6 });
      });
      s += F.path('M12,52 V46 H156 V52', { c: C.sub, w: 1.2 }) + t(84, 32, '먼저 합격', { a: 'm', size: 13, c: C.sub });
      s += t(123, 128, '불합격 → 3개월', { a: 'm', size: 13, c: C.red, b: 1 });
      s += t(123, 146, '부정행위 → 1년', { a: 'm', size: 13, c: C.red, b: 1, ans: true });
      s += t(279, 128, '합격 효력 2년', { a: 'm', size: 13, b: 1 });
      s += t(279, 146, '(그해 12월 31일까지)', { a: 'm', size: 13, c: C.sub });
      s += t(468, 128, '국토교통부장관', { a: 'e', size: 13, b: 1 });
      s += t(357, 180, '필기 합격자만', { a: 'm', size: 13 });
      s += line(357, 108, 357, 166, { c: C.line, w: 1, dash: '3 3' });
      s += t(12, 180, '19세 미만은 결격', { size: 13, c: C.red, b: 1 });
      return F.svg(480, 198, s);
    } },

  renew_timeline: { cards: ['운전면허 ② 시험·갱신·취소'],
    cap: '운전면허 갱신 — 10년 유효, 안 하면 다음 날부터 정지, 6개월 지나면 효력 상실',
    draw: function () {
      var s = t(16, 24, '갱신하지 않으면?', { b: 1, size: 17 });
      s += box(20, 70, 220, 32, { fill: C.greenL, c: C.green, label: '유효기간 10년', size: 15, r: 2, ans: true });
      s += box(240, 70, 90, 32, { fill: C.orangeL, c: C.orange, label: '효력 정지', size: 14, r: 2 });
      s += box(330, 70, 130, 32, { fill: C.grayL, label: '실효 뒤 3년', size: 14, r: 2 });
      s += t(285, 56, '6개월', { a: 'm', b: 1, size: 15, c: C.orange, ans: true });
      s += t(395, 56, '다시 따면 일부 면제', { a: 'm', size: 13 });
      s += pin(20, 102, 118) + t(20, 136, '취득 · 갱신', { size: 13 });
      s += pin(240, 102, 118, C.orange) + t(240, 136, '만료일', { a: 'm', size: 14, b: 1 });
      s += t(240, 154, '다음 날부터 정지', { a: 'm', size: 13, c: C.orange });
      s += pin(330, 102, 118, C.red) + t(342, 136, '효력 상실', { size: 14, b: 1, c: C.red });
      s += t(240, 188, '갱신 요건 — 운전업무 경력 + 교육훈련 이수', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 204, s);
    } },

  checkup_cycle: { cards: ['관제자격증명과 철도종사자 관리'],
    cap: '정기 신체검사는 2년마다, 적성검사는 10년마다(50세 이상 5년) — 최초 검사는 업무 전',
    draw: function () {
      var x0 = 130, k = 16.5, s = '';
      var R = [['신체검사', 2, C.blue, '2년마다'], ['적성검사', 10, C.green, '10년마다'], ['적성검사\n(50세 이상)', 5, C.orange, '5년마다']];
      R.forEach(function (r, i) {
        var y = 44 + i * 50;
        s += t(14, y, r[0], { size: 14, b: 1 });
        s += line(x0, y, x0 + 20 * k, y, { c: C.grayM, w: 1.4 });
        for (var yr = 0; yr <= 20; yr += r[1]) s += circle(x0 + yr * k, y, 7, { fill: r[2], c: r[2], w: 1 });
        s += t(x0 + 20 * k + 12, y - 16, r[3], { a: 'e', size: 13, b: 1, c: r[2] });
      });
      s += line(x0, 184, x0 + 20 * k, 184, { w: 1.4 });
      for (var y = 0; y <= 20; y += 5) s += line(x0 + y * k, 180, x0 + y * k, 188, { w: 1.2 }) + t(x0 + y * k, 202, y + '년', { a: 'm', size: 13, c: C.sub });
      s += t(x0, 222, '↑ 업무 수행 전 (최초)', { size: 13, c: C.sub });
      return F.svg(480, 236, s);
    } },

  rolling_life: { cards: ['철도차량 형식승인부터 정밀안전진단까지'],
    cap: '철도차량이 거치는 승인·검사 — 설계에서 노후까지',
    draw: function () {
      var s = t(16, 22, '설계 → 제작 → 판매 → 운행 → 개조 → 노후', { b: 1, size: 15 });
      s += railPlan(16, 464, 110, 10, { step: 14 });
      var X = [40, 118, 196, 274, 352, 430];
      var N = [['형식승인', '설계', 1], ['제작자승인', '품질관리체계', 0], ['완성검사', '판매 전', 1],
        ['운행', '이력 관리', 0], ['개조승인', '개조할 때', 1], ['정밀안전진단', '노후 차량', 0]];
      X.forEach(function (x, i) {
        var up = N[i][2], col = i === 2 ? C.orange : C.blue;
        s += circle(x, 110, 11, { fill: '#fff', c: col, w: 3 });
        if (up) s += t(x, 58, N[i][0], { a: 'm', b: 1, size: 15, c: col }) + t(x, 78, N[i][1], { a: 'm', size: 13, c: C.sub, ans: i === 2 });
        else s += t(x, 144, N[i][0], { a: 'm', b: 1, size: 15, c: col }) + t(x, 164, N[i][1], { a: 'm', size: 13, c: C.sub });
      });
      s += t(240, 196, '정밀안전진단의 기산점 = 완성검사증명서 발급일', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 212, s);
    } },

  alcohol: { cards: ['운행안전 — 관제·영상기록·음주', '금액·수치 총정리'],
    cap: '음주 기준 — 운전·관제·여객승무원은 0.02% 이상, 작업책임자 등은 0.03% 이상이면 업무 금지',
    draw: function () {
      var x0 = 170, k = 7000, s = t(16, 24, '혈중알코올농도 기준', { b: 1, size: 17 }) + t(464, 24, '약물은 양성이면 금지', { a: 'e', size: 13, c: C.sub });
      function row(y, who, th) {
        var xt = x0 + th * k;
        var r = t(16, y + 17, who, { size: 13, b: 1 });
        r += rect(x0, y, xt - x0, 34, C.greenL, { c: C.green, w: 1.2 });
        r += rect(xt, y, 462 - xt, 34, C.redL, { c: C.red, w: 1.2 });
        r += t((xt + 462) / 2, y + 17, '업무 금지', { a: 'm', b: 1, size: 13, c: C.red });
        r += line(xt, y - 8, xt, y + 42, { c: C.red, w: 2.4 });
        r += t(xt, y - 16, th.toFixed(2) + '%', { a: 'm', b: 1, size: 15, c: C.red, ans: true });
        return r;
      }
      s += row(64, '운전업무 · 관제업무\n· 여객승무원', 0.02);
      s += row(140, '작업책임자 · 운행안전\n관리자 · 신호 취급 등', 0.03);
      s += line(x0, 196, 450, 196, { w: 1.4 });
      for (var v = 0; v <= 4; v++) s += line(x0 + v * 70, 192, x0 + v * 70, 200, { w: 1.2 }) + t(x0 + v * 70, 214, '0.0' + v, { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 228, s);
    } },

  protect_zone: { cards: ['철도 보호 — 위해물품·위험물·보호지구', '금지행위와 사고 보고', '금액·수치 총정리'],
    cap: '철도보호지구는 철도경계선에서 30m(노면전차 10m) · 궤도 중심 양쪽 3m 안에는 지장물을 두지 않는다 (비율은 개략)',
    draw: function () {
      var s = rect(16, 44, 448, 58, C.orangeL) + rect(16, 158, 448, 58, C.orangeL);
      s += railPlan(16, 464, 116, 8, { step: 18 }) + railPlan(16, 464, 144, 8, { step: 18 });
      s += line(16, 102, 464, 102, { c: C.orange, w: 1.8, dash: '8 5' }) + line(16, 158, 464, 158, { c: C.orange, w: 1.8, dash: '8 5' });
      s += t(24, 30, '철도경계선 = 가장 바깥쪽 궤도의 끝선', { size: 13, c: C.orange, b: 1 });
      s += t(200, 66, '철도보호지구', { a: 'm', b: 1, size: 16, c: C.orange });
      s += t(200, 88, '굴착 · 건축 · 나무 심기 등은 신고', { a: 'm', size: 13 });
      s += F.dim(430, 44, 430, 102, '30m', { size: 15, ans: true });
      s += F.dim(430, 158, 430, 216, '30m', { size: 15, ans: true });
      s += t(200, 190, '노면전차는 10m (그 바깥 20m 도 굴착 등 신고)', { a: 'm', size: 13 });
      /* 궤도 중심 3m */
      s += line(16, 236, 464, 236, { c: C.edge, w: 1.2 });
      s += rect(60, 250, 300, 60, C.redL, { c: C.red, w: 1.4, dash: '6 4' });
      s += railPlan(60, 360, 280, 12, { step: 18 });
      s += line(60, 280, 360, 280, { dash: 'center', c: C.sub, w: 1.2 });
      s += F.dim(380, 250, 380, 280, '3m', { size: 14, side: -1 }) + F.dim(380, 280, 380, 310, '3m', { size: 14, side: -1 });
      s += t(412, 262, '궤도 중심', { size: 13, c: C.sub }) + t(412, 280, '양쪽', { size: 13, c: C.sub });
      s += t(210, 326, '이 안에 지장물 방치 금지', { a: 'm', size: 14, b: 1, c: C.red });
      return F.svg(480, 342, s);
    } },

  rail_penalty: { cards: ['철도안전 전문인력과 벌칙', '금액·수치 총정리'],
    cap: '철도안전법 벌칙 사다리 — 위로 갈수록 무겁다',
    draw: function () {
      var s = arrow(20, 262, 20, 40, { c: C.red, w: 2 }) + t(28, 30, '무겁다', { size: 13, b: 1, c: C.red });
      s += t(126, 30, '징역 · 벌금', { a: 'm', b: 1, size: 14 }) + t(230, 30, '대표 행위', { b: 1, size: 14 });
      var R = [['사형·무기·7년 이상', '방화·탈선·충돌로 사망', C.redL, C.red],
        ['무기 또는 5년 이상', '운행 중 방화·탈선·충돌·파괴', C.redL, C.red],
        ['10년 이하 · 1억 이하', '시설·차량 파손으로 운행 위험', C.orangeL, C.orange],
        ['5년 이하 · 5천만 이하', '폭행·협박으로 직무 방해', C.orangeL, C.orange],
        ['3년 이하 · 3천만 이하', '음주·약물 업무 · 미승인 운영', C.yellowL, '#a16207'],
        ['2년 이하 · 2천만 이하', '음주 확인 거부 · 위해물품 휴대', C.yellowL, '#a16207'],
        ['1년 이하 · 1천만 이하', '무면허 운전 · 관제 지시 불이행', C.grayL, C.sub]];
      R.forEach(function (r, i) {
        var y = 44 + i * 32;
        s += box(36, y, 180, 26, { fill: r[2], c: r[3], w: 1.2, r: 4, label: r[0], size: 13, lc: r[3] });
        s += t(230, y + 13, r[1], { size: 13 });
      });
      return F.svg(480, 280, s);
    } },

  /* ═════════════════ 철도산업발전기본법 ═════════════════ */
  reform: { cards: ['구조개혁 — 시설과 운영의 분리'],
    cap: '구조개혁 — 철도시설은 국가가 소유(국가철도공단), 철도운영은 국가 외의 자가(한국철도공사)',
    draw: function () {
      var s = box(150, 14, 180, 44, { fill: C.grayL, label: '관리청\n국토교통부장관', size: 14 });
      s += box(16, 84, 200, 36, { fill: C.blueL, c: C.blue, label: '철도시설', size: 16, lc: C.blue });
      s += box(264, 84, 200, 36, { fill: C.greenL, c: C.green, label: '철도운영', size: 16, lc: C.green });
      s += F.route([[190, 58], [190, 70], [116, 70], [116, 82]], { c: C.sub, w: 1.4, head: 8, dash: '5 4' });
      s += t(120, 64, '건설·관리 대행', { a: 'e', size: 13, c: C.sub });
      s += t(116, 140, '국가가 소유', { a: 'm', size: 14, b: 1 });
      s += t(364, 140, '국가 외의 자 · 시장경제원리', { a: 'm', size: 14, b: 1 });
      s += box(36, 156, 160, 38, { fill: '#fff', c: C.blue, label: '국가철도공단', size: 15, ans: true });
      s += box(284, 156, 160, 38, { fill: '#fff', c: C.green, label: '한국철도공사', size: 15, ans: true });
      s += railPlan(40, 192, 226, 10, { step: 14 });
      s += car(300, 206, 130, 30, { fill: C.greenL });
      s += arrow(282, 176, 200, 176, { c: C.orange });
      s += t(240, 204, '사용료', { a: 'm', size: 13, b: 1, c: C.orange });
      return F.svg(480, 256, s);
    } },

  pso: { cards: ['공익서비스비용·노선폐지·비상사태'],
    cap: '공익서비스비용 — 원인제공자가 부담하고, 철도운영자와 보상계약을 맺는다',
    draw: function () {
      var s = box(16, 34, 150, 62, { fill: C.orangeL, c: C.orange, label: '원인제공자\n(국가 · 요구한 자)', size: 14 });
      s += box(314, 34, 150, 62, { fill: C.greenL, c: C.green, label: '철도운영자', size: 16 });
      s += arrow(168, 52, 312, 52, { c: C.orange }) + t(240, 40, '비용 부담 (보상)', { a: 'm', size: 13, b: 1, c: C.orange });
      s += arrow(312, 80, 168, 80, { c: C.green }) + t(240, 94, '공익서비스 제공', { a: 'm', size: 13, b: 1, c: C.green });
      s += F.path('M212,112 H258 L270,124 V168 H212 Z', { fill: '#fff', c: C.ink, w: 1.6 });
      s += line(220, 132, 260, 132, { c: C.sub, w: 1.2 }) + line(220, 142, 260, 142, { c: C.sub, w: 1.2 }) + line(220, 152, 248, 152, { c: C.sub, w: 1.2 });
      s += t(282, 134, '보상계약', { b: 1, size: 15 }) + t(282, 154, '안 맞으면 위원회 조정', { size: 13, c: C.sub });
      s += line(16, 184, 464, 184, { c: C.edge, w: 1.2 });
      s += t(16, 202, '부담하는 비용 3가지', { size: 13, b: 1 });
      s += tag(16, 214, 136, '운임·요금 감면액') + tag(160, 214, 150, '벽지 노선 경영손실') + tag(318, 214, 146, '국가 특수목적사업');
      return F.svg(480, 254, s);
    } },

  /* ═════════════════ 숫자 총정리 ═════════════════ */
  period_short: { cards: ['기간·주기 총정리'],
    cap: '기간 총정리 ① — 3일부터 30일까지 짧은 기한',
    draw: function () {
      var x = function (d) { return 30 + d * 14; }, s = arrow(24, 100, 466, 100, { w: 2 });
      var A = [[3, '3일 이상', '영상기록 보관', 1, C.purple], [7, '7일 전', '정기검사 통보\n출입검사 통지', 0, C.blue],
        [14, '14일', '시정조치\n계획서', 0, C.orange], [15, '15일', '면허증 반납', 1, C.red],
        [20, '20일', '과징금 납부', 0, C.green], [30, '30일', '담당자 재지정\n재발방지 이행계획서', 1, C.ink]];
      A.forEach(function (a) {
        var X = x(a[0]), up = a[3], anc = a[0] === 30 ? 'e' : 'm', tx = a[0] === 30 ? 462 : X;
        s += circle(X, 100, 6, { fill: a[4], c: a[4], w: 1 });
        if (up) s += line(X, 94, X, 70, { c: a[4], w: 1.2 }) + t(tx, 24, a[1], { a: anc, b: 1, size: 15, c: a[4] }) + t(tx, 54, a[2], { a: anc, size: 13 });
        else s += line(X, 106, X, 124, { c: a[4], w: 1.2 }) + t(tx, 140, a[1], { a: anc, b: 1, size: 15, c: a[4] }) + t(tx, 168, a[2], { a: anc, size: 13 });
      });
      return F.svg(480, 200, s);
    } },

  period_long: { cards: ['기간·주기 총정리'],
    cap: '기간 총정리 ② — 3개월부터 10년까지 (막대 길이는 개략)',
    draw: function () {
      var s = '';
      var R = [['3개월', 34, '적성검사 불합격 → 재검사 제한'], ['6개월', 54, '면허 정지 뒤 갱신 유예 · 신규교육'],
        ['1년', 76, '안전관리체계 정기검사 · 효력정지 상한'], ['2년', 100, '신체검사 · 결격 기간 · 보수교육'],
        ['5년', 130, '모든 기본계획 · 사고자료 보관'], ['10년', 160, '운전면허 · 적성검사']];
      var col = [C.sub, C.sub, C.green, C.blue, C.orange, C.purple];
      R.forEach(function (r, i) {
        var y = 20 + i * 38;
        s += t(16, y + 14, r[0], { b: 1, size: 15, c: col[i] });
        s += rect(72, y, r[1], 28, '#fff', { c: col[i], w: 1.6, r: 4 }) + rect(72, y, r[1], 28, col[i], { r: 4, op: 0.18 });
        s += t(82 + r[1], y + 14, r[2], { size: 13 });
      });
      return F.svg(480, 254, s);
    } },

  /* ═════════════════ 교통안전관리론 ═════════════════ */
  hazard_chain: { cards: ['안전·재해·사고의 개념'],
    cap: '위험이 재해가 되기까지 — 손실 없이 지나가면 아차사고(철도준사고), 손실이 나면 사고 → 재해',
    draw: function () {
      var s = box(16, 86, 112, 58, { fill: C.orangeL, c: C.orange, label: '위험\n(Hazard)', size: 15 });
      s += t(72, 160, '잠재적 요인', { a: 'm', size: 13, c: C.sub });
      s += arrow(130, 104, 176, 66, { c: C.sub }) + arrow(130, 126, 176, 164, { c: C.red });
      s += box(178, 36, 124, 56, { fill: C.grayL, label: '아차사고', size: 16 });
      s += t(240, 108, '손실 없음', { a: 'm', size: 13, c: C.sub });
      s += t(310, 56, '= 철도준사고', { size: 14, b: 1, c: C.blue });
      s += box(178, 140, 124, 56, { fill: C.redL, c: C.red, label: '사고', size: 16, lc: C.red });
      s += t(240, 212, '손실을 수반', { a: 'm', size: 13, c: C.red });
      s += arrow(304, 168, 340, 168, { c: C.red });
      s += box(342, 140, 122, 56, { fill: C.redL, c: C.red, label: '재해', size: 16, lc: C.red });
      s += t(403, 212, '인적·물적 피해', { a: 'm', size: 13, c: C.red });
      s += t(16, 24, '위험도(Risk) = 가능성 × 심각도', { size: 14, b: 1 });
      return F.svg(480, 230, s);
    } },

  m4: { cards: ['안전·재해·사고의 개념'],
    cap: '사고 원인을 보는 4M(인간·기계·매체·관리)과 대책 3E(기술·교육·규제)',
    draw: function () {
      var s = circle(240, 104, 40, { fill: C.redL, c: C.red, w: 2, label: '사고', size: 17, lc: C.red });
      var M = [[24, 34, 'Man\n인간'], [336, 34, 'Machine\n기계·설비'], [24, 126, 'Media\n작업환경·매체'], [336, 126, 'Management\n관리']];
      M.forEach(function (m) {
        s += box(m[0], m[1], 120, 48, { fill: C.blueL, c: C.blue, label: m[2], size: 14 });
        var cx = m[0] + 60, cy = m[1] + 24;
        s += line(cx < 240 ? 146 : 334, cy, cx < 240 ? 204 : 276, cy < 104 ? 88 : 120, { c: C.blue, w: 1.4 });
      });
      s += t(240, 20, '4M — 원인을 보는 네 축', { a: 'm', size: 14, b: 1, c: C.blue });
      s += line(16, 196, 464, 196, { c: C.edge, w: 1.2 });
      s += t(16, 216, '3E 대책', { size: 14, b: 1, c: C.green });
      s += tag(86, 204, 124, 'Engineering 기술', C.greenL, C.green) + tag(216, 204, 120, 'Education 교육', C.greenL, C.green) +
        tag(342, 204, 122, 'Enforcement 규제', C.greenL, C.green);
      s += t(148, 246, '↑ 가장 근본적', { a: 'm', size: 13, c: C.green });
      return F.svg(480, 262, s);
    } },

  prevent5: { cards: ['안전관리의 기본원리와 순서'],
    cap: '하인리히의 사고예방 5단계 — 조직 → 사실의 발견 → 분석·평가 → 시정방법 선정 → 시정책 적용',
    draw: function () {
      var L = ['안전\n조직', '사실의\n발견', '분석·\n평가', '시정방법\n선정', '시정책\n적용'], s = '';
      L.forEach(function (l, i) {
        var x = 16 + i * 90, y = 166 - i * 32, h = 236 - y;
        s += rect(x, y, 88, h, i === 4 ? C.greenL : C.blueL, { c: i === 4 ? C.green : C.blue, w: 1.6 });
        s += F.num(x + 16, y + 16, String(i + 1), { c: i === 4 ? C.green : C.blue });
        s += t(x + 44, y + 44, l, { a: 'm', size: 14, b: 1, halo: false });
      });
      s += t(16, 24, '아래에서 위로 한 단계씩', { size: 14, b: 1 });
      s += t(422, 24, '3E 적용', { a: 'm', size: 13, c: C.green, b: 1 });
      return F.svg(480, 250, s);
    } },

  pdca: { cards: ['안전관리의 기본원리와 순서'],
    cap: 'PDCA — 계획 · 실시 · 확인 · 조치를 되풀이하며 수준을 올린다',
    draw: function () {
      var s = box(120, 24, 110, 54, { fill: C.blueL, c: C.blue, label: 'Plan\n계획', size: 15 });
      s += box(250, 24, 110, 54, { fill: C.greenL, c: C.green, label: 'Do\n실시', size: 15 });
      s += box(250, 120, 110, 54, { fill: C.orangeL, c: C.orange, label: 'Check\n확인', size: 15 });
      s += box(120, 120, 110, 54, { fill: C.purpleL, c: C.purple, label: 'Action\n조치', size: 15 });
      s += arrow(232, 51, 248, 51, { head: 9 }) + arrow(305, 80, 305, 118, { head: 9 }) +
        arrow(248, 147, 232, 147, { head: 9 }) + arrow(175, 118, 175, 80, { head: 9 });
      s += t(240, 200, '철도 안전관리체계: 승인 → 유지 → 검사 → 시정조치', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 216, s);
    } },

  domino: { cards: ['하인리히 — 도미노 이론과 1:29:300'],
    cap: '하인리히 도미노 — 3번째(불안전한 행동·상태)를 빼면 사고·재해로 이어지지 않는다',
    draw: function () { return dominoFig(['유전·\n사회 환경', '개인적\n결함', '불안전한\n행동·상태', '사고', '재해\n(상해)'], 2); } },

  pyramid: { cards: ['하인리히 — 도미노 이론과 1:29:300'],
    cap: '하인리히 1 : 29 : 300 — 중상 1건 뒤에는 경상 29건, 아차사고 300건이 있다',
    draw: function () {
      return pyramidFig([['1', '중상·사망'], ['29', '경상'], ['300', '무상해 (아차사고)']],
        '같은 원인 330건 가운데 상해는 30건', '원인 — 불안전한 행동 88% · 상태 10% · 불가항력 2%');
    } },

  iceberg: { cards: ['하인리히 — 도미노 이론과 1:29:300'],
    cap: '재해손실 1 : 4 — 눈에 보이는 직접비보다 숨은 간접비가 4배',
    draw: function () {
      var s = rect(16, 76, 448, 174, C.blueL, { op: 0.6 }) + line(16, 76, 464, 76, { c: C.blue, w: 2 });
      s += F.poly([[180, 76], [214, 30], [250, 22], [282, 76]], { close: 1, fill: '#fff', c: C.ink, w: 1.8 });
      s += F.poly([[180, 76], [282, 76], [350, 130], [372, 210], [300, 244], [160, 240], [108, 180], [128, 110]], { close: 1, fill: '#fff', c: C.ink, w: 1.8 });
      s += t(232, 56, '직접비 1', { a: 'm', b: 1, size: 15, c: C.red, ans: true });
      s += t(240, 140, '간접비 4', { a: 'm', b: 1, size: 18, c: C.blue, ans: true });
      s += t(240, 168, '생산 중단 · 설비 손실', { a: 'm', size: 13 }) + t(240, 188, '신규 인력 교육 · 신용 하락', { a: 'm', size: 13 });
      s += t(300, 30, '요양·휴업·장해·유족급여 등', { size: 13, c: C.sub });
      s += t(462, 92, '수면', { a: 'e', size: 13, c: C.blue });
      return F.svg(480, 262, s);
    } },

  bird_domino: { cards: ['버드 · 아담스 · 웨버 · 자베타키스'],
    cap: '버드 신도미노 — 1번째(관리의 부족)가 근본 원인이다',
    draw: function () { return dominoFig(['관리\n부족', '기본원인\n(기원)', '직접원인\n(징후)', '사고\n(접촉)', '상해\n(손해)'], 0); } },

  bird_ratio: { cards: ['버드 · 아담스 · 웨버 · 자베타키스'],
    cap: '버드 1 : 10 : 30 : 600 — 모두 641건',
    draw: function () {
      return pyramidFig([['1', '중상·폐질'], ['10', '경상'], ['30', '물적 손해 (무상해)'], ['600', '무손해·무상해 (아차사고)']],
        '하인리히 1:29:300 과 헷갈리지 말 것', '');
    } },

  swiss: { cards: ['인간 오류(Human Error)와 신뢰도'],
    cap: '리즌의 스위스 치즈 모델 — 방호벽마다 난 구멍이 한 줄로 늘어설 때 사고가 뚫고 나간다',
    draw: function () {
      var s = '', X = [76, 160, 244, 328], H = [[60, 150, 110], [92, 110, 170], [110, 66, 160], [140, 110, 70]];
      X.forEach(function (x, i) {
        s += F.poly([[x, 40], [x + 30, 28], [x + 30, 178], [x, 190]], { close: 1, fill: C.yellowL, c: '#a16207', w: 1.6 });
        H[i].forEach(function (y) { s += '<ellipse cx="' + (x + 15) + '" cy="' + y + '" rx="8" ry="11" fill="#fff" stroke="#a16207" stroke-width="1.2"/>'; });
      });
      s += arrow(24, 110, 412, 110, { c: C.red, w: 3, head: 13 });
      s += box(414, 92, 52, 36, { fill: C.redL, c: C.red, label: '사고', size: 15, lc: C.red });
      s += t(24, 92, '위험', { size: 14, b: 1, c: C.red });
      s += F.path('M76,204 V212 H274 V204', { c: C.sub, w: 1.2 }) + t(175, 228, '잠재적 실패 — 조직·관리 층', { a: 'm', size: 13, b: 1 });
      s += F.path('M328,204 V212 H358 V204', { c: C.sub, w: 1.2 }) + t(343, 228, '불안전 행동', { a: 'm', size: 13, b: 1 });
      s += t(240, 18, '방호벽(치즈) 여러 겹', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 244, s);
    } },

  reliability: { cards: ['인간 오류(Human Error)와 신뢰도'],
    cap: '신뢰도 — 직렬은 곱해서 낮아지고(0.81), 병렬은 하나만 살아도 되어 높아진다(0.99)',
    draw: function () {
      var s = t(118, 24, '직렬', { a: 'm', b: 1, size: 16 }) + t(358, 24, '병렬 (중복)', { a: 'm', b: 1, size: 16 });
      s += line(16, 90, 46, 90) + box(46, 70, 56, 40, { fill: C.blueL, c: C.blue, label: '0.9', size: 15 }) + line(102, 90, 132, 90) +
        box(132, 70, 56, 40, { fill: C.blueL, c: C.blue, label: '0.9', size: 15 }) + line(188, 90, 218, 90);
      s += t(118, 146, '0.9 × 0.9', { a: 'm', size: 14 }) + t(118, 172, '= 0.81', { a: 'm', size: 18, b: 1, c: C.red, ans: true });
      s += line(240, 40, 240, 196, { c: C.edge, w: 1.2, dash: '5 5' });
      s += line(258, 90, 286, 90) + line(286, 60, 286, 120) + line(286, 60, 330, 60) + line(286, 120, 330, 120);
      s += box(330, 42, 56, 36, { fill: C.greenL, c: C.green, label: '0.9', size: 15 }) + box(330, 102, 56, 36, { fill: C.greenL, c: C.green, label: '0.9', size: 15 });
      s += line(386, 60, 430, 60) + line(386, 120, 430, 120) + line(430, 60, 430, 120) + line(430, 90, 460, 90);
      s += t(358, 160, '1 − (0.1 × 0.1)', { a: 'm', size: 14 }) + t(358, 184, '= 0.99', { a: 'm', size: 18, b: 1, c: C.green, ans: true });
      return F.svg(480, 206, s);
    } },

  maslow: { cards: ['욕구·동기 이론'],
    cap: '매슬로 욕구 5단계 — 아래 욕구가 채워져야 위로 올라간다 · 안전은 2단계',
    draw: function () {
      var L = [['자아실현의 욕구', C.purpleL, C.purple], ['존경의 욕구', C.grayL, C.line], ['사회적(소속) 욕구', C.grayL, C.line],
        ['안전의 욕구', C.blueL, C.blue], ['생리적 욕구', C.grayL, C.line]], s = '';
      L.forEach(function (l, i) {
        var w = 150 + i * 62, y = 20 + i * 42;
        s += box(240 - w / 2, y, w, 38, { fill: l[1], c: l[2], w: 1.6, r: 4, label: l[0], size: 15, lc: i === 3 ? C.blue : C.ink, ans: i === 3 });
        s += F.num(240 - w / 2 - 16, y + 19, String(5 - i), { c: i === 3 ? C.blue : C.sub });
      });
      s += t(338, 30, '안전의 욕구 =', { size: 13, b: 1, c: C.blue }) + t(338, 48, '안전관리의 출발점', { size: 13, b: 1, c: C.blue });
      return F.svg(480, 236, s);
    } },

  herzberg: { cards: ['욕구·동기 이론'],
    cap: '허즈버그 2요인 — 위생요인은 불만을 없앨 뿐, 만족(동기부여)은 동기요인이 만든다',
    draw: function () {
      var s = arrow(240, 110, 24, 110, { c: C.red, w: 2 }) + arrow(240, 110, 456, 110, { c: C.green, w: 2 });
      s += t(24, 132, '불만', { size: 14, b: 1, c: C.red }) + t(456, 132, '만족', { a: 'e', size: 14, b: 1, c: C.green });
      s += line(240, 96, 240, 124, { w: 2 }) + t(240, 140, '0', { a: 'm', size: 14, b: 1 });
      s += box(40, 34, 196, 46, { fill: C.orangeL, c: C.orange, label: '위생요인 (불만족 요인)', size: 14 });
      s += arrow(60, 84, 232, 98, { c: C.orange, w: 1.6, head: 9 });
      s += t(138, 166, '급여 · 작업조건 · 감독', { a: 'm', size: 13 }) + t(138, 186, '회사정책 · 대인관계', { a: 'm', size: 13 });
      s += box(244, 34, 196, 46, { fill: C.greenL, c: C.green, label: '동기요인 (만족 요인)', size: 14 });
      s += arrow(250, 84, 440, 98, { c: C.green, w: 1.6, head: 9 });
      s += t(342, 166, '성취 · 인정 · 일 자체', { a: 'm', size: 13 }) + t(342, 186, '책임 · 성장', { a: 'm', size: 13 });
      return F.svg(480, 204, s);
    } },

  fta_eta: { cards: ['위험성 평가와 분석기법'],
    cap: 'FTA는 사고에서 원인으로 내려가고(연역·하향), ETA는 첫 사건에서 결과로 뻗어 간다(귀납·상향)',
    draw: function () {
      var s = t(110, 22, 'FTA (결함수분석)', { a: 'm', b: 1, size: 15, c: C.blue });
      s += box(50, 36, 120, 36, { fill: C.redL, c: C.red, label: '사고 (정상사상)', size: 13 });
      s += line(110, 72, 110, 86, { w: 1.6 });
      s += F.path('M92,120 V96 Q92,86 110,86 Q128,86 128,96 V120 Z', { fill: '#fff', c: C.ink, w: 1.8 });
      s += t(110, 106, 'AND', { a: 'm', size: 11, b: 1 });
      s += line(100, 120, 60, 150, { w: 1.4 }) + line(120, 120, 160, 150, { w: 1.4 });
      s += circle(60, 168, 20, { fill: C.blueL, c: C.blue, label: '원인', size: 13 }) + circle(160, 168, 20, { fill: C.blueL, c: C.blue, label: '원인', size: 13 });
      s += arrow(204, 44, 204, 186, { c: C.blue, w: 2 }) + t(214, 116, '연역\n하향', { size: 13, b: 1, c: C.blue });
      s += line(250, 16, 250, 228, { c: C.edge, w: 1.2, dash: '5 5' });
      s += t(370, 22, 'ETA (사건수분석)', { a: 'm', b: 1, size: 15, c: C.green });
      s += box(262, 96, 70, 36, { fill: C.orangeL, c: C.orange, label: '첫 사건', size: 13 });
      s += line(332, 114, 352, 114) + line(352, 74, 352, 154) + line(352, 74, 392, 74) + line(352, 154, 392, 154);
      s += t(372, 64, '성공', { a: 'm', size: 13, c: C.green }) + t(372, 166, '실패', { a: 'm', size: 13, c: C.red });
      s += line(392, 54, 392, 94) + line(392, 54, 420, 54) + line(392, 94, 420, 94) + line(392, 134, 392, 174) + line(392, 134, 420, 134) + line(392, 174, 420, 174);
      ['결과', '결과', '결과', '결과'].forEach(function (r, i) { s += t(424, [54, 94, 134, 174][i], r, { size: 13 }); });
      s += arrow(268, 200, 460, 200, { c: C.green, w: 2 }) + t(364, 216, '귀납 · 상향', { a: 'm', size: 13, b: 1, c: C.green });
      s += t(16, 216, 'AND = 곱 · OR = 1−(1−p)(1−p)', { size: 13, c: C.sub });
      return F.svg(480, 234, s);
    } },

  risk_matrix: { cards: ['위험성 평가와 분석기법'],
    cap: '위험성 추정 — 빈도와 강도를 함께 보고, 허용할 수 없으면 감소대책을 세운다 (칸 색은 개념)',
    draw: function () {
      var s = '', cols = [[C.greenL, C.greenL, C.yellowL], [C.greenL, C.yellowL, C.redL], [C.yellowL, C.redL, C.redL]];
      for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) s += rect(110 + c * 70, 30 + (2 - r) * 46, 70, 46, cols[r][c], { c: '#fff', w: 2 });
      s += arrow(104, 172, 104, 26, { w: 1.6, head: 9 }) + t(92, 100, '강도', { a: 'e', size: 14, b: 1 });
      s += arrow(110, 178, 324, 178, { w: 1.6, head: 9 }) + t(217, 196, '빈도', { a: 'm', size: 14, b: 1 });
      s += t(285, 52, '허용 불가', { a: 'm', size: 13, b: 1, c: C.red }) + t(145, 145, '허용', { a: 'm', size: 13, b: 1, c: C.green });
      var P = ['① 위험요인 파악', '② 위험성 추정', '③ 위험성 결정', '④ 감소대책', '⑤ 기록·공유'];
      P.forEach(function (p, i) { s += t(348, 40 + i * 30, p, { size: 13, b: i === 1 ? 1 : 0, c: i === 1 ? C.blue : C.ink }); });
      return F.svg(480, 212, s);
    } },

  stats: { cards: ['재해통계 지표'],
    cap: '재해통계 — 분모가 시간이면 도수율·강도율, 사람이면 연천인율 (예: 500명 · 120만 시간 · 6건 · 120일)',
    draw: function () {
      var s = '';
      var K = [['도수율', '재해건수', '연근로시간수', '× 1,000,000', '= 5', C.blue], ['강도율', '근로손실일수', '연근로시간수', '× 1,000', '= 0.1', C.blue],
        ['연천인율', '재해자수', '연평균 근로자수', '× 1,000', '= 12', C.orange]];
      K.forEach(function (k, i) {
        var cx = 86 + i * 154;
        s += t(cx, 26, k[0], { a: 'm', b: 1, size: 16 });
        s += t(cx, 62, k[1], { a: 'm', size: 14 });
        s += line(cx - 64, 78, cx + 64, 78, { w: 1.6 });
        s += rect(cx - 66, 84, 132, 28, k[5] === C.blue ? C.blueL : C.orangeL, { r: 6 });
        s += t(cx, 98, k[2], { a: 'm', size: 14, b: 1, c: k[5], halo: false });
        s += t(cx, 132, k[3], { a: 'm', size: 14 });
        s += t(cx, 160, '예) ' + k[4].replace('= ', ''), { a: 'm', size: 14, b: 1, c: C.sub });
      });
      s += line(16, 180, 464, 180, { c: C.edge, w: 1.2 });
      s += t(240, 200, '연천인율 ≒ 도수율 × 2.4  (1인 연 2,400시간)', { a: 'm', size: 14, b: 1 });
      return F.svg(480, 216, s);
    } },

  adhesion: { cards: ['철도 안전관리의 특성과 조직', '열차저항과 운전', '견인력·저항·균형속도'],
    cap: '점착계수 — 강철 바퀴와 레일은 0.1~0.3, 자동차 타이어는 0.7~0.8 · 그래서 철도의 제동거리가 길다',
    draw: function () {
      var x0 = 150, k = 300, s = t(16, 24, '점착계수 비교', { b: 1, size: 16 });
      s += t(16, 64, '강철 차륜 · 강철 레일', { size: 14, b: 1 });
      s += rect(x0, 50, k, 28, C.grayL, { r: 4 }) + rect(x0 + 0.1 * k, 50, 0.2 * k, 28, C.blue, { r: 4 });
      s += t(x0 + 0.3 * k + 8, 64, '0.1 ~ 0.3', { size: 15, b: 1, c: C.blue });
      s += t(16, 112, '자동차 타이어', { size: 14, b: 1 });
      s += rect(x0, 98, k, 28, C.grayL, { r: 4 }) + rect(x0 + 0.7 * k, 98, 0.1 * k, 28, C.orange, { r: 4 });
      s += t(x0 + 0.7 * k - 8, 112, '0.7 ~ 0.8', { a: 'e', size: 15, b: 1, c: C.orange });
      s += line(x0, 140, x0 + k, 140, { w: 1.2 });
      for (var v = 0; v <= 10; v += 2) s += line(x0 + v / 10 * k, 136, x0 + v / 10 * k, 144, { w: 1 }) + t(x0 + v / 10 * k, 156, String(v / 10), { a: 'm', size: 13, c: C.sub });
      s += line(16, 172, 464, 172, { c: C.edge, w: 1.2 });
      s += t(240, 192, '점착력 = 점착계수 × 동륜상 중량', { a: 'm', size: 15, b: 1 });
      s += t(240, 214, '넘으면 가속 때 공전, 제동 때 활주 → 살사장치(모래)', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 230, s);
    } },

  failsafe: { cards: ['철도 안전관리의 특성과 조직', '신호·전호·표지의 구분'],
    cap: '페일세이프 — 전구가 끊어지거나 전원이 나가도 진행이 아니라 정지 쪽으로 동작한다',
    draw: function () {
      function head(x, lit) {
        var h = rect(x, 34, 56, 110, '#374151', { r: 12 }) + line(x + 28, 144, x + 28, 196, { c: '#374151', w: 5 });
        [['#16a34a', 60], ['#eab308', 89], ['#dc2626', 118]].forEach(function (c) {
          h += circle(x + 28, c[1], 11, { fill: lit === c[0] ? c[0] : '#4b5563', c: '#111827', w: 1 });
        });
        return h;
      }
      var s = head(70, '#16a34a') + t(98, 214, '정상 — 진행', { a: 'm', b: 1, size: 15, c: C.green });
      s += arrow(160, 100, 300, 100, { c: C.ink, w: 2 }) + t(230, 82, '고장 · 전원 끊김', { a: 'm', size: 14, b: 1 });
      s += F.path('M222,108 L234,108 L226,118 L238,118 L220,130 L226,120 L216,120 Z', { fill: C.red, c: C.red, w: 1 });
      s += head(330, '#dc2626') + t(358, 214, '정지 현시', { a: 'm', b: 1, size: 15, c: C.red, ans: true });
      s += t(240, 238, '안전한 쪽으로 넘어지게 설계한다', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 254, s);
    } },

  acc_response: { cards: ['안전관리체계·사고조사·비상대응'],
    cap: '철도사고가 나면 — 사상자 구호가 최우선, 그다음 유류품 · 여객 수송 · 복구 · 보고',
    draw: function () {
      var L = ['사상자\n구호', '유류품\n관리', '여객\n수송', '철도시설\n복구', '보고'], s = '';
      L.forEach(function (l, i) {
        var x = 16 + i * 92;
        s += box(x, 58, 84, 56, { fill: i === 0 ? C.redL : C.grayL, c: i === 0 ? C.red : C.line, label: l, size: 15, lc: i === 0 ? C.red : C.ink, ans: i === 0 });
        s += F.num(x + 42, 46, String(i + 1), { c: i === 0 ? C.red : C.sub });
        if (i < 4) s += arrow(x + 85, 86, x + 91, 86, { head: 6, w: 1.4 });
      });
      s += t(58, 132, '최우선', { a: 'm', size: 14, b: 1, c: C.red });
      s += t(426, 132, '국토교통부장관', { a: 'm', size: 13 });
      s += t(16, 20, '사고 발생 시 조치 순서', { b: 1, size: 16 });
      s += line(16, 150, 464, 150, { c: C.edge, w: 1.2 });
      s += t(240, 170, '사고조사의 목적 = 처벌이 아니라 재발방지', { a: 'm', size: 14, b: 1, c: C.blue });
      return F.svg(480, 186, s);
    } },

  circadian: { cards: ['운전자 관리'],
    cap: '일주기 리듬 — 사고 위험이 높은 시간대는 새벽 02~06시와 이른 오후 13~15시',
    draw: function () {
      var cx = 140, cy = 124, r = 88, s = circle(cx, cy, r, { fill: '#fff', c: C.ink, w: 2 });
      function pt(h, rr) { var a = (h / 24) * 2 * Math.PI - Math.PI / 2; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; }
      function arc(h1, h2, c) {
        var p1 = pt(h1, r - 12), p2 = pt(h2, r - 12);
        return '<path d="M' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) + ' A' + (r - 12) + ',' + (r - 12) + ' 0 0 1 ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1) + '" fill="none" stroke="' + c + '" stroke-width="16" stroke-linecap="butt" opacity="0.85"/>';
      }
      s += arc(2, 6, C.red) + arc(13, 15, C.orange);
      for (var h = 0; h < 24; h++) { var a = pt(h, r), b = pt(h, r - (h % 6 ? 5 : 10)); s += line(a[0], a[1], b[0], b[1], { w: h % 6 ? 1 : 2 }); }
      [0, 6, 12, 18].forEach(function (h) { var p = pt(h, r - 30); s += t(p[0], p[1], h + '시', { a: 'm', size: 13, b: 1 }); });
      s += t(cx, cy, '24시간', { a: 'm', size: 13, c: C.sub });
      s += rect(254, 52, 18, 18, C.red, { r: 3 }) + t(280, 61, '새벽 02 ~ 06시', { size: 15, b: 1, c: C.red });
      s += rect(254, 92, 18, 18, C.orange, { r: 3 }) + t(280, 101, '이른 오후 13 ~ 15시', { size: 15, b: 1, c: C.orange });
      s += t(254, 150, '피로가 가장 큰 위험요인', { size: 13, b: 1 });
      s += t(254, 172, '→ 승무(교번)계획으로', { size: 13, c: C.sub });
      s += t(254, 192, '    연속근무·야간 승무 관리', { size: 13, c: C.sub });
      return F.svg(480, 230, s);
    } },

  maint4: { cards: ['차량 관리와 운행 관리'],
    cap: '보전 방식 — 고장 난 뒤(사후) · 정해진 주기마다(예방) · 조짐을 보고(예지) · 설계를 고쳐서(개량)',
    draw: function () {
      var s = '', x0 = 150, x1 = 460;
      function fix(x, y) { return F.poly([[x, y - 9], [x + 9, y], [x, y + 9], [x - 9, y]], { close: 1, fill: C.green, c: C.green, w: 1 }); }
      var R = [['사후보전 (BM)', '고장 난 뒤 고침'], ['예방보전 (PM)', '정해진 주기로'], ['예지보전 (CBM)', '상태를 감시해서'], ['개량보전 (CM)', '설계 자체를 개선']];
      R.forEach(function (r, i) {
        var y = 40 + i * 52;
        s += t(16, y - 7, r[0], { size: 14, b: 1 }) + t(16, y + 11, r[1], { size: 13, c: C.sub });
        if (i < 3) s += arrow(x0, y, x1, y, { c: C.grayM, w: 1.6, head: 8 });
      });
      s += F.path('M296,31 L314,49 M314,31 L296,49', { c: C.red, w: 3 }) + t(305, 20, '고장', { a: 'm', size: 13, b: 1, c: C.red }) + fix(340, 40);
      [210, 290, 370].forEach(function (x) { s += fix(x, 92); });
      s += F.path('M150,154 Q260,152 300,136 T360,118', { c: C.orange, w: 2 });
      s += line(150, 124, 440, 124, { c: C.red, w: 1.2, dash: '5 4' }) + t(440, 116, '조짐', { a: 'e', size: 13, c: C.red });
      s += fix(340, 144);
      s += box(150, 178, 190, 32, { fill: C.blueL, c: C.blue, label: '고장이 안 나게 설계 변경', size: 13 });
      s += fix(400, 238 - 2) + t(412, 236, '= 정비', { size: 13, c: C.green });
      return F.svg(480, 254, s);
    } },

  /* ═════════════════ 철도공학 ═════════════════ */
  track: { cards: ['선로와 궤도의 구성', '침목과 도상, 노반'],
    cap: '선로 = 궤도(레일·침목·도상) + 노반 — 아래로 내려갈수록 하중이 넓게 퍼진다',
    draw: function () {
      var s = F.poly([[40, 238], [440, 238], [410, 196], [70, 196]], { close: 1, fill: C.grayL, c: C.sub, w: 1.6 });
      s += F.poly([[96, 196], [384, 196], [340, 140], [140, 140]], { close: 1, fill: C.yellowL, c: '#a16207', w: 1.6 });
      for (var i = 0; i < 46; i++) s += dot(110 + (i * 37) % 260, 150 + (i * 13) % 42, 2.2, '#a16207');
      s += rect(130, 128, 220, 14, '#d6bfa6', { c: '#8b5e34', w: 1.6, r: 2 });
      s += railProf(176, 128, 1) + railProf(304, 128, 1);
      s += line(176, 104, 120, 236, { c: C.blue, w: 1.2, dash: '4 3' }) + line(304, 104, 360, 236, { c: C.blue, w: 1.2, dash: '4 3' });
      s += callout(312, 108, 404, 90, '레일', { b: 1 }) + callout(340, 135, 404, 124, '침목', { b: 1 });
      s += callout(360, 168, 420, 158, '도상', { b: 1 }) + callout(400, 220, 430, 252, '노반', { b: 1, a: 'e' });
      s += t(240, 216, '하중이 넓게 퍼진다', { a: 'm', size: 13, c: C.blue, b: 1 });
      s += F.path('M28,100 H20 V196 H28', { c: C.green, w: 1.6 }) + t(14, 148, '궤도', { a: 'm', size: 13, b: 1, c: C.green, ans: true });
      s += t(16, 24, '선로 = 궤도 + 노반', { size: 15, b: 1 }) + t(16, 46, '궤도 = 레일 + 침목 + 도상 + 부속품', { size: 13, c: C.sub });
      return F.svg(480, 266, s);
    } },

  gauge: { cards: ['선로와 궤도의 구성'],
    cap: '궤간 — 레일 윗면에서 14mm 아래, 두 레일 안쪽 사이의 가장 짧은 거리 · 표준궤 1,435mm',
    draw: function () {
      var s = railProf(110, 122, 2.6) + railProf(370, 122, 2.6);
      s += line(30, 78, 450, 78, { c: C.red, w: 1, dash: '5 4' });
      s += F.dim(128, 78, 352, 78, '1,435mm', { size: 16, ans: true, c: C.red });
      s += F.dim(60, 60, 60, 78, '', { off: 0 }) + t(52, 69, '14mm', { a: 'e', size: 13, b: 1 });
      s += line(56, 60, 94, 60, { c: C.sub, w: 1 });
      s += t(240, 186, '이보다 넓으면 광궤 · 좁으면 협궤', { a: 'm', size: 14, b: 1 });
      s += t(240, 208, '우리나라 국철·도시철도 = 표준궤', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 224, s);
    } },

  joint: { cards: ['레일 — 종류·이음매·장대레일'],
    cap: '이음매 배치 — 상대식(마주 보게, 우리나라 표준) · 상호식(엇갈리게) · 이음매의 틈이 유간',
    draw: function () {
      function rail(y, gaps) {
        var r = '', x0 = 20;
        gaps.concat([460]).forEach(function (g) { r += line(x0, y, g - 3, y, { w: 3.2 }); x0 = g + 3; });
        gaps.forEach(function (g) { r += rect(g - 10, y - 4, 20, 8, C.redL, { c: C.red, w: 1.2, r: 2 }); });
        return r;
      }
      var s = t(20, 22, '상대식 — 좌우 이음매가 마주 본다 (우리나라 표준)', { size: 14, b: 1, ans: true });
      s += rail(44, [170, 360]) + rail(72, [170, 360]);
      s += t(20, 112, '상호식 — 좌우가 엇갈린다 (사행동 유발)', { size: 14, b: 1, ans: true });
      s += rail(134, [170, 360]) + rail(162, [75, 265]);
      s += line(16, 186, 464, 186, { c: C.edge, w: 1.2 });
      s += rect(70, 216, 150, 18, C.grayM, { c: C.ink, w: 1.4 }) + rect(232, 216, 150, 18, C.grayM, { c: C.ink, w: 1.4 });
      s += F.dim(220, 216, 232, 216, '', { off: 0 }) + t(226, 204, '유간', { a: 'm', size: 15, b: 1, c: C.red, ans: true });
      s += t(240, 254, '더울 때 깔면 작게, 추울 때 깔면 크게', { a: 'm', size: 13 });
      s += t(240, 274, '부족하면 좌굴(장출) · 너무 크면 충격', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 290, s);
    } },

  cant: { cards: ['곡선과 캔트'],
    cap: '캔트 — 바깥 레일을 높여 원심력을 중력의 분력으로 상쇄한다 · 균형캔트 C = 11.8V²/R',
    draw: function () {
      var a = -7, s = '';
      s += line(60, 206, 420, 206, { c: C.sub, w: 1.2 });
      s += F.g(rect(-120, -10, 240, 14, '#d6bfa6', { c: '#8b5e34', w: 1.4 }) + railProf(-70, -10, 0.8) + railProf(70, -10, 0.8) +
        rect(-110, -150, 220, 112, C.blueL, { c: C.blue, w: 1.8, r: 10 }) + dot(0, -94, 5, C.ink), { x: 240, y: 196, r: a });
      s += line(170, 178, 420, 178, { c: C.red, w: 1, dash: '4 3' });
      s += F.dim(330, 178, 330, 161, '', { off: 0 }) + t(342, 168, 'C', { size: 17, b: 1, c: C.red, ans: true });
      s += arrow(228, 103, 228, 180, { c: C.blue, w: 2.4 }) + t(236, 150, '중력', { size: 14, b: 1, c: C.blue });
      s += arrow(228, 103, 340, 103, { c: C.red, w: 2.4 }) + t(290, 89, '원심력', { a: 'm', size: 14, b: 1, c: C.red });
      s += t(70, 230, '← 곡선 안쪽', { size: 14, b: 1 }) + t(420, 230, '바깥쪽 →', { a: 'e', size: 14, b: 1 });
      s += t(240, 24, '바깥 레일을 높인다', { a: 'm', size: 15, b: 1 });
      return F.svg(480, 246, s);
    } },

  curve_types: { cards: ['곡선과 캔트'],
    cap: '곡선의 종류 — 단곡선 · 복심곡선 · 반향곡선(S곡선) · 완화곡선',
    draw: function () {
      var s = '';
      function P(x, y, name, body, note) { return rect(x, y, 216, 104, '#fff', { c: C.edge, r: 8 }) + t(x + 10, y + 18, name, { size: 14, b: 1 }) + body + (note ? t(x + 206, y + 92, note, { a: 'e', size: 13, c: C.sub }) : ''); }
      s += P(16, 16, '단곡선', F.path('M40,100 Q120,30 210,50', { c: C.blue, w: 3 }), '원곡선 하나');
      s += P(248, 16, '복심곡선', F.path('M268,100 Q300,64 344,56', { c: C.blue, w: 3 }) + F.path('M344,56 Q380,48 448,30', { c: C.orange, w: 3 }), '같은 방향 · 반경 다름');
      s += P(16, 130, '반향곡선 (S곡선)', F.path('M30,220 Q60,170 96,176', { c: C.blue, w: 3 }) + line(96, 176, 138, 180, { c: C.green, w: 3 }) +
        F.path('M138,180 Q176,186 216,150', { c: C.orange, w: 3 }), '사이에 중간직선');
      s += t(117, 166, '직선', { a: 'm', size: 13, c: C.green, b: 1 });
      s += P(248, 130, '완화곡선', line(262, 210, 320, 210, { w: 3 }) + F.path('M320,210 Q352,208 372,196', { c: C.orange, w: 3, dash: '6 4' }) +
        F.path('M372,196 Q410,172 450,150', { c: C.blue, w: 3 }), '직선 ↔ 원곡선 사이');
      return F.svg(480, 252, s);
    } },

  transition: { cards: ['완화곡선·기울기·종곡선'],
    cap: '완화곡선 — 직선(곡률 0)에서 원곡선(곡률 1/R)까지 곡률과 캔트를 서서히 바꾼다 · 형상은 3차 포물선',
    draw: function () {
      var s = line(20, 90, 170, 90, { w: 4 }) + F.path('M170,90 Q260,88 300,70', { c: C.orange, w: 4 }) + F.path('M300,70 Q370,36 460,20', { c: C.blue, w: 4 });
      s += t(95, 72, '직선', { a: 'm', size: 15, b: 1 }) + t(235, 112, '완화곡선', { a: 'm', size: 15, b: 1, c: C.orange, ans: true }) + t(400, 60, '원곡선', { a: 'm', size: 15, b: 1, c: C.blue });
      s += line(170, 126, 170, 226, { c: C.grayM, w: 1, dash: '4 4' }) + line(300, 126, 300, 226, { c: C.grayM, w: 1, dash: '4 4' });
      s += line(20, 210, 460, 210, { w: 1.4 }) + arrow(20, 210, 20, 130, { w: 1.4, head: 8 }) + t(28, 134, '곡률', { size: 13, b: 1 });
      s += F.poly([[20, 206], [170, 206], [300, 150], [460, 150]], { c: C.red, w: 2.6 });
      s += t(95, 194, '0', { a: 'm', size: 15, b: 1, c: C.red }) + t(380, 138, '1/R', { a: 'm', size: 15, b: 1, c: C.red });
      s += t(235, 196, '서서히', { a: 'm', size: 13, c: C.red });
      s += t(240, 236, '캔트·슬랙도 이 구간에서 서서히 바뀐다', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 252, s);
    } },

  grade: { cards: ['완화곡선·기울기·종곡선'],
    cap: '기울기는 퍼밀(‰) — 수평거리 1,000m 마다 몇 m 오르내리는지',
    draw: function () {
      var s = F.poly([[40, 150], [360, 150], [360, 70]], { close: 1, fill: C.blueL, c: C.blue, w: 2 });
      s += F.dim(40, 150, 360, 150, '수평거리 1,000m', { off: -18, size: 14 });
      s += F.dim(360, 150, 360, 70, '', { off: -14 }) + t(384, 110, '높이 차', { size: 14, b: 1 });
      s += t(40, 26, '10‰ = 1,000m 가서 10m 오르내림', { size: 15, b: 1 });
      s += t(440, 160, '‰', { a: 'm', size: 30, b: 1, c: C.blue });
      s += t(240, 204, '승강장 구간 본선 2‰ 이하 · 유치하지 않는 측선 35‰ 까지', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 220, s);
    } },

  clearance: { cards: ['건축한계·차량한계·궤도중심간격'],
    cap: '차량한계는 건축한계 안에 — 그 사이가 차량의 동요·편기를 흡수하는 여유 (모양은 개념)',
    draw: function () {
      var s = line(40, 236, 440, 236, { c: C.sub, w: 1.4 }) + railProf(196, 236, 0.8) + railProf(284, 236, 0.8);
      s += F.poly([[120, 236], [120, 72], [160, 30], [320, 30], [360, 72], [360, 236]], { c: C.red, w: 2.4, dash: '8 5' });
      s += F.path('M160,226 V90 Q160,62 188,62 H292 Q320,62 320,90 V226 Z', { fill: C.blueL, c: C.blue, w: 2 });
      s += t(240, 140, '차량한계', { a: 'm', size: 16, b: 1, c: C.blue });
      s += t(240, 160, '정지 상태의 차량 크기', { a: 'm', size: 13 });
      s += t(370, 50, '건축한계', { size: 16, b: 1, c: C.red });
      s += t(370, 72, '이 안에', { size: 13 }) + t(370, 90, '시설물 금지', { size: 13 });
      s += arrow(124, 150, 156, 150, { both: true, head: 7, w: 1.4, c: C.orange });
      s += t(110, 128, '여유', { a: 'e', size: 14, b: 1, c: C.orange });
      s += t(110, 148, '동요·편기', { a: 'e', size: 13, c: C.orange });
      s += t(370, 190, '곡선에서는', { size: 13, c: C.sub }) + t(370, 208, '건축한계 확대', { size: 13, b: 1 });
      return F.svg(480, 252, s);
    } },

  turnout: { cards: ['분기기 구조와 번수'],
    cap: '분기기 — 포인트부(텅레일) · 리드부 · 크로싱부(노스레일) · 가드레일 · 번수 N = cot θ',
    draw: function () {
      var k = 0.000415, s = '';
      function yc(x, b) { return b - k * Math.pow(Math.max(0, x - 60), 2); }
      function curve(b, x1, x2, o) { var p = []; for (var x = x1; x <= x2; x += 8) p.push([x, yc(x, b)]); return F.poly(p, o); }
      s += line(16, 100, 312, 100, { w: 2.6 }) + line(346, 100, 464, 100, { w: 2.6 });
      s += line(16, 130, 464, 130, { w: 2.6 });
      s += curve(100, 60, 300, { w: 2.6 }) + curve(100, 300, 464, { w: 2.6 });
      s += curve(130, 140, 318, { w: 2.6 }) + curve(130, 340, 452, { w: 2.6 });
      s += curve(100, 60, 140, { c: C.blue, w: 4 }) + line(60, 130, 140, 128, { c: C.blue, w: 4 });
      s += F.poly([[300, 100], [329, 100], [356, 92]], { c: C.orange, w: 4 });
      s += line(300, 124, 360, 124, { c: C.green, w: 3 });
      s += callout(110, 94, 92, 40, '텅레일', { b: 1, tc: C.blue });
      s += callout(330, 100, 356, 52, '노스레일', { b: 1, tc: C.orange });
      s += callout(340, 124, 400, 160, '가드레일', { b: 1, tc: C.green });
      s += box(40, 144, 70, 26, { fill: C.grayL, label: '선로전환기', size: 13, b: 0 }) + line(75, 144, 75, 131, { c: C.sub, w: 1.4 });
      s += t(305, 76, 'θ', { a: 'm', size: 15, b: 1, c: C.red });
      [[60, 150, '포인트부'], [150, 300, '리드부'], [300, 370, '크로싱부']].forEach(function (z) {
        s += F.path('M' + z[0] + ',188 V194 H' + z[1] + ' V188', { c: C.sub, w: 1.2 }) + t((z[0] + z[1]) / 2, 210, z[2], { a: 'm', size: 14, b: 1 });
      });
      s += t(240, 240, '번수 N = cot θ — 클수록 완만해 빨리 지난다', { a: 'm', size: 14, b: 1, c: C.red });
      return F.svg(480, 256, s);
    } },

  turnout_types: { cards: ['분기기 구조와 번수'],
    cap: '배선에 따른 분기기 — 편개(한쪽으로) · 양개(좌우 대칭) · 시저스 크로싱(X자 건넘선)',
    draw: function () {
      var s = '', w = 4;
      s += line(20, 90, 150, 90, { w: w }) + F.path('M50,90 Q100,88 150,50', { w: w, c: C.blue });
      s += t(85, 128, '편개분기기', { a: 'm', size: 14, b: 1 });
      s += line(170, 70, 210, 70, { w: w }) + F.path('M210,70 Q250,70 300,36', { w: w, c: C.blue }) + F.path('M210,70 Q250,70 300,104', { w: w, c: C.blue });
      s += t(240, 128, '양개분기기', { a: 'm', size: 14, b: 1 });
      s += line(320, 46, 464, 46, { w: w }) + line(320, 96, 464, 96, { w: w });
      s += line(350, 46, 434, 96, { w: w, c: C.blue }) + line(350, 96, 434, 46, { w: w, c: C.blue });
      s += t(392, 128, '시저스 크로싱', { a: 'm', size: 14, b: 1 });
      return F.svg(480, 146, s);
    } },

  effective_len: { cards: ['정거장과 승강장'],
    cap: '유효장 — 열차를 세워 둘 수 있는 선로의 최대 길이를 이루는 부분 (길이 비율은 개략)',
    draw: function () {
      var s = line(16, 120, 464, 120, { w: 3 });
      s += line(440, 120, 440, 48, { c: '#374151', w: 4 }) + rect(428, 30, 24, 36, '#374151', { r: 6 }) + dot(440, 40, 5, C.red) + dot(440, 56, 5, '#4b5563');
      s += t(448, 18, '출발신호기', { a: 'e', size: 13, b: 1 });
      var seg = [[400, 440, '신호\n주시', C.grayL], [370, 400, '과주\n여유', C.grayL], [310, 370, '기관차', C.orangeL], [90, 310, '여객열차 편성', C.blueL], [40, 90, '제동\n여유', C.grayL]];
      seg.forEach(function (g) { s += box(g[0], 138, g[1] - g[0], 44, { fill: g[3], c: C.line, w: 1.2, r: 2, label: g[2], size: 13, b: 0 }); });
      s += car(312, 86, 56, 26, { fill: C.orangeL }) + car(94, 86, 70, 26) + car(166, 86, 70, 26) + car(238, 86, 70, 26);
      s += F.dim(40, 196, 440, 196, '유효장', { size: 15, ans: true });
      s += t(240, 230, '전기동차·디젤동차 전용선은 기관차 길이를 뺀다', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 246, s);
    } },

  power_dist: { cards: ['철도차량의 구조'],
    cap: '동력집중식(앞뒤 기관차가 끌고 밂) vs 동력분산식(여러 차량에 동력)',
    draw: function () {
      var s = t(16, 22, '동력집중식 — 예: KTX', { size: 15, b: 1 });
      [0, 1, 2, 3, 4].forEach(function (i) { var m = i === 0 || i === 4; s += car(20 + i * 88, 36, 84, 34, { fill: m ? C.orangeL : C.grayL }); if (m) s += t(62 + i * 88, 94, '동력', { a: 'm', size: 13, b: 1, c: C.orange }); });
      s += t(240, 116, '객차 소음이 적다 · 가감속은 불리', { a: 'm', size: 13, c: C.sub });
      s += line(16, 132, 464, 132, { c: C.edge, w: 1.2 });
      s += t(16, 154, '동력분산식 — 예: KTX-이음, 전동차', { size: 15, b: 1 });
      [0, 1, 2, 3, 4].forEach(function (i) { var m = i !== 2; s += car(20 + i * 88, 168, 84, 34, { fill: m ? C.orangeL : C.grayL }); if (m) s += t(62 + i * 88, 226, '동력', { a: 'm', size: 13, b: 1, c: C.orange }); });
      s += t(240, 248, '가감속 우수 · 축중 분산 · 표정속도 유리 (동력 차량 배치는 예시)', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 264, s);
    } },

  wheel_force: { cards: ['철도차량의 구조'],
    cap: '윤중(수직)과 횡압(수평) — 탈선계수 = 횡압 ÷ 윤중, 커질수록 탈선 위험',
    draw: function () {
      var s = railProf(260, 225, 3.2);
      s += F.poly([[120, 40], [360, 40], [360, 136], [236, 148], [226, 172], [206, 172], [198, 140], [120, 138]], { close: 1, fill: C.grayL, c: C.ink, w: 2 });
      s += t(290, 90, '차륜', { a: 'm', size: 15, b: 1 });
      s += callout(214, 168, 120, 196, '플랜지', { b: 1 });
      s += callout(320, 140, 380, 196, '답면 (기울기)', { b: 1 });
      s += arrow(260, 20, 260, 132, { c: C.blue, w: 3 }) + t(270, 26, '윤중 Q (수직)', { size: 14, b: 1, c: C.blue });
      s += arrow(150, 160, 214, 160, { c: C.red, w: 3 }) + t(144, 160, '횡압 P', { a: 'e', size: 14, b: 1, c: C.red });
      s += t(16, 26, '탈선계수 = P ÷ Q', { size: 16, b: 1, c: C.red });
      return F.svg(480, 262, s);
    } },

  speed_kinds: { cards: ['열차저항과 운전'],
    cap: '평균속도는 달린 시간만으로, 표정속도는 정차시간까지 포함해 나눈다 — 그래서 표정속도가 더 낮다',
    draw: function () {
      var s = t(16, 22, '한 번 운행한 시간', { size: 14, b: 1 });
      var seg = [[20, 140, 1], [140, 172, 0], [172, 300, 1], [300, 332, 0], [332, 460, 1]];
      seg.forEach(function (g) { s += rect(g[0], 40, g[1] - g[0], 30, g[2] ? C.blueL : C.grayM, { c: g[2] ? C.blue : C.sub, w: 1.2 }) + t((g[0] + g[1]) / 2, 55, g[2] ? '달림' : '정차', { a: 'm', size: 13, b: 1, halo: false }); });
      seg.forEach(function (g) { if (g[2]) s += F.path('M' + g[0] + ',80 V86 H' + g[1] + ' V80', { c: C.blue, w: 1.4 }); });
      s += t(240, 104, '평균속도 = 거리 ÷ 달린 시간 (정차 제외)', { a: 'm', size: 14, b: 1, c: C.blue });
      s += F.path('M20,122 V130 H460 V122', { c: C.orange, w: 1.6 });
      s += t(240, 150, '표정속도 = 거리 ÷ 정차까지 포함한 총 시간', { a: 'm', size: 14, b: 1, c: C.orange, ans: true });
      s += t(240, 178, '실제 서비스 수준을 보여 주는 값', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 194, s);
    } },

  catenary: { cards: ['전차선로와 전기철도'],
    cap: '가공전차선 — 조가선에 드로퍼로 전차선을 매달고, 팬터그래프가 전차선에서 전기를 받는다',
    draw: function () {
      var s = rect(30, 30, 10, 170, C.grayM, { c: C.ink, w: 1.4 }) + rect(440, 30, 10, 170, C.grayM, { c: C.ink, w: 1.4 });
      s += F.path('M40,40 Q240,100 440,40', { c: C.ink, w: 2 });
      for (var x = 74; x <= 410; x += 34) { var tt = (x - 40) / 400; s += line(x, 40 + 120 * tt * (1 - tt), x, 110, { c: C.sub, w: 1.2 }); }
      s += line(40, 110, 440, 110, { c: C.orange, w: 3 });
      s += F.poly([[230, 111], [270, 111], [282, 132], [250, 152], [218, 132]], { close: 1, c: C.blue, w: 2 }) + line(222, 111, 278, 111, { c: C.blue, w: 4 });
      s += rect(150, 152, 200, 40, C.blueL, { c: C.blue, w: 1.6, r: 6 });
      s += callout(120, 52, 92, 24, '조가선', { b: 1 });
      s += callout(380, 100, 368, 150, '드로퍼\n(행거)', { b: 1 });
      s += callout(64, 110, 52, 84, '전차선(트롤리선)', { b: 1, tc: C.orange, a: 's' });
      s += callout(220, 132, 140, 136, '팬터그래프', { b: 1, tc: C.blue });
      s += t(454, 214, '지지물(전주)', { a: 'e', size: 13 });
      s += line(16, 228, 464, 228, { c: C.edge, w: 1.2 });
      s += t(16, 248, '위에서 보면', { size: 13, c: C.sub });
      s += line(100, 262, 460, 262, { c: C.grayM, w: 12 }) + line(100, 262, 460, 262, { dash: 'center', c: C.sub, w: 1 });
      s += F.poly([[100, 254], [190, 270], [280, 254], [370, 270], [460, 254]], { c: C.orange, w: 2.4 });
      s += t(240, 292, '편위 — 지그재그로 걸어 팬터그래프가 한 곳만 닳지 않게', { a: 'm', size: 13, b: 1 });
      return F.svg(480, 308, s);
    } },

  feed: { cards: ['전차선로와 전기철도'],
    cap: '급전 방식 — 도시철도는 직류 1,500V, 국철·고속철도는 교류 25kV/60Hz · 교직 절연구간은 타행으로 통과',
    draw: function () {
      var s = rect(16, 30, 180, 120, C.blueL, { r: 8, op: 0.7 }) + rect(284, 30, 180, 120, C.orangeL, { r: 8, op: 0.8 }) + rect(196, 30, 88, 120, C.grayL);
      s += line(16, 60, 186, 60, { c: C.blue, w: 3 }) + line(294, 60, 464, 60, { c: C.orange, w: 3 }) + line(200, 60, 280, 60, { c: C.sub, w: 3, dash: '6 5' });
      s += t(106, 86, '직류 1,500V', { a: 'm', size: 16, b: 1, c: C.blue }) + t(106, 108, '도시철도', { a: 'm', size: 13 });
      s += t(374, 86, '교류 25kV/60Hz', { a: 'm', size: 16, b: 1, c: C.orange }) + t(374, 108, '국철 · 고속철도', { a: 'm', size: 13 });
      s += t(240, 44, '절연구간', { a: 'm', size: 13, b: 1 });
      s += car(186, 112, 108, 30, { fill: '#fff' });
      s += line(16, 160, 464, 160, { w: 2 });
      s += t(240, 186, '교직 절연구간(사구간) — 타행(무동력)으로 지나간다', { a: 'm', size: 14, b: 1, c: C.red });
      s += t(240, 208, '귀선 전류는 주행 레일로 돌아온다', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 224, s);
    } },

  mud_pump: { cards: ['노반·토공과 배수, 교량·터널'],
    cap: '분니 — 배수가 나쁘면 도상 아래 흙탕물이 열차 하중에 솟아올라 도상을 더럽힌다',
    draw: function () {
      var s = rect(30, 170, 300, 60, '#e7d7c1', { c: '#8b5e34', w: 1.4 }) + t(60, 212, '노반', { size: 14, b: 1 });
      s += F.poly([[60, 170], [300, 170], [270, 110], [90, 110]], { close: 1, fill: C.yellowL, c: '#a16207', w: 1.4 });
      for (var i = 0; i < 30; i++) s += dot(100 + (i * 41) % 180, 120 + (i * 17) % 44, 2.2, '#a16207');
      s += rect(100, 98, 160, 14, '#d6bfa6', { c: '#8b5e34', w: 1.4 });
      s += F.path('M130,172 Q150,150 170,160 Q190,135 210,158 Q228,146 236,172 Z', { fill: '#8b5e34', c: '#8b5e34', w: 1, op: 0.7 });
      s += arrow(160, 168, 156, 128, { c: '#8b5e34', w: 2 }) + arrow(206, 168, 210, 128, { c: '#8b5e34', w: 2 });
      s += arrow(180, 30, 180, 92, { c: C.red, w: 3 }) + t(190, 40, '열차 하중', { size: 14, b: 1, c: C.red });
      s += callout(220, 160, 300, 70, '흙탕물이 솟는다', { b: 1, tc: '#8b5e34' });
      s += t(336, 130, '대책', { size: 14, b: 1, c: C.green });
      s += t(336, 154, '· 배수시설 정비', { size: 13 }) + t(336, 176, '· 도상 자갈치기', { size: 13 }) + t(336, 198, '· 강화노반', { size: 13 });
      return F.svg(480, 246, s);
    } },

  cut_fill: { cards: ['노반·토공과 배수, 교량·터널'],
    cap: '토공 — 땅이 높은 곳은 깎고(절토), 낮은 곳은 쌓아(성토) 선로 높이를 맞춘다',
    draw: function () {
      var g = [[16, 150], [80, 140], [150, 70], [220, 60], [280, 110], [330, 170], [400, 180], [464, 160]];
      var s = F.poly(g.concat([[464, 220], [16, 220]]), { close: 1, fill: '#efe3cf', c: '#8b5e34', w: 1.6 });
      s += F.poly([[118, 120], [150, 70], [220, 60], [272, 120]], { close: 1, fill: C.redL, c: C.red, w: 1.4, dash: '5 4' });
      s += F.poly([[290, 120], [440, 120], [400, 180], [330, 170]], { close: 1, fill: C.greenL, c: C.green, w: 1.4 });
      s += line(16, 120, 464, 120, { w: 3 });
      s += t(195, 96, '절토 (깎기)', { a: 'm', size: 15, b: 1, c: C.red });
      s += t(368, 146, '성토 (쌓기)', { a: 'm', size: 15, b: 1, c: C.green });
      s += t(16, 108, '선로 높이', { size: 13, b: 1 });
      s += t(240, 240, '비탈면은 보호공·낙석방지망·옹벽 · 성토부는 다짐도 관리', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 256, s);
    } },

  irregularity: { cards: ['궤도틀림과 선로 유지보수'],
    cap: '궤도틀림 5종 — 궤간 · 수평 · 면(고저) · 줄(방향) · 평면성(비틀림) (틀림 크기는 과장)',
    draw: function () {
      var s = '';
      function P(x, y, name, sub, body, red) {
        return rect(x, y, 146, 118, red ? C.redL : '#fff', { c: red ? C.red : C.edge, r: 8 }) + body +
          t(x + 73, y + 92, name, { a: 'm', size: 14, b: 1, c: red ? C.red : C.ink, ans: true }) + t(x + 73, y + 110, sub, { a: 'm', size: 13, c: C.sub });
      }
      s += P(16, 12, '궤간틀림', '궤간이 넓거나 좁음', line(30, 34, 148, 34, { w: 2.6 }) + F.path('M30,64 Q90,82 148,64', { w: 2.6, c: C.orange }) + line(30, 64, 148, 64, { c: C.grayM, w: 1, dash: '4 3' }), 0);
      s += P(167, 12, '수평틀림', '좌우 레일 높이 차', line(186, 66, 296, 50, { c: '#8b5e34', w: 8 }) + railProf(206, 63, 0.7) + railProf(276, 53, 0.7) + line(186, 66, 296, 66, { c: C.grayM, w: 1, dash: '4 3' }), 0);
      s += P(318, 12, '면(고저)틀림', '길이 방향 상하 요철', F.path('M330,56 Q360,36 390,56 T450,56', { w: 2.6, c: C.orange }) + line(330, 56, 452, 56, { c: C.grayM, w: 1, dash: '4 3' }), 0);
      s += P(90, 140, '줄(방향)틀림', '길이 방향 좌우 요철', F.path('M104,162 Q134,150 164,162 T224,162', { w: 2.6, c: C.orange }) + F.path('M104,190 Q134,178 164,190 T224,190', { w: 2.6, c: C.orange }), 0);
      s += P(244, 140, '평면성틀림', '탈선에 가장 위험', line(258, 186, 318, 176, { c: '#8b5e34', w: 7 }) + line(326, 172, 386, 186, { c: '#8b5e34', w: 7 }) +
        t(288, 164, 'A', { a: 'm', size: 13, b: 1 }) + t(356, 160, 'B', { a: 'm', size: 13, b: 1 }), 1);
      return F.svg(480, 270, s);
    } },

  /* ═════════════════ 선택 — 철도신호 ═════════════════ */
  sig_kinds: { cards: ['신호·전호·표지의 구분'],
    cap: '신호는 열차에게 · 전호는 사람끼리 · 표지는 누구에게나 알려 주기만',
    draw: function () {
      var s = '';
      var R = [['신호', '열차에게 「가라 / 서라」', '장내·출발신호기', C.red], ['전호', '사람 ↔ 사람 의사 전달', '출발·입환·제동시험 전호', C.blue], ['표지', '상태·위치를 알림 (지시 아님)', '열차정지표지·속도제한표지', C.green]];
      R.forEach(function (r, i) {
        var y = 16 + i * 84;
        s += box(16, y + 10, 70, 50, { fill: '#fff', c: r[3], w: 2, label: r[0], size: 18, lc: r[3], ans: true });
        s += t(100, y + 26, r[1], { size: 14, b: 1 }) + t(100, y + 48, '예) ' + r[2], { size: 13, c: C.sub });
        if (i < 2) s += line(16, y + 78, 464, y + 78, { c: C.edge, w: 1 });
      });
      /* 아이콘 */
      s += line(330, 82, 330, 40, { c: '#374151', w: 4 }) + rect(320, 22, 20, 30, '#374151', { r: 5 }) + dot(330, 30, 4, C.red) + dot(330, 43, 4, '#4b5563');
      s += arrow(344, 38, 372, 46, { head: 7, w: 1.4, c: C.red }) + car(376, 40, 84, 26, { fill: C.redL });
      s += person(350, 104, { s: 0.7 }) + person(440, 104, { s: 0.7 }) + arrow(368, 120, 422, 120, { both: true, head: 7, w: 1.6, c: C.blue });
      s += line(400, 236, 400, 206, { c: C.ink, w: 3 }) + rect(372, 184, 56, 26, '#fff', { c: C.green, w: 2, r: 4 }) + t(400, 197, '표지', { a: 'm', size: 13, b: 1, c: C.green });
      return F.svg(480, 262, s);
    } },

  signal_layout: { cards: ['신호기의 종류'],
    cap: '열차 진행 방향으로 본 신호기 배치 — 원방(장내에 종속) → 장내 → 정거장 → 출발 → 폐색 (간격은 개략)',
    draw: function () {
      function sig(x, nm, sub, col) {
        return line(x, 130, x, 76, { c: '#374151', w: 3 }) + rect(x - 9, 56, 18, 26, '#374151', { r: 4 }) + dot(x, 64, 3.5, col || C.red) + dot(x, 75, 3.5, '#4b5563') +
          t(x, 38, nm, { a: 'm', size: 14, b: 1 }) + t(x, 154, sub, { a: 'm', size: 13, c: C.sub });
      }
      var s = rect(178, 112, 132, 12, C.grayM, { c: C.sub, w: 1 }) + t(244, 102, '정거장', { a: 'm', size: 13, b: 1 });
      s += line(16, 130, 464, 130, { w: 3 });
      s += sig(52, '원방', '장내에 종속', C.orange) + sig(150, '장내', '진입 가부', C.red) + sig(336, '출발', '진출 가부', C.red) + sig(432, '폐색', '구간 진입', C.green);
      s += arrow(60, 186, 420, 186, { c: C.blue, w: 2 }) + t(240, 202, '열차 진행 방향', { a: 'm', size: 13, b: 1, c: C.blue });
      s += t(240, 226, '장내·출발·입환은 절대신호기 · 자동폐색신호기는 허용신호기', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 242, s);
    } },

  slow_signals: { cards: ['신호기의 종류'],
    cap: '임시신호기 — 선로 보수 구간 앞에서부터 서행예고 → 서행 → 서행해제 순서로 세운다',
    draw: function () {
      var s = rect(200, 92, 170, 30, C.yellowL, { c: '#a16207', w: 1.4, dash: '5 4' }) + t(285, 107, '선로 보수 구간', { a: 'm', size: 13, b: 1, c: '#a16207' });
      s += line(16, 122, 464, 122, { w: 3 });
      [[90, '서행예고', C.orange], [200, '서행', C.red], [370, '서행해제', C.green]].forEach(function (p, i) {
        s += line(p[0], 122, p[0], 70, { c: '#374151', w: 3 }) + circle(p[0], 56, 15, { fill: '#fff', c: p[2], w: 3 }) + F.num(p[0], 56, String(i + 1), { c: p[2], r: 9, size: 12 });
        s += t(p[0], 24, p[1], { a: 'm', size: 15, b: 1, c: p[2], ans: true });
      });
      s += arrow(40, 150, 440, 150, { c: C.blue, w: 2 }) + t(240, 168, '열차 진행 방향', { a: 'm', size: 13, b: 1, c: C.blue });
      return F.svg(480, 184, s);
    } },

  aspects: { cards: ['신호 현시와 다현시'],
    cap: '5현시 — 정지 · 경계 · 주의 · 감속 · 진행, 켜지는 등 색 (속도는 대표값, 선구·차종마다 다르다)',
    draw: function () {
      var A = [['정지', 'R', ['#dc2626']], ['경계', 'YY', ['#eab308', '#eab308']], ['주의', 'Y', ['#eab308']], ['감속', 'YG', ['#eab308', '#16a34a']], ['진행', 'G', ['#16a34a']]];
      var sp = ['진행 금지', '25 이하', '45 이하', '65~105 이하', '제한 없음'], s = '';
      A.forEach(function (a, i) {
        var x = 52 + i * 94;
        /* 켜진 등만 그린다 — 등의 배열 순서는 신호기마다 달라 그리지 않았다 */
        var n = a[2].length, h = n === 1 ? 50 : 80;
        s += rect(x - 22, 112 - h, 44, h, '#374151', { r: 12 });
        a[2].forEach(function (col, k) { s += circle(x, 112 - h + 25 + k * 30, 11, { fill: col, c: '#111827', w: 1 }); });
        s += line(x, 112, x, 140, { c: '#374151', w: 4 });
        s += t(x, 160, a[0] + ' (' + a[1] + ')', { a: 'm', size: 14, b: 1 });
        s += t(x, 182, sp[i], { a: 'm', size: 13, c: C.sub, ans: i > 0 && i < 4 });
      });
      s += arrow(70, 206, 410, 206, { c: C.sub, w: 1.4, head: 8 }) + t(240, 222, '느림 → 빠름', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 236, s);
    } },

  block: { cards: ['폐색 — 열차 간격을 지키는 원리'],
    cap: '폐색 — 한 구간에 한 열차만 · 고정폐색은 구간이 정해져 있고, 이동폐색은 앞 열차를 따라 간격이 움직인다',
    draw: function () {
      var s = t(16, 22, '고정폐색 — 지상에 정해진 구간', { size: 14, b: 1 });
      [16, 128, 240, 352].forEach(function (x, i) {
        s += rect(x, 40, 112, 30, i === 3 ? C.redL : C.greenL, { c: '#fff', w: 2 });
        s += line(x, 34, x, 76, { c: C.sub, w: 1.4 }) + dot(x, 34, 4, i === 3 ? C.red : (i === 2 ? C.orange : C.green));
      });
      s += line(16, 70, 464, 70, { w: 2.6 });
      s += car(380, 44, 70, 22, { fill: C.blueL }) + car(150, 44, 70, 22, { fill: C.orangeL });
      s += t(408, 92, '앞 열차', { a: 'm', size: 13 }) + t(185, 92, '뒤 열차', { a: 'm', size: 13 });
      s += t(296, 92, '비워 둔 구간', { a: 'm', size: 13, b: 1, c: C.orange });
      s += line(16, 112, 464, 112, { c: C.edge, w: 1.2 });
      s += t(16, 134, '이동폐색 — 열차 위치를 실시간으로 (무선)', { size: 14, b: 1 });
      s += line(16, 186, 464, 186, { w: 2.6 });
      s += car(380, 160, 70, 22, { fill: C.blueL }) + car(230, 160, 70, 22, { fill: C.orangeL });
      s += arrow(302, 170, 376, 170, { both: true, c: C.red, head: 8, w: 1.8 }) + t(339, 152, '안전 거리', { a: 'm', size: 13, b: 1, c: C.red });
      s += F.path('M262,154 q6,-8 12,0 M258,148 q10,-14 20,0', { c: C.blue, w: 1.6 });
      s += t(240, 216, '이동폐색이 선로용량을 가장 크게 쓴다', { a: 'm', size: 14, b: 1, c: C.blue });
      return F.svg(480, 232, s);
    } },

  block_tree: { cards: ['폐색 — 열차 간격을 지키는 원리', '철도차량운전규칙 ③ 폐색·열차제어·신호', '도시철도운전규칙'],
    cap: '폐색방식 — 상용 4 · 대용 4 · 준용 2 (단선 표시는 단선 구간에서 쓰는 것)',
    draw: function () {
      var s = box(170, 12, 140, 34, { fill: C.grayL, label: '폐색방식', size: 16 });
      var Cc = [[16, '상용 4종', '평상시', ['자동폐색식', '차내신호폐색식', '연동폐색식', '통표폐색식'], C.blue, C.blueL],
        [176, '대용 4종', '장치 고장·응급', ['지령식', '통신식', '지도통신식', '지도식'], C.orange, C.orangeL],
        [336, '준용 2종', '최후 수단', ['전령법', '격시법'], C.red, C.redL]];
      var single = { '통표폐색식': 1, '지도통신식': 1, '지도식': 1 };
      Cc.forEach(function (c) {
        s += line(240, 46, c[0] + 64, 62, { c: C.sub, w: 1.2 });
        s += box(c[0], 62, 128, 36, { fill: c[5], c: c[4], label: c[1], size: 15, lc: c[4] });
        s += t(c[0] + 64, 112, c[2], { a: 'm', size: 13, c: C.sub });
        c[3].forEach(function (it, k) {
          var y = 134 + k * 26;
          s += t(c[0] + 8, y, it, { size: 14, b: 1, ans: it === '지령식' });
          if (single[it]) s += box(c[0] + 98, y - 10, 34, 20, { fill: C.grayL, c: C.line, w: 1, r: 10, label: '단선', size: 11, b: 0 });
        });
      });
      s += line(16, 238, 464, 238, { c: C.edge, w: 1.2 });
      s += t(240, 258, '도시철도 상용폐색은 자동폐색식 · 차내신호폐색식 두 가지뿐', { a: 'm', size: 13, b: 1, c: C.purple });
      return F.svg(480, 274, s);
    } },

  track_circuit: { cards: ['궤도회로·연동장치·선로전환기'],
    cap: '궤도회로 — 열차가 없으면 계전기가 여자(진행), 차축이 두 레일을 단락하면 계전기가 낙하(정지)',
    draw: function () {
      function panel(x0, train) {
        var p = t(x0 + 108, 20, train ? '열차 있음' : '열차 없음', { a: 'm', size: 15, b: 1, c: train ? C.red : C.green });
        p += line(x0 + 20, 60, x0 + 200, 60, { w: 3 }) + line(x0 + 20, 110, x0 + 200, 110, { w: 3 });
        p += box(x0, 72, 30, 26, { fill: '#fff', c: C.ink, label: 'E', size: 13 }) + line(x0 + 15, 72, x0 + 15, 60, { w: 1.4 }) + line(x0 + 15, 98, x0 + 15, 110, { w: 1.4 });
        p += box(x0 + 186, 72, 34, 26, { fill: train ? C.redL : C.greenL, c: train ? C.red : C.green, label: 'R', size: 13 }) + line(x0 + 203, 72, x0 + 203, 60, { w: 1.4 }) + line(x0 + 203, 98, x0 + 203, 110, { w: 1.4 });
        if (!train) p += F.route([[x0 + 40, 54], [x0 + 170, 54]], { c: C.green, w: 1.6, head: 8 }) + F.route([[x0 + 170, 116], [x0 + 40, 116]], { c: C.green, w: 1.6, head: 8 });
        else {
          p += line(x0 + 100, 60, x0 + 100, 110, { c: C.ink, w: 4 }) + circle(x0 + 100, 60, 8, { fill: C.grayM, c: C.ink }) + circle(x0 + 100, 110, 8, { fill: C.grayM, c: C.ink });
          p += F.route([[x0 + 40, 54], [x0 + 92, 54]], { c: C.red, w: 1.6, head: 8 });
          p += t(x0 + 100, 134, '차축이 단락', { a: 'm', size: 13, b: 1 });
        }
        p += t(x0 + 203, 150, train ? '낙하' : '여자', { a: 'm', size: 14, b: 1, c: train ? C.red : C.green, ans: true });
        p += line(x0 + 160, 172, x0 + 160, 196, { c: '#374151', w: 3 }) + rect(x0 + 150, 156, 20, 22, '#374151', { r: 5 }) + dot(x0 + 160, 167, 5, train ? C.red : C.green);
        p += t(x0 + 130, 170, train ? '정지' : '진행', { a: 'e', size: 13, b: 1, c: train ? C.red : C.green });
        return p;
      }
      var s = panel(12, false) + panel(248, true) + line(240, 12, 240, 200, { c: C.edge, w: 1.2, dash: '5 5' });
      s += t(240, 222, '레일이 부러지거나 전원이 끊겨도 낙하 → 정지 (페일세이프)', { a: 'm', size: 13, b: 1 });
      return F.svg(480, 238, s);
    } },

  train_control: { cards: ['ATS · ATC · ATO · ATP · CBTC', '철도차량운전규칙 ③ 폐색·열차제어·신호'],
    cap: '열차제어 정보가 차로 오는 길 — ATS 지상자 · ATC 궤도회로 속도코드 · ATP 발리스 · CBTC 무선',
    draw: function () {
      var s = '';
      var R = [['ATS', '열차자동정지', '지상자를 지날 때 — 초과면 경보 → 비상제동'], ['ATC', '열차자동제어', '궤도회로로 속도코드 → 자동 감속'],
        ['ATP', '열차자동방호', '발리스 정보로 차상에서 속도 연산'], ['CBTC', '무선 기반', '무선으로 위치 교환 → 이동폐색']];
      R.forEach(function (r, i) {
        var y = 14 + i * 70;
        s += t(16, y + 18, r[0], { size: 16, b: 1, c: C.blue, ans: true }) + t(16, y + 38, r[1], { size: 13, c: C.sub });
        s += line(120, y + 46, 464, y + 46, { w: 2 });
        s += car(150, y + 20, 70, 22, { fill: C.blueL });
        if (i === 0) s += rect(300, y + 40, 24, 8, C.orange, { r: 2 }) + t(312, y + 30, '지상자', { a: 'm', size: 13, b: 1, c: C.orange });
        if (i === 1) s += F.path('M232,' + (y + 50) + ' q8,6 16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0', { c: C.orange, w: 1.6 }) + t(330, y + 30, '속도코드', { a: 'm', size: 13, b: 1, c: C.orange });
        if (i === 2) s += rect(290, y + 40, 20, 10, C.yellowL, { c: '#a16207', w: 1.4, r: 2 }) + rect(380, y + 40, 20, 10, C.yellowL, { c: '#a16207', w: 1.4, r: 2 }) + t(345, y + 30, '발리스', { a: 'm', size: 13, b: 1, c: '#a16207' });
        if (i === 3) s += F.path('M240,' + (y + 16) + ' q6,-8 12,0 M236,' + (y + 10) + ' q10,-14 20,0', { c: C.blue, w: 1.6 }) + line(420, y + 46, 420, y + 14, { c: C.ink, w: 2 }) + F.path('M408,' + (y + 12) + ' q12,-12 24,0', { c: C.blue, w: 1.6 });
        s += t(464, y + 60, r[2], { a: 'e', size: 13, c: C.sub });
      });
      s += t(240, 302, 'ATO = 자동운전 (방호장치 위에서만) · 법령의 열차제어장치는 ATS·ATC·ATP', { a: 'm', size: 13, b: 1, c: C.red });
      return F.svg(480, 318, s);
    } },

  /* ═════════════════ 선택 — 전기이론 ═════════════════ */
  series_parallel: { cards: ['직류 회로의 기본'],
    cap: '직렬은 전류가 같고 전압이 나뉜다 · 병렬은 전압이 같고 전류가 나뉜다',
    draw: function () {
      function res(x, y, vert) {
        var p = [], k;
        if (!vert) { p.push([x, y]); for (k = 0; k < 6; k++) p.push([x + 6 + k * 8, y + (k % 2 ? 7 : -7)]); p.push([x + 52, y]); }
        else { p.push([x, y]); for (k = 0; k < 6; k++) p.push([x + (k % 2 ? 7 : -7), y + 6 + k * 8]); p.push([x, y + 52]); }
        return F.poly(p, { w: 2 });
      }
      function batt(x, y) { return line(x - 12, y, x + 12, y, { w: 2.4 }) + line(x - 6, y + 8, x + 6, y + 8, { w: 2.4 }) + t(x - 18, y + 4, 'E', { a: 'e', size: 14, b: 1 }); }
      var s = t(118, 22, '직렬', { a: 'm', size: 16, b: 1 }) + t(358, 22, '병렬', { a: 'm', size: 16, b: 1 });
      /* 직렬 */
      s += line(30, 50, 60, 50) + res(60, 50) + line(112, 50, 132, 50) + res(132, 50) + line(184, 50, 206, 50) + line(206, 50, 206, 150) + line(30, 150, 206, 150);
      s += line(30, 50, 30, 96) + batt(30, 96) + line(30, 104, 30, 150);
      s += t(86, 72, 'R₁', { a: 'm', size: 14, b: 1 }) + t(158, 72, 'R₂', { a: 'm', size: 14, b: 1 });
      s += t(118, 178, 'R = R₁ + R₂', { a: 'm', size: 15, b: 1, c: C.blue });
      s += t(118, 202, '전류 같다 · 전압 나뉜다', { a: 'm', size: 13 });
      s += line(240, 36, 240, 214, { c: C.edge, w: 1.2, dash: '5 5' });
      /* 병렬 */
      s += line(270, 50, 400, 50) + line(270, 150, 400, 150) + line(270, 50, 270, 96) + batt(270, 96) + line(270, 104, 270, 150);
      s += line(340, 50, 340, 74) + res(340, 74, 1) + line(340, 126, 340, 150) + line(400, 50, 400, 74) + res(400, 74, 1) + line(400, 126, 400, 150);
      s += t(322, 100, 'R₁', { a: 'e', size: 14, b: 1 }) + t(418, 100, 'R₂', { size: 14, b: 1 });
      s += t(358, 178, '1/R = 1/R₁ + 1/R₂', { a: 'm', size: 15, b: 1, c: C.blue });
      s += t(358, 202, '전압 같다 · 전류 나뉜다', { a: 'm', size: 13 });
      return F.svg(480, 220, s);
    } },

  kirchhoff: { cards: ['직류 회로의 기본'],
    cap: '키르히호프 — 제1법칙: 들어온 전류 합 = 나간 전류 합 · 제2법칙: 기전력 합 = 전압강하 합',
    draw: function () {
      var s = t(118, 22, '제1법칙 (전류)', { a: 'm', size: 15, b: 1 });
      s += circle(118, 100, 7, { fill: C.ink, c: C.ink });
      s += arrow(40, 60, 110, 96, { c: C.blue, w: 2 }) + arrow(40, 140, 110, 104, { c: C.blue, w: 2 }) + arrow(126, 100, 206, 100, { c: C.orange, w: 2 });
      s += t(44, 48, 'I₁', { size: 15, b: 1, c: C.blue }) + t(44, 156, 'I₂', { size: 15, b: 1, c: C.blue }) + t(196, 84, 'I₃', { a: 'e', size: 15, b: 1, c: C.orange });
      s += t(118, 190, 'I₁ + I₂ = I₃', { a: 'm', size: 16, b: 1 });
      s += line(240, 36, 240, 204, { c: C.edge, w: 1.2, dash: '5 5' });
      s += t(358, 22, '제2법칙 (전압)', { a: 'm', size: 15, b: 1 });
      s += rect(290, 50, 140, 100, 'none', { c: C.ink, w: 2 });
      s += rect(330, 42, 52, 16, '#fff', { c: C.ink, w: 2 }) + rect(422, 76, 16, 48, '#fff', { c: C.ink, w: 2 });
      s += line(278, 96, 302, 96, { w: 2.4 }) + line(284, 104, 296, 104, { w: 2.4 });
      s += t(272, 100, 'E', { a: 'e', size: 15, b: 1 }) + t(356, 74, 'V₁', { a: 'm', size: 14, b: 1, c: C.orange }) + t(412, 100, 'V₂', { a: 'e', size: 14, b: 1, c: C.orange });
      s += t(358, 190, 'E = V₁ + V₂', { a: 'm', size: 16, b: 1 });
      return F.svg(480, 214, s);
    } },

  sine: { cards: ['교류 회로'],
    cap: '교류 — 실효값 = 최댓값 ÷ √2 ≒ 0.707 × 최댓값 · 주기 T = 1/f (우리나라 60Hz)',
    draw: function () {
      var x0 = 60, w = 360, y0 = 120, A = 80, p = [];
      for (var i = 0; i <= 72; i++) { var a = i / 72 * 2 * Math.PI; p.push([x0 + w * i / 72, y0 - A * Math.sin(a)]); }
      var s = line(x0, y0, x0 + w + 20, y0, { w: 1.4 }) + line(x0, 24, x0, 216, { w: 1.4 });
      s += F.poly(p, { c: C.blue, w: 2.6 });
      s += line(x0, y0 - A, x0 + w / 4, y0 - A, { c: C.sub, w: 1, dash: '4 3' }) + t(x0 - 6, y0 - A, 'Vm', { a: 'e', size: 14, b: 1 });
      s += line(x0, y0 - A * 0.707, x0 + w + 10, y0 - A * 0.707, { c: C.orange, w: 1.6, dash: '6 4' }) + t(x0 - 6, y0 - A * 0.707 + 4, '실효값', { a: 'e', size: 13, b: 1, c: C.orange });
      s += t(x0 + w + 12, y0 - A * 0.707 - 12, '0.707 Vm', { a: 'e', size: 14, b: 1, c: C.orange, ans: true });
      s += F.dim(x0, 200, x0 + w, 200, '주기 T', { size: 14 });
      s += t(240, 236, '평균값 = 최댓값 × 2/π ≒ 0.637', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 252, s);
    } },

  phase: { cards: ['교류 회로'],
    cap: '위상 — R 은 전압·전류가 같이(동상), L 은 전류가 90° 뒤지고, C 는 전류가 90° 앞선다',
    draw: function () {
      var s = line(30, 172, 90, 172, { c: C.blue, w: 2.4 }) + t(96, 172, '전압', { size: 13, b: 1, c: C.blue }) +
        line(160, 172, 220, 172, { c: C.orange, w: 2.4, dash: '6 4' }) + t(226, 172, '전류', { size: 13, b: 1, c: C.orange });
      function wave(x0, sh, c, dash) {
        var p = [];
        for (var i = 0; i <= 48; i++) { var a = i / 48 * 2 * Math.PI; p.push([x0 + 120 * i / 48, 90 - 38 * Math.sin(a - sh)]); }
        return F.poly(p, { c: c, w: 2.2, dash: dash });
      }
      [['R (저항)', 0, '동상'], ['L (코일)', Math.PI / 2, '전류가 90° 뒤짐'], ['C (콘덴서)', -Math.PI / 2, '전류가 90° 앞섬']].forEach(function (k, i) {
        var x0 = 20 + i * 152;
        s += line(x0, 90, x0 + 126, 90, { c: C.grayM, w: 1 });
        s += wave(x0, 0, C.blue) + wave(x0, k[1], C.orange, '6 4');
        s += t(x0 + 60, 24, k[0], { a: 'm', size: 15, b: 1 }) + t(x0 + 60, 146, k[2], { a: 'm', size: 13, b: 1, c: i ? C.red : C.green, ans: i > 0 });
      });
      return F.svg(480, 192, s);
    } },

  fleming: { cards: ['전자기와 기기'],
    cap: '플레밍의 법칙 — 왼손은 전동기(힘), 오른손은 발전기(유도기전력) · 엄지·검지·중지가 서로 직각',
    draw: function () {
      function triad(cx, cy, mirror, labels, title, col) {
        var d = mirror ? -1 : 1, p = t(cx, 22, title, { a: 'm', size: 15, b: 1, c: col });
        p += arrow(cx, cy, cx, cy - 92, { c: C.red, w: 3 }) + t(cx + 8, cy - 92, labels[0], { size: 13, b: 1, c: C.red });
        p += arrow(cx, cy, cx + d * 96, cy, { c: C.blue, w: 3 }) + t(cx + d * 96, cy + 18, labels[1], { a: mirror ? 's' : 'e', size: 13, b: 1, c: C.blue });
        p += arrow(cx, cy, cx - d * 62, cy + 52, { c: C.green, w: 3 }) + t(cx - d * 62, cy + 70, labels[2], { a: 'm', size: 13, b: 1, c: C.green });
        p += circle(cx, cy, 5, { fill: C.ink, c: C.ink });
        return p;
      }
      var s = triad(110, 132, false, ['엄지 F (힘)', '검지 B (자속)', '중지 I (전류)'], '왼손 — 전동기', C.blue);
      s += line(240, 14, 240, 226, { c: C.edge, w: 1.2, dash: '5 5' });
      s += triad(370, 132, true, ['엄지 (운동)', '검지 B (자속)', '중지 (기전력)'], '오른손 — 발전기', C.orange);
      return F.svg(480, 236, s);
    } },

  transformer: { cards: ['전자기와 기기'],
    cap: '변압기 — 전압은 권수에 비례, 전류는 권수에 반비례 · V₁/V₂ = N₁/N₂ = I₂/I₁ = a',
    draw: function () {
      var s = rect(160, 40, 160, 130, 'none', { c: C.sub, w: 14 });
      function coil(x, n, c) { var p = ''; for (var k = 0; k < n; k++) p += '<ellipse cx="' + x + '" cy="' + (62 + k * (86 / (n - 1))) + '" rx="16" ry="6" fill="none" stroke="' + c + '" stroke-width="2.4"/>'; return p; }
      s += coil(160, 7, C.blue) + coil(320, 4, C.orange);
      s += line(60, 62, 144, 62, { c: C.blue, w: 2 }) + line(60, 148, 144, 148, { c: C.blue, w: 2 });
      s += line(336, 62, 420, 62, { c: C.orange, w: 2 }) + line(336, 148, 420, 148, { c: C.orange, w: 2 });
      s += t(60, 106, 'V₁', { size: 17, b: 1, c: C.blue }) + t(420, 106, 'V₂', { a: 'e', size: 17, b: 1, c: C.orange });
      s += t(110, 30, '1차 N₁ (많이 감음)', { a: 'm', size: 13, b: 1, c: C.blue }) + t(370, 30, '2차 N₂', { a: 'm', size: 13, b: 1, c: C.orange });
      s += t(240, 106, '철심', { a: 'm', size: 13, c: C.sub });
      s += t(240, 200, 'V₁/V₂ = N₁/N₂ = I₂/I₁ = a', { a: 'm', size: 17, b: 1 });
      s += t(240, 226, '철손 = 동손 일 때 효율 최대', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 242, s);
    } },

  /* ═════════════════ 선택 — 열차운전 ═════════════════ */
  push_back: { cards: ['철도차량운전규칙 ② 운전', '열차와 운전의 기본 용어'],
    cap: '운전위치 — 원칙은 맨 앞 차량의 운전실 · 추진운전과 퇴행운전은 속도를 제한한다',
    draw: function () {
      function row(y, title, sub, locoFront, dir, col) {
        var p = t(16, y + 4, title, { size: 15, b: 1, c: col }) + t(16, y + 24, sub, { size: 13, c: C.sub });
        var x = 170;
        for (var k = 0; k < 3; k++) p += car(x + k * 96, y - 12, 90, 30, { fill: (locoFront ? (k === 2) : (k === 0)) ? C.orangeL : C.grayL });
        var cab = locoFront ? 170 + 2 * 96 + 70 : 170 + 12;
        p += circle(cab, y - 2, 6, { fill: C.red, c: C.red });
        p += dir > 0 ? arrow(250, y + 40, 420, y + 40, { c: col, w: 2.2 }) : arrow(420, y + 40, 250, y + 40, { c: col, w: 2.2 });
        return p;
      }
      var s = row(30, '보통 운전', '맨 앞 운전실에서', true, 1, C.green);
      s += row(108, '추진운전', '뒤에서 밀고 간다', false, 1, C.orange);
      s += row(186, '퇴행운전', '뒤로 간다 (원칙 금지)', true, -1, C.red);
      s += circle(176, 248, 6, { fill: C.red, c: C.red }) + t(188, 248, '= 운전하는 자리', { size: 13 });
      s += rect(300, 240, 20, 14, C.orangeL, { c: C.ink, w: 1 }) + t(326, 248, '= 동력차', { size: 13 });
      return F.svg(480, 264, s);
    } },

  traction3: { cards: ['견인력·저항·균형속도'],
    cap: '견인력 3단계 — 지시견인력 > 동륜주견인력 > 인장봉견인력(= 동륜주견인력 − 기관차 자신의 저항)',
    draw: function () {
      var s = '';
      var R = [['지시견인력', '전동기가 내는 이론상의 힘', 400, C.grayL, C.sub], ['동륜주견인력', '동륜 답면에 나타나는 실제 힘', 330, C.blueL, C.blue], ['인장봉견인력', '실제로 끌 수 있는 힘', 260, C.greenL, C.green]];
      R.forEach(function (r, i) {
        var y = 20 + i * 60;
        s += rect(16, y, r[2], 34, r[3], { c: r[4], w: 1.6, r: 4 }) + t(26, y + 17, r[0], { size: 15, b: 1, c: r[4] === C.sub ? C.ink : r[4], halo: false });
        s += t(20, y + 48, r[1], { size: 13, c: C.sub });
      });
      s += F.path('M276,140 H346', { c: C.red, w: 2, dash: '4 3' }) + arrow(346, 157, 276, 157, { c: C.red, w: 1.6, head: 8 });
      s += t(354, 152, '기관차 자신의 저항', { size: 13, b: 1, c: C.red });
      s += line(16, 204, 464, 204, { c: C.edge, w: 1.2 });
      s += t(240, 224, '견인력의 상한 = 점착력 (넘으면 공전)', { a: 'm', size: 14, b: 1, c: C.orange });
      return F.svg(480, 240, s);
    } },

  balance_speed: { cards: ['견인력·저항·균형속도'],
    cap: '균형속도 — 견인력과 열차저항이 같아져 가속도가 0 이 되는 속도 (곡선 모양은 개념)',
    draw: function () {
      var s = arrow(60, 200, 460, 200, { w: 1.6, head: 9 }) + arrow(60, 200, 60, 20, { w: 1.6, head: 9 });
      s += t(460, 220, '속도', { a: 'e', size: 14, b: 1 }) + t(70, 26, '힘', { size: 14, b: 1 });
      s += F.path('M64,44 C160,48 260,90 440,150', { c: C.blue, w: 3 }) + t(150, 36, '견인력', { size: 15, b: 1, c: C.blue });
      s += F.path('M64,186 C200,180 300,150 440,60', { c: C.red, w: 3 }) + t(400, 54, '열차저항', { a: 'e', size: 15, b: 1, c: C.red });
      s += circle(326, 120, 7, { fill: C.orange, c: C.orange }) + line(326, 126, 326, 200, { c: C.orange, w: 1.6, dash: '5 4' });
      s += t(326, 220, '균형속도', { a: 'm', size: 15, b: 1, c: C.orange, ans: true });
      s += t(170, 140, '견인력 > 저항 → 가속', { a: 'm', size: 13, c: C.green, b: 1 });
      return F.svg(480, 236, s);
    } },

  brake_dist: { cards: ['제동과 운전선도'],
    cap: '제동거리 = 공주거리 + 실제동거리 · 공주거리는 속도에 비례, 실제동거리는 속도의 제곱에 비례',
    draw: function () {
      var s = pin(40, 70, 40, C.ink) + t(40, 26, '제동 취급', { a: 'm', size: 13, b: 1 });
      s += rect(40, 54, 120, 30, C.grayM, { c: C.sub, w: 1.2 }) + t(100, 69, '공주거리', { a: 'm', size: 14, b: 1, halo: false });
      s += rect(160, 54, 240, 30, C.redL, { c: C.red, w: 1.2 }) + t(280, 69, '실제동거리', { a: 'm', size: 14, b: 1, c: C.red, halo: false });
      s += pin(400, 70, 40, C.red) + t(400, 26, '정지', { a: 'm', size: 13, b: 1, c: C.red });
      s += F.dim(40, 96, 400, 96, '제동거리', { size: 14, off: -10 });
      s += t(100, 136, '그대로 달린 거리', { a: 'm', size: 13, c: C.sub });
      s += t(240, 164, '예) 72km/h = 20m/s · 공주시간 3초 → 공주거리 60m', { a: 'm', size: 13, b: 1 });
      s += line(16, 182, 464, 182, { c: C.edge, w: 1.2 });
      s += t(16, 204, '속도 2배', { size: 14, b: 1 });
      s += rect(96, 192, 60, 22, C.grayM) + rect(156, 192, 240, 22, C.redL, { c: C.red, w: 1 });
      s += t(126, 236, '공주 2배', { a: 'm', size: 13 }) + t(276, 236, '실제동 약 4배', { a: 'm', size: 13, b: 1, c: C.red });
      return F.svg(480, 252, s);
    } },

  run_curve: { cards: ['제동과 운전선도'],
    cap: '운전선도 — 역행(가속) → 타행(관성 주행) → 제동 · 타행이 에너지 절약의 핵심 (모양은 개념)',
    draw: function () {
      var s = arrow(40, 190, 464, 190, { w: 1.6, head: 9 }) + arrow(40, 190, 40, 20, { w: 1.6, head: 9 });
      s += t(464, 210, '거리', { a: 'e', size: 14, b: 1 }) + t(50, 26, '속도', { size: 14, b: 1 });
      s += F.path('M40,190 C80,100 120,70 170,62', { c: C.orange, w: 3.4 });
      s += F.path('M170,62 L340,84', { c: C.blue, w: 3.4 });
      s += F.path('M340,84 C380,100 410,150 430,190', { c: C.red, w: 3.4 });
      s += t(110, 150, '역행', { a: 'm', size: 16, b: 1, c: C.orange }) + t(110, 170, '동력 ON · 가속', { a: 'm', size: 13 });
      s += t(255, 110, '타행', { a: 'm', size: 16, b: 1, c: C.blue, ans: true }) + t(255, 130, '동력 OFF · 관성', { a: 'm', size: 13 });
      s += t(372, 150, '제동', { a: 'm', size: 16, b: 1, c: C.red });
      s += t(40, 208, '출발역', { a: 'm', size: 13, c: C.sub }) + t(430, 208, '도착역', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 222, s);
    } }
  };
})();
