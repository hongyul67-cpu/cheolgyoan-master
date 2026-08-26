# 교재 기출문제(_src/bank-*.js) -> 암호화(bank.enc)
#
#   python build_bank.py
#
# 왜 이렇게 하나:
#   교재 전사분은 저작물이라 그대로 올릴 수 없다.
#   정적 호스팅(GitHub Pages)에서는 "화면에 비밀번호 입력칸"을 두어도 보호가 되지 않는다.
#   데이터 파일 주소를 직접 치면 그대로 받아지기 때문이다.
#   그래서 문항 자체를 AES-GCM 으로 암호화해서 올리고, 브라우저에서 WebCrypto 로 푼다.
#
# 암호가 두 종류인 이유:
#   교사용 - 문구형, 만료 없음.
#   학생용 - 8자리 숫자, 그 주 월요일 ~ 다음 월요일 7일만.
#   본문은 임의의 내용키(CK)로 한 번 암호화하고, CK 를 암호마다 따로 감싼다.
#   감싼 것들은 순서를 섞어 어느 것이 교사용인지 알 수 없다.
#
#   시크릿·기준일·접두어·교사용 암호는 _weekly/secret.json 에 모아 두고
#   모든 도구가 함께 쓴다. 그래서 어느 도구에서든 같은 8자리가 통하고,
#   다시 빌드해도 코드가 바뀌지 않는다.
#
# ⚠️ 평문 _src/ 는 .gitignore 에 있다. 절대 커밋하지 말 것.
#    암호를 이 스크립트에 적어 두지 말 것 - 공개 저장소에 그대로 남는다.
import io, os, re, json, gzip, base64, argparse, sys, subprocess, tempfile, secrets, glob
from datetime import date
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "_weekly"))
import weekly                                   # 도구 공용 주간 코드

ITER = 200_000
SRC = os.path.join(HERE, "_src")


def eval_bank():
    """_src/bank-*.js 를 순서대로 실행해 문항 배열을 JSON 으로 뽑는다."""
    files = sorted(glob.glob(os.path.join(SRC, "bank-*.js")))
    if not files:
        raise SystemExit("_src/bank-*.js 가 없습니다.")
    parts = ["global.window = global.window || {};"]
    for f in files:
        parts.append("(function(){%s})();" % io.open(f, encoding="utf-8").read())
    parts.append("process.stdout.write(JSON.stringify(global.window.BANK));")
    with tempfile.NamedTemporaryFile("w", suffix=".js", dir=HERE, delete=False, encoding="utf-8") as fh:
        fh.write("\n".join(parts))
        tmp = fh.name
    try:
        r = subprocess.run(["node", tmp], capture_output=True, text=True, encoding="utf-8", cwd=HERE)
        if r.returncode:
            raise SystemExit("node 평가 실패:\n" + r.stderr)
        return r.stdout, len(files)
    finally:
        os.remove(tmp)


