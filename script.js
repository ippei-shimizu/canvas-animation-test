// Three.jsモジュールを読み込む
import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';

const NUM_GEOMETRIES = 4;

// シーンを作成し、背景色を白に設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// 画面サイズを取得（幅W、高さH）
let W = window.innerWidth, H = window.innerHeight;

// OrthographicCameraをピクセル単位で設定（2Dライクに扱う）
const camera = new THREE.OrthographicCamera(
  -W/2,  // left
   W/2,  // right
   H/2,  // top
  -H/2,  // bottom
  -1000, // near
   1000  // far
);
camera.position.z = 10;  // カメラを少し手前に配置

// レンダラーを作成し、画面サイズに合わせる
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
document.body.appendChild(renderer.domElement);  // canvas要素をDOMに追加

// 線用のマテリアル（灰色）とジオメトリを準備
const material = new THREE.LineBasicMaterial({ color: 0x888888 });

const geometries = Array.from({ length: NUM_GEOMETRIES }, () => new THREE.BufferGeometry());

const offsets = [
  [   0,   0],
  [   0,   0],
  [   0,   0],
  [   0,   0],
];
const lines = geometries.map((geom, i) => {
  const l = new THREE.Line(geom, material);
  const [ox, oy] = offsets[i];
  l.position.set(ox, oy, 0);
  scene.add(l);
  return l;
});


// Catmull–Romスプラインで頂点を更新する関数
function updateSpline() {
  // 制御点を定義（画面幅いっぱいに波状に配置）
  const control = [
    new THREE.Vector3(-W/2,        -400, 0),
    new THREE.Vector3(-W/4,   -500, 0),
    new THREE.Vector3(   0,        -100, 0),
    new THREE.Vector3( W/4,  -H/4, 0),
    new THREE.Vector3( W/2.8,        260, 0),
    new THREE.Vector3( W/1,        340, 0),
  ];
  // 曲線オブジェクトを生成
  const curve = new THREE.CatmullRomCurve3(control);
  // 曲線上の補間点を取得（100点で滑らかに）
  const pts = curve.getPoints(100);
  // ジオメトリに点列をセットして線を更新
  geometries.forEach(geom => geom.setFromPoints(pts));
}

// 初回描画：スプラインを更新してレンダリング
updateSpline();
renderer.render(scene, camera);

// ウィンドウリサイズ時の処理
window.addEventListener('resize', () => {
  // 新しい画面サイズを取得
  W = window.innerWidth;
  H = window.innerHeight;
  // カメラfrustumを更新（ピクセル単位を維持）
  camera.left   = -W/2;
  camera.right  =  W/2;
  camera.top    =  H/2;
  camera.bottom = -H/2;
  camera.updateProjectionMatrix();
  // レンダラーサイズも更新
  renderer.setSize(W, H);
  // スプラインを再計算して再描画
  updateSpline();
  renderer.render(scene, camera);
});
