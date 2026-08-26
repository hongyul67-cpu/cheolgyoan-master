/* =========================================================
   철교안 마스터 — 교재 기출문제 잠금 해제

   교재 전사분은 저작물이라 그대로 올릴 수 없다.
   정적 호스팅에서는 "화면에 비밀번호 칸"만 두면 보호가 되지 않는다.
   주소를 직접 치면 데이터 파일이 그대로 받아지기 때문이다.
   그래서 문항(bank.enc)을 실제로 AES-GCM 으로 암호화해서 올리고,
   여기서 WebCrypto 로 푼다. 암호가 틀리면 복호화가 실패한다.

   암호는 두 종류다 (수업용).
     교사용 — 문구형, 만료 없음. 열면 그 주 학생 코드가 화면에 나온다.
     학생용 — 8자리 숫자, 그 주 월요일 ~ 다음 월요일 7일만.
   본문은 내용키(CK) 하나로 암호화돼 있고, CK 가 암호마다 따로 감싸여 있다.
   기간은 암호문 안에 박혀 있어 화면이나 이 파일을 고쳐도 넘길 수 없다.
   ========================================================= */
window.BankLock = (function () {
  /* 저장 키가 두 개다.
       LS_OWN    이 도구에서 성공한 암호
       LS_SHARED 도구 전체 공용 — 도구가 모두 hongyul67-cpu.github.io 한 곳에 있어
                 localStorage 를 공유하므로, 어디서든 한 번 열면 나머지도 그냥 열린다.
     실패해도 공용 키는 지우지 않는다. 이 도구에서 안 맞는 암호가
     다른 도구에서는 맞을 수 있어, 지우면 남의 기억까지 날리게 된다.
     기간이 있는 학생 코드는 공용 키에 넣지 않는다 — 다른 도구가 만료된 것을 물게 된다. */
  var LS_OWN = 'cgm_pw_v1';
  var LS_SHARED = 'hong_pw_v1';

  var onOpen = null;
  var info = null;      // 열어 준 암호의 정보 (역할·기간)
  var encCache = null;

  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function $(id) { return document.getElementById(id); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function monday(d) { var x = new Date(d); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function pretty(c) { return c.slice(0, 4) + ' ' + c.slice(4); }

  function getEnc() {
    if (encCache) return Promise.resolve(encCache);
    return fetch('bank.enc', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('bank.enc 없음'); return r.json(); })
      .then(function (j) { encCache = j; return j; });
  }

  /* 감싼 키들을 한꺼번에 풀어 본다. 260개를 순차로 하면 느려서 못 쓴다. */
  function tryPw(enc, pw) {
    var k = enc.kdf;
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: b64(k.salt), iterations: k.iter, hash: k.hash },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) {
        return Promise.all(enc.keys.map(function (e) {
          return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(e.iv) }, key, b64(e.blob))
            .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); })
            .catch(function () { return null; });
        }));
      })
      .then(function (all) {
        var hit = all.filter(Boolean)[0];
        if (!hit) return { ok: false, why: 'bad' };
        var today = iso(new Date());
        if (hit.nbf && today < hit.nbf) return { ok: false, why: 'early', nbf: hit.nbf };
        if (hit.exp && today >= hit.exp) return { ok: false, why: 'late', exp: hit.exp };
        return { ok: true, info: hit };
      });
  }

  function decryptBody(enc, ckB64) {
    var raw = b64(enc.data);
    return crypto.subtle.importKey('raw', b64(ckB64), 'AES-GCM', false, ['decrypt'])
      .then(function (ck) {
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12) }, ck, raw.slice(12));
      })
      .then(function (buf) {
        var bytes = new Uint8Array(buf);
        if (!enc.gz) return new TextDecoder().decode(bytes);
        var ds = new DecompressionStream('gzip');
        var w = ds.writable.getWriter(); w.write(bytes); w.close();
        return new Response(ds.readable).text();
      })
      .then(function (txt) { return JSON.parse(txt); });
  }

  /* 교사용으로 열었을 때만 그 주 학생 코드를 계산해 보여준다.
     마스터 시크릿이 교사용 wrapper 안에만 있어 학생 코드로는 계산할 수 없다. */
  function codeFor(ms, prefix, mon) {
    return crypto.subtle.importKey('raw', b64(ms), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(function (k) { return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(prefix + iso(mon))); })
      .then(function (sig) {
        var u = new Uint8Array(sig);
        var v = ((u[0] << 24) >>> 0) + (u[1] << 16) + (u[2] << 8) + u[3];
        return String(v % 90000000 + 10000000);
      });
  }

  function paintTeacher() {
    var box = $('lkTeach');
    if (!box || !info || info.role !== 'teacher' || !info.ms) return;
    var mon = monday(new Date());
    codeFor(info.ms, info.prefix, mon).then(function (c) {
      box.style.display = 'block';
      box.innerHTML =
        '<div class="lk-tt">이번 주 학생 코드</div>' +
        '<div class="lk-code">' + pretty(c) + '</div>' +
        '<div class="lk-sub">' + iso(mon) + ' ~ ' + iso(addDays(mon, 7)) + ' (7일)</div>' +
        '<button class="btn ghost" id="lkCopy">코드 복사</button>';
      $('lkCopy').onclick = function () {
        navigator.clipboard.writeText(c).then(function () { $('lkCopy').textContent = '복사됨 ✓'; });
      };
    });
  }

  function open(pw, remember) {
    var msg = $('lkMsg');
    if (msg) { msg.textContent = '여는 중…'; msg.className = 'lk-msg'; }
    return getEnc().then(function (enc) {
      return tryPw(enc, pw).then(function (res) {
        if (!res.ok) {
          if (msg) {
            msg.className = 'lk-msg bad';
            msg.textContent = res.why === 'early' ? '아직 쓸 수 없는 코드입니다 (' + res.nbf + '부터)'
              : res.why === 'late' ? '사용 기간이 끝난 코드입니다 (' + res.exp + '까지)'
                : '암호가 맞지 않습니다.';
          }
          return false;
        }
        info = res.info;
        return decryptBody(enc, info.ck).then(function (bank) {
          if (remember !== false) {
            try {
              localStorage.setItem(LS_OWN, pw);
              if (info.role === 'teacher') localStorage.setItem(LS_SHARED, pw);
            } catch (e) {}
          }
          if (msg) { msg.className = 'lk-msg ok'; msg.textContent = bank.length + '문항 해제됨'; }
          var gate = $('lkGate'); if (gate) gate.style.display = 'none';
          paintTeacher();
          if (onOpen) onOpen(bank, info);
          return true;
        });
      });
    }).catch(function (e) {
      if (msg) { msg.className = 'lk-msg bad'; msg.textContent = '오류: ' + e.message; }
      return false;
    });
  }

  function relock() {
    try { localStorage.removeItem(LS_OWN); } catch (e) {}
    history.scrollRestoration = 'manual';
    location.reload();
  }

  function boot(cb) {
    onOpen = cb;
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    var btn = $('lkGo'), inp = $('lkPw');
    if (btn) btn.onclick = function () { open(inp.value.trim()); };
    if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
    /* 이 도구 것 → 공용 것 순서로 조용히 시도 */
    var saved = [];
    try {
      var a = localStorage.getItem(LS_OWN); if (a) saved.push(a);
      var b = localStorage.getItem(LS_SHARED); if (b && b !== a) saved.push(b);
    } catch (e) {}
    (function next(i) {
      if (i >= saved.length) return;
      open(saved[i], false).then(function (ok) { if (!ok) next(i + 1); });
    })(0);
  }

  return { boot: boot, open: open, relock: relock, who: function () { return info; } };
})();