def check(bank):
    """전사 실수를 빌드 단계에서 잡는다 - 배포 뒤에 발견하면 늦다."""
    bad = []
    seen = set()
    for x in bank:
        key = (x.get("b"), x.get("ch"), x.get("n"))
        if key in seen:
            bad.append("중복 %s" % (key,))
        seen.add(key)
        if not x.get("q") or not x.get("why"):
            bad.append("지문/해설 없음 %s" % (key,))
        c = x.get("c")
        if not isinstance(c, list) or len(c) != 4:
            bad.append("보기 4개 아님 %s" % (key,))
        a = x.get("a")
        a = a if isinstance(a, list) else [a]
        if any((not isinstance(v, int)) or v < 0 or v > 3 for v in a):
            bad.append("정답 범위 %s" % (key,))
    if bad:
        raise SystemExit("문항 오류:\n  " + "\n  ".join(bad[:20]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pw", default=None,
                    help="교사용 암호. 생략하면 _weekly/secret.json 의 teacher_pw 를 쓴다")
    a = ap.parse_args()

    cfg = weekly.load()
    pw = a.pw or cfg.get("teacher_pw")
    if not pw:
        raise SystemExit("교사용 암호를 찾을 수 없습니다 (--pw 또는 secret.json teacher_pw)")
    start = date.fromisoformat(cfg["epoch"])
    nweeks = cfg["weeks"]

    payload, nfiles = eval_bank()
    bank = json.loads(payload)
    check(bank)

    raw = payload.encode("utf-8")
    gz = gzip.compress(raw, 9)

    # 1) 문항을 임의의 내용키(CK)로 한 번만 암호화
    CK = secrets.token_bytes(32)
    nonce = secrets.token_bytes(12)
    body = nonce + AESGCM(CK).encrypt(nonce, gz, None)

    # 2) 암호마다 CK 를 감싼다 (salt 를 공유해 해제 시 PBKDF2 는 딱 1회)
    salt = secrets.token_bytes(16)
    MASTER = base64.b64decode(cfg["secret"])     # 도구 공용 - 새로 만들지 않는다

    def derive(p):
        return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32,
                          salt=salt, iterations=ITER).derive(p.encode("utf-8"))

    def wrap(p, info):
        iv = secrets.token_bytes(12)
        blob = AESGCM(derive(p)).encrypt(iv, json.dumps(info).encode("utf-8"), None)
        return {"iv": base64.b64encode(iv).decode(),
                "blob": base64.b64encode(blob).decode()}

    ck_b64 = base64.b64encode(CK).decode()
    keys = [wrap(pw, {"ck": ck_b64, "exp": None, "role": "teacher", "label": "교사용",
                      "ms": base64.b64encode(MASTER).decode(),
                      "epoch": start.isoformat(), "weeks": nweeks,
                      "prefix": cfg["prefix"]})]

    print("  키 감싸기 교사용 1개 + 학생용 %d주치 ..." % nweeks, end="", flush=True)
    sheet = weekly.weeks(cfg)
    for n, d0, d1, c in sheet:
        keys.append(wrap(c, {"ck": ck_b64, "nbf": d0.isoformat(), "exp": d1.isoformat(),
                             "role": "student", "label": d0.isoformat()}))
    print(" 완료")
    secrets.SystemRandom().shuffle(keys)         # 어느 것이 교사용인지 감춘다

    build_id = secrets.token_hex(4)
    io.open(os.path.join(HERE, "bank.enc"), "w", encoding="utf-8").write(json.dumps({
        "v": 2, "cipher": "AES-GCM", "gz": True, "build": build_id,
        "count": len(bank),
        "kdf": {"name": "PBKDF2", "hash": "SHA-256", "iter": ITER,
                "salt": base64.b64encode(salt).decode()},
        "data": base64.b64encode(body).decode(),
        "keys": keys,
    }))

    # past.html 이 부르는 lock.js 주소에 빌드 표식을 박는다.
    # 안 하면 브라우저가 옛 lock.js 를 캐시에서 꺼내 쓴다.
    fp = os.path.join(HERE, "past.html")
    if os.path.exists(fp):
        html = io.open(fp, encoding="utf-8").read()
        fixed = re.sub(r"lock\.js\?v=[A-Za-z0-9]*", "lock.js?v=" + build_id, html)
        if fixed != html:
            io.open(fp, "w", encoding="utf-8").write(fixed)
        # 화면 파일에 문항이 새어 나가지 않았는지 스스로 확인한다
        for x in bank[:30]:
            if x["q"][:18] in fixed:
                raise SystemExit("past.html 에 문항이 남아 있습니다: " + x["q"][:30])

    per = {}
    for x in bank:
        per["%s %d장" % (x["b"], x["ch"])] = per.get("%s %d장" % (x["b"], x["ch"]), 0) + 1
    print("  원본 %d파일 · 문항 %d개 · %dKB -> gzip %dKB -> bank.enc %dKB"
          % (nfiles, len(bank), len(raw) // 1024, len(gz) // 1024,
             os.path.getsize(os.path.join(HERE, "bank.enc")) // 1024))
    for k in sorted(per):
        print("    %-22s %3d문항" % (k, per[k]))
    cur = weekly.this_week(cfg)
    print("")
    print("  교사용 암호 : (secret.json 의 teacher_pw)   만료 없음")
    print("  학생 코드   : %d주치  %s ~ %s  (도구 공용)" % (nweeks, start, sheet[-1][2]))
    if cur:
        print("  이번 주 코드: %s %s   (%s ~ %s)" % (cur[3][:4], cur[3][4:], cur[1], cur[2]))
    print("  빌드 표식   : %s" % build_id)


if __name__ == "__main__":
    main()
