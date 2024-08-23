// สร้าง Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// เพิ่ม AmbientLight สำหรับให้แสงพื้นฐาน
const ambientLight = new THREE.AmbientLight(0x404040, 3.5); // เพิ่มความสว่าง
scene.add(ambientLight);

// เพิ่ม DirectionalLight และเปิดการใช้งาน shadow
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3); // เพิ่มความสว่าง
directionalLight.position.set(5, 5, 5).normalize();
directionalLight.castShadow = true; // เปิดการใช้งาน shadow
scene.add(directionalLight);

// สร้างกล้อง
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1;

// สร้าง Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true; // เปิด gamma correction
renderer.gammaFactor = 2.2; // ใช้ค่า gamma factor ที่เหมาะสม
renderer.shadowMap.enabled = true; // เปิดการใช้งาน shadow map
document.body.appendChild(renderer.domElement);

// สร้าง pivot สำหรับหมุนโมเดลรอบจุดศูนย์กลาง
const pivot = new THREE.Object3D();
scene.add(pivot);

// โหลดโมเดล GLTF
const loader = new THREE.GLTFLoader();
let loadedModel;
loader.load(
  "Box Mainwave.glb",
  function (gltf) {
    loadedModel = gltf.scene;

    // คำนวณขนาดของโมเดลเพื่อปรับตำแหน่งให้กลางจอ
    const box = new THREE.Box3().setFromObject(loadedModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // ปรับตำแหน่งโมเดลให้อยู่ใน pivot
    loadedModel.position.x -= center.x;
    loadedModel.position.y -= center.y;
    loadedModel.position.z -= center.z;

    // ปรับตำแหน่งกล้องตามขนาดของโมเดล
    camera.position.z = size.length() * 1.5;

    pivot.add(loadedModel);

    // ปรับ Material ของโมเดล
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.emissive = new THREE.Color(0x333333); // เพิ่มสีที่เรืองแสง
        child.material.emissiveIntensity = 0.2; // เพิ่มความเข้มของสีที่เรืองแสง
        child.material.roughness = 0.0; // ปรับค่า roughness
        child.material.metalness = 0.5; // ปรับค่า metalness
        child.material.castShadow = true; // เปิดการใช้งาน shadow
        child.material.receiveShadow = true; // รับ shadow
        child.material.needsUpdate = true; // อัปเดต material
      }
    });

    animate();
  },
  undefined,
  function (error) {
    console.error("Error loading model:", error);
  }
);

// สร้าง Controls สำหรับการหมุนและซูมโมเดลด้วยเมาส์
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = false;

// เพิ่มตัวแปรสำหรับการควบคุมการหมุน
let rotateXSpeed = 0;
let rotateYSpeed = 0;
let autoRotateSpeed = 0.001; // ความเร็วในการหมุนอัตโนมัติ
let isAutoRotate = true; // ตัวแปรสำหรับควบคุมการหมุนอัตโนมัติ

// ฟังก์ชันสำหรับการหมุนโมเดล
function rotateModel() {
  pivot.rotation.y += rotateYSpeed || (isAutoRotate ? autoRotateSpeed : 0);
  pivot.rotation.x += rotateXSpeed;
}

// ฟังก์ชันสำหรับเรนเดอร์ Scene
function animate() {
  requestAnimationFrame(animate);
  rotateModel(); // เรียกใช้ฟังก์ชันหมุนโมเดล
  controls.update(); // อัปเดตการควบคุม
  renderer.render(scene, camera);
}

// ทำให้ Scene และกล้อง Responsive
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// การจัดการการคลิกปุ่ม
document.getElementById("rotateLeft").addEventListener("mousedown", () => {
  rotateYSpeed = -0.0075;
});

document.getElementById("rotateRight").addEventListener("mousedown", () => {
  rotateYSpeed = 0.0075;
});

document.getElementById("rotateUp").addEventListener("mousedown", () => {
  rotateXSpeed = -0.0075;
});

document.getElementById("rotateDown").addEventListener("mousedown", () => {
  rotateXSpeed = 0.0075;
});

// หยุดการหมุนเมื่อปล่อยปุ่ม
document.getElementById("rotateLeft").addEventListener("mouseup", stopRotation);
document
  .getElementById("rotateRight")
  .addEventListener("mouseup", stopRotation);
document.getElementById("rotateUp").addEventListener("mouseup", stopRotation);
document.getElementById("rotateDown").addEventListener("mouseup", stopRotation);

// หยุดการหมุนเมื่อออกจากปุ่ม
document
  .getElementById("rotateLeft")
  .addEventListener("mouseleave", stopRotation);
document
  .getElementById("rotateRight")
  .addEventListener("mouseleave", stopRotation);
document
  .getElementById("rotateUp")
  .addEventListener("mouseleave", stopRotation);
document
  .getElementById("rotateDown")
  .addEventListener("mouseleave", stopRotation);

function stopRotation() {
  rotateYSpeed = 0;
  rotateXSpeed = 0;
}

// การรีเซ็ตตำแหน่งของโมเดล
document.getElementById("resetPosition").addEventListener("click", () => {
  pivot.rotation.set(0, 0, 0);
});

// เริ่มหรือหยุดการหมุนอัตโนมัติ
document.getElementById("toggleAutoRotate").addEventListener("click", () => {
  isAutoRotate = !isAutoRotate;
  document.getElementById("toggleAutoRotate").textContent = isAutoRotate
    ? "Stop Rotate"
    : "Start Rotate";
});

animate();
