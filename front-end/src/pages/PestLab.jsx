import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import "./PestLab.css";

/*
 * 홈 섹션 6 의 해충 그림을 눌러야만 닿는 이스터 에그 페이지 (/pest).
 * 내비게이션·푸터 어디에도 링크가 없다.
 *
 * 그림 자체는 평면 이미지라 3D 정보가 없어서, 같은 형태를 기본 도형으로
 * 다시 조립했다. 모델 파일이 없으니 내려받을 것도 없다.
 *   몸통 SphereGeometry · 가시 LatheGeometry(피보나치 분포, 앞면은 얼굴이라 비움)
 *   팔 TubeGeometry(armCurve 로 좌우 대칭) · 금지 표시 Torus + Cylinder
 *
 * ── 손댈 때 지킬 것 ──────────────────────────────────────────────────
 *
 * 1. main.jsx 의 lazy() 를 유지한다.
 *    three.js 는 gzip 137KB 다. static import 로 바꾸면 홈 첫 진입 번들에
 *    섞인다. 지금은 이 페이지에 들어온 사람만 내려받는다.
 *
 * 2. 환경맵은 RoomEnvironment 로 "생성"한다. HDRI 파일을 받지 않으므로
 *    네트워크 요청이 늘지 않는다. 링의 광택은 조명이 아니라 이 반사에서
 *    나오므로 빼면 재질이 밋밋해진다.
 *
 * 3. 언마운트 시 dispose() 를 빠뜨리지 않는다. WebGL 자원은 GC 가 회수하지
 *    않는다. 뒤로가기 후 document.querySelectorAll('canvas').length 가 0
 *    인지로 확인할 수 있다.
 *
 * 4. PestLab.css 의 touch-action: pan-y 를 none 으로 바꾸지 않는다.
 *    무대가 화면을 거의 채우므로 none 이면 그 위에서 페이지 스크롤이 막힌다.
 *
 * 5. 카메라는 화면비에 따라 position.z 를 물린다. 세로 화각이 고정이라
 *    폭이 좁아지면 좌우가 잘리기 때문이다 (resize 참고).
 *
 * 6. prefers-reduced-motion 이면 자동 회전을 하지 않는다.
 *
 * 7. <canvas> 에는 대체 텍스트가 없으므로 role="img" + aria-label 을 유지한다.
 */

const RING_LIGHT = new THREE.Color("#ef97c0");
const RING_DARK = new THREE.Color("#d0208c");
const BODY_COLOR = "#2c22c4";

/* 토러스·원기둥에 대각선 그라디언트를 정점 색으로 구워 넣는다.
   표준 머티리얼은 그라디언트를 직접 받지 못한다. */
function bakeGradient(geo) {
  const dir = new THREE.Vector3(-1, 1, 0.3).normalize();
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const proj = [];
  let min = Infinity;
  let max = -Infinity;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const d = v.fromBufferAttribute(pos, i).dot(dir);
    proj.push(d);
    if (d < min) min = d;
    if (d > max) max = d;
  }
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.copy(RING_DARK).lerp(RING_LIGHT, (proj[i] - min) / (max - min || 1));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

/* 끝이 부드러운 가시. 단순 원뿔은 바늘처럼 날카로워 원본과 다르다. */
function spikeGeometry(radius, height, bulge = 0.12) {
  const steps = 14;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = radius * Math.cos(t * Math.PI * 0.5) ** (1 - bulge);
    pts.push(new THREE.Vector2(Math.max(r, 0.001), t * height));
  }
  const g = new THREE.LatheGeometry(pts, 20);
  g.computeVertexNormals();
  return g;
}

