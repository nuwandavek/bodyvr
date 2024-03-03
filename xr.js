import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';


function attachVideoCylinder(scene){
  const video1 = document.getElementById('ecamera_video');
  const texture1 = new THREE.VideoTexture(video1);
  const video2 = document.getElementById('dcamera_video');
  const texture2 = new THREE.VideoTexture(video2);

  texture1.wrapS = THREE.RepeatWrapping;
  texture1.repeat.x = -1;
  texture2.wrapS = THREE.RepeatWrapping;
  texture2.repeat.x = -1;

  const radius = 10;
  const height = 15;
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true, -Math.PI/2, Math.PI); // Half cylinder
  const geometryBack = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true, Math.PI/2, Math.PI); // Other half

  const materialFront = new THREE.MeshBasicMaterial({map: texture1, side: THREE.DoubleSide});
  const materialBack = new THREE.MeshBasicMaterial({map: texture2, side: THREE.DoubleSide});

  const cylinderFront = new THREE.Mesh(geometry, materialFront);
  const cylinderBack = new THREE.Mesh(geometryBack, materialBack);

  cylinderBack.rotation.x = -10 * (Math.PI / 180); // Apply pitch correction
  cylinderBack.position.y =  3;
  cylinderFront.position.y =  3;

  scene.add(cylinderFront, cylinderBack);

  video1.play().catch((e) => console.error("Error playing video 1:", e));
  video2.play().catch((e) => console.error("Error playing video 2:", e));
}

function attachArrow(scene){
  const geometry = new THREE.ConeGeometry( 0.2, 0.3, 32 );
  const material = new THREE.MeshBasicMaterial( {color: "#c0392b"} );
  const cone = new THREE.Mesh(geometry, material );
  const cone_pos = [0, 0, -4];
  const cone_rot = [-Math.PI/3, 0, 0]
  cone.position.set(...cone_pos);
  cone.rotation.set(...cone_rot);
  scene.add( cone );

  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({color: "#2c3e50"}); // Black lines, for example
  const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
  wireframe.position.set(...cone_pos);
  wireframe.rotation.set(...cone_rot);

  scene.add(wireframe);
}

function addControllerUI(scene, controller){
  const ringGeometry = new THREE.RingGeometry(0.3, 0.32, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: "#bdc3c7", side: THREE.DoubleSide, transparent: true, opacity: 1 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);

  const geometry = new THREE.CircleGeometry(0.2, 32);
  const material = new THREE.MeshBasicMaterial({color: "#2980b9"});
  const circle = new THREE.Mesh(geometry, material);

  ring.position.set(...controller.uiOffset);
  circle.position.set(...controller.uiOffset);
  scene.add(ring);
  scene.add(circle);
  controller.ui = circle;
}

function attachControllers(scene, controller1, controller2){
  controller1.name = "right";
  controller2.name = "left";

  controller1.uiOffset = [0.5, -1, -4];
  controller2.uiOffset = [-0.5, -1, -4];

  scene.add(controller1);
  scene.add(controller2);

  controller1.addEventListener('connected', event => attachGamepad(event, controller1));
  controller2.addEventListener('connected', event => attachGamepad(event, controller2));

  function attachGamepad(event, controller) {
    if (event.data.gamepad) {
        controller.gamepad = event.data.gamepad;
        console.log("Gamepad attached to controller", controller);
        addControllerUI(scene, controller);
    } else {
        console.log("Connected device does not have a gamepad");
    }
  }
}

function initScene(){
  const stats = new Stats();
  stats.showPanel( 0 );
  document.body.appendChild( stats.dom );


  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  const vrButton = VRButton.createButton(renderer);
  document.body.appendChild(vrButton);
  return [scene, camera, renderer, vrButton, stats];
}

function controllerMovement(controller){
  if (controller.gamepad){
    controller.ui.position.x = controller.gamepad.axes[2] * 0.3 + controller.uiOffset[0];
    controller.ui.position.y = -controller.gamepad.axes[3] * 0.3  + controller.uiOffset[1];
  }
}

export function runXR(stream) {
  const [scene, camera, renderer, vrButton, stats] = initScene();
  const controller1 = renderer.xr.getController(0);
  const controller2 = renderer.xr.getController(1);

  function animate() {
    renderer.setAnimationLoop(render);
  }

  function render() {
    stats.begin();
    const euler = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    controllerMovement(controller1);
    controllerMovement(controller2);

    renderer.render(scene, camera);
  	stats.end();
  }

  vrButton.addEventListener('click', () => {
    attachVideoCylinder(scene);
    attachArrow(scene);
    attachControllers(scene, controller1, controller2);

    animate();

    stream.start().then((answer) => {
      console.log("Stream started with answer", answer);
    });
  });
}