const PestLab = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // 정리 대상을 모아 둔다. WebGL 자원은 GC 가 회수하지 않는다.
    const disposables = [];
    const track = (o) => {
      disposables.push(o);
      return o;
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    mount.appendChild(renderer.domElement);

    /* 링의 광택은 조명이 아니라 주변 반사다. 환경맵을 코드로 만들어 쓰므로
       추가로 내려받는 이미지가 없다. */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x2a2050, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.55);
    key.position.set(-4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff9ad5, 1.1);
    rim.position.set(2, 3, -6);
    scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);

    // ---------------------------------------------------------- 벌레
    const bodyMat = track(
      new THREE.MeshPhysicalMaterial({
        color: BODY_COLOR,
        roughness: 0.42,
        metalness: 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.45,
        sheen: 0.3,
        sheenRoughness: 0.75,
        sheenColor: new THREE.Color("#5b62d8"),
        envMapIntensity: 0.3,
      }),
    );
    const bug = new THREE.Group();
    bug.add(new THREE.Mesh(track(new THREE.SphereGeometry(1, 64, 48)), bodyMat));

    const spikeGeo = track(spikeGeometry(0.25, 0.54));
    const up = new THREE.Vector3(0, 1, 0);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const SPIKES = 26;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < SPIKES; i++) {
      const y = 1 - (i / (SPIKES - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      const dir = new THREE.Vector3(
        Math.cos(th) * r,
        y,
        Math.sin(th) * r,
      ).normalize();
      if (dir.z > 0.62) continue; // 눈이 있는 앞면은 비워 둔다
      const s = new THREE.Mesh(spikeGeo, bodyMat);
      s.position.copy(dir).multiplyScalar(0.9);
      s.quaternion.setFromUnitVectors(up, dir);
      s.scale.set(1, 0.82 + rnd() * 0.36, 1);
      bug.add(s);
    }

    const whiteMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 0.8,
      }),
    );
    const pupilMat = track(
      new THREE.MeshStandardMaterial({ color: 0x0b0e26, roughness: 0.18 }),
    );
    const eyeGeo = track(new THREE.SphereGeometry(0.25, 32, 24));
    const pupilGeo = track(new THREE.SphereGeometry(0.125, 24, 18));
    for (const sx of [-0.3, 0.26]) {
      const e = new THREE.Mesh(eyeGeo, whiteMat);
      e.position.set(sx, 0.1, 0.93);
      e.scale.set(1, 1.14, 0.68);
      bug.add(e);
      const p = new THREE.Mesh(pupilGeo, pupilMat);
      p.position.set(sx * 1.03, 0.085, 1.075);
      p.scale.set(1, 1.06, 0.5);
      bug.add(p);
    }

    /* ㄴ 자로 꺾인 팔.
       start 에서 out 방향으로 뻗다가 turn 방향으로 꺾인다.
       corner 가 클수록 모서리가 완만하게 휜다. 각지게 두면 튜브 단면이
       찌그러져 보여서 넉넉히 둥글렸다. */
    const armCurve = (start, out, turn, len1, len2, corner = 0.24) => {
      const s = new THREE.Vector3(...start);
      const o = new THREE.Vector3(...out).normalize();
      const u = new THREE.Vector3(...turn).normalize();
      const bend = s.clone().addScaledVector(o, len1); // 꺾이는 지점
      return new THREE.CatmullRomCurve3([
        s,
        s.clone().addScaledVector(o, len1 * 0.45),
        bend.clone().addScaledVector(o, -corner),
        bend.clone().addScaledVector(u, corner),
        bend.clone().addScaledVector(u, len2),
      ]);
    };

    const arm = (curve, radius, ball) => {
      const g = new THREE.Group();
      g.add(
        new THREE.Mesh(
          track(new THREE.TubeGeometry(curve, 64, radius, 14, false)),
          bodyMat,
        ),
      );
      const tip = new THREE.Mesh(
        track(new THREE.SphereGeometry(ball, 24, 18)),
        bodyMat,
      );
      tip.position.copy(curve.getPoint(1));
      g.add(tip);
      return g;
    };

    // 좌우 대칭. 몸통 가운데 높이에서 옆으로 뻗다가 위로 완만하게 꺾인다.
    for (const side of [1, -1]) {
      bug.add(
        arm(
          armCurve(
            [0.82 * side, 0.06, 0.34],
            [1 * side, 0.16, -0.12],
            [0, 1, 0],
            0.62,
            0.52,
          ),
          0.075,
          0.155,
        ),
      );
    }
    bug.scale.setScalar(0.92);
    root.add(bug);

    // ------------------------------------------------------ 금지 표시
    const ringMat = track(
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.13,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 0.85,
      }),
    );
    const sign = new THREE.Group();
    sign.add(
      new THREE.Mesh(
        track(bakeGradient(new THREE.TorusGeometry(2.05, 0.19, 40, 160))),
        ringMat,
      ),
    );
    const bar = new THREE.Mesh(
      track(
        bakeGradient(new THREE.CylinderGeometry(0.19, 0.19, 4.1, 40, 1, false)),
      ),
      ringMat,
    );
    bar.rotation.z = Math.PI / 4;
    sign.add(bar);
    sign.position.z = 0.55;
    root.add(sign);

    // ---------------------------------------------------------- 크기
    /* 무대가 가로로 넓어져 정사각형이 아니므로, 카메라를 화면비에 맞춘다.
       세로 화각은 고정이라 폭이 좁아지면 좌우가 잘린다. 그만큼 카메라를
       뒤로 물려 어떤 비율에서도 전체가 들어오게 한다. */
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = 11.8 / Math.min(1, camera.aspect);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // -------------------------------------------------------- 상호작용
    let rx = 0;
    let ry = 0;
    let targetX = 0;
    let targetY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let idle = 0;

    const el = renderer.domElement;
    const onDown = (e) => {
      dragging = true;
      idle = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging) return;
      targetY += (e.clientX - lastX) * 0.01;
      targetX = Math.max(
        -0.9,
        Math.min(0.9, targetX + (e.clientY - lastY) * 0.01),
      );
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    renderer.setAnimationLoop(() => {
      if (!dragging) {
        idle += 1;
        // 모션 최소화를 켠 사용자에게는 자동 회전을 하지 않는다
        if (idle > 40 && !reduceMotion) targetY += 0.0035;
      }
      rx += (targetX - rx) * 0.09;
      ry += (targetY - ry) * 0.09;
      root.rotation.x = rx;
      root.rotation.y = ry;
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      disposables.forEach((d) => d.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (el.parentNode === mount) mount.removeChild(el);
    };
  }, []);

  return (
    <div className="pest-lab">
      <PageHero
        eyebrow="Easter Egg"
        title="잡았다, 요놈"
        /* description="홈 화면에 숨어 있던 해충입니다. 이제 마음껏 돌려보세요." */
        size="sm"
      />

      {/* 화면 폭을 꽉 채우는 무대. u-container 밖에 둬야 전체 폭이 나온다. */}
      <div className="pest-lab__scene">
        <div
          className="pest-lab__stage"
          ref={mountRef}
          role="img"
          aria-label="프르조 방제 캐릭터를 3D로 표현한 그림. 파란 해충이 분홍색 금지 표시 안에 들어 있습니다."
        />
        {/* 글 대신 아이콘으로만 조작을 알린다. 좌우 화살표 사이에 그립을 둬
            "옆으로 끌어라"를 나타낸다. 화면에 안 보이는 설명은 .sr-only 로
            남겨 스크린리더에는 그대로 전달된다. */}
        <p className="pest-lab__hint">
          <Icon name="chevron-left" size={18} className="pest-lab__hint-arrow" />
          <Icon name="grip-vertical" size={18} />
          <Icon name="chevron-right" size={18} className="pest-lab__hint-arrow" />
          <span className="sr-only">
            드래그해서 돌려보세요. 손을 떼면 천천히 회전합니다.
          </span>
        </p>
      </div>

      <section className="u-section">
        <div className="u-container pest-lab__inner">
          <Link to="/" className="btn btn--secondary">
            <Icon name="arrow-left" size={18} />
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PestLab;
