//@ https://codepen.io/cvaneenige/pen/ZwqQMp

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';

let fs = document.getElementById('fs').textContent;
let vs = document.getElementById('vs').textContent;

let scene, renderer, camera;

let controls;

let width = window.innerWidth;
let height = window.innerHeight;

let clock = new THREE.Clock();

let time = new THREE.Uniform(0);

let cubeCount = 150;

let uniforms = {
  'u_time': time
}

const init = function () {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  
  document.querySelector('body').appendChild(renderer.domElement);

  render();

  addEvent();

  createBox();

  createBoxCopy();

  startAnimateHandler();
  let lights = [];
			lights[0] = new THREE.PointLight(0xffffff, 1, 0);
			lights[1] = lights[0].clone();
			lights[2] = lights[0].clone();

			lights[0].position.set(0, 200, 0);
			lights[1].position.set(100, 200, 100);
			lights[2].position.set(-100, -200, -100);

			scene.add(lights[0]);
      scene.add(lights[1]);
      scene.add(lights[2]);
}

const getRandomBetween = function (value) {
  const floor = -value;
  return floor + Math.random() * value * 2;
}

const getArrayWithNoise = function (array, noise) {
  return array.map(item => item + getRandomBetween(noise));
}

const createRound = function (radius) {
  let R = radius;
  let phi = Math.random() * 2 * Math.PI;
  let costheta = Math.random() * 2 - 1;

  let u =  Math.random();

  let theta = Math.acos(costheta);
  let r = R * Math.pow(u, 0.5);

  let pos = new THREE.Vector3();
  pos.x = r * Math.sin(theta) * Math.cos(phi);
  pos.y = r * Math.sin(theta) * Math.sin(phi);;
  pos.z = r * Math.cos(theta);

  return pos;
}

const createGeometry = function (startPointPos) {
  // let geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
  // let geometry = new THREE.IcosahedronBufferGeometry(1, 0);
  
  let defaultBox = new THREE.IcosahedronBufferGeometry(1, 1);

  let defaultIndex = defaultBox.index;
  let count;
  let arrVal;

  if (defaultIndex) {
    count = defaultIndex.count;
    arrVal = defaultIndex.array;
  } else {
    
    count = defaultBox.attributes.position.count;
    arrVal = [];
    for (let i = 0; i < count; i++) {
      arrVal.push(i);
    }
  }

  let defaultPosition = defaultBox.attributes.position.array;
  let posCount = defaultBox.attributes.position.count;

  let newIndex = new Uint32Array(count * cubeCount);
  
  for (let i = 0; i < cubeCount; i++) {
    for (let i1 = 0; i1 < count; i1++) {
      newIndex[i * count + i1] = arrVal[i1] + i * posCount
    }
  }


  let newPosition = new Float32Array(posCount * 3 * cubeCount);
  for(let j = 0, offset = 0; j < cubeCount; j++) {
    for (let j1 = 0; j1 < posCount; j1++, offset += 3) {
      newPosition[offset + 0] = defaultPosition[j1 * 3 + 0]
      newPosition[offset + 1] = defaultPosition[j1 * 3 + 1]
      newPosition[offset + 2] = defaultPosition[j1 * 3 + 2]
    }
  }

  let boxGeometry = new THREE.BufferGeometry();

  // boxGeometry.setAttribute('position', defaultBox.attributes['position'])
  boxGeometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
  boxGeometry.setIndex(new THREE.BufferAttribute(newIndex, 1));
  
  // boxGeometry.setAttribute('position', new THREE.BufferAttribute(vertext, 3));
  
  let startPos = new Float32Array(posCount * 3 * cubeCount);

  let endPos = new Float32Array(posCount * 3 * cubeCount);

  let controlPos1 = new Float32Array(posCount * 3 * cubeCount);

  let controlPos2 = new Float32Array(posCount * 3 * cubeCount);

  let aOffset = new Float32Array(count * cubeCount);
  
  for (let i = 0; i < cubeCount; i++) {
    for (let i1 = 0; i1 < count; i1++) {
      aOffset[i * count + i1] = [i * ((1 - 0.7) / (cubeCount - 1))]
    }
  }

  for(let j = 0, offset = 0; j < cubeCount; j++) {
    let sPos = new THREE.Vector3().fromArray(getArrayWithNoise(startPointPos, 0));
    let c1Pos = new THREE.Vector3().fromArray(getArrayWithNoise([0, 10, 10], 0));
    let c2Pos = new THREE.Vector3().fromArray(getArrayWithNoise([0, -10, 10], 10));
    let ePos = createRound(30);
  
    for (let j1 = 0; j1 < posCount; j1++, offset += 3) {

      // let symbol = (j % 2 === 0) ? 1 : -1; 
      startPos[offset + 0] = sPos.x
      startPos[offset + 1] = sPos.y
      startPos[offset + 2] = sPos.z

      endPos[offset + 0] = ePos.x
      endPos[offset + 1] = ePos.y
      endPos[offset + 2] = ePos.z

      controlPos1[offset + 0] = c1Pos.x
      controlPos1[offset + 1] = c1Pos.y
      controlPos1[offset + 2] = c1Pos.z

      controlPos2[offset + 0] = c2Pos.x
      controlPos2[offset + 1] = c2Pos.y
      controlPos2[offset + 2] = c2Pos.z
    }
  }

  boxGeometry.setAttribute('aOffset', new THREE.BufferAttribute(aOffset, 1));

  boxGeometry.setAttribute('startPosition', new THREE.BufferAttribute(startPos, 3));
  boxGeometry.setAttribute('endPosition', new THREE.BufferAttribute(endPos, 3));

  boxGeometry.setAttribute('controlPosition1', new THREE.BufferAttribute(controlPos1, 3));
  boxGeometry.setAttribute('controlPosition2', new THREE.BufferAttribute(controlPos2, 3));

  return boxGeometry;
}

const createBoxCopy = function () {
  let boxGeometry = createGeometry([0, 40, 0]);

  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vs,
    fragmentShader: fs,
    transparent: false,
    wireframe: true,
  });

  let box = new THREE.Mesh(boxGeometry, material);
  scene.add(box);
}

const createBox = function () {

  let boxGeometry = createGeometry([0, -40, 0]);
  let material = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, flatShading: true });
  let box = new THREE.Mesh(boxGeometry, material);
  material.onBeforeCompile = function (shader) {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader.replace('#include <clipping_planes_pars_vertex>', `
    #include <clipping_planes_pars_vertex>
    uniform float u_time;
    attribute vec3 startPosition;
    attribute vec3 endPosition;
    attribute vec3 controlPosition1;
    attribute vec3 controlPosition2;
    attribute float aOffset;

    float easeInOutSin(float t){
      return (1.0 + sin(PI * t - PI / 2.0)) / 2.0;
    }
    
    vec3 bezier(vec3 A, vec3 B, vec3 C, vec3 D, float t) {
      vec3 E = mix(A, B, t);
      vec3 F = mix(B, C, t);
      vec3 G = mix(C, D, t);
    
      vec3 H = mix(E, F, t);
      vec3 I = mix(F, G, t);
    
      vec3 P = mix(H, I, t);
    
      return P;
    }
    `)
    .replace('#include <begin_vertex>', `
    #include <begin_vertex>
    vec3 start = startPosition;
    vec3 end = endPosition;
    vec3 control1 = controlPosition1;
    vec3 control2 = controlPosition2;
    
    float time =  easeInOutSin(min(1.0, max(0.0, (u_time - aOffset)) / 0.7));
    vec3 pos = position;
    vec3 posOffset = bezier(start, control1, control2, end, time);
    
    float scale = time * 2.0 - 1.0;
    scale = 1.0 - scale * scale;
    pos *= scale;

    transformed = pos + posOffset;
    `);
  }
  scene.add(box);
}

const addEvent = function () {

  // document.querySelector('.btn-start-animate').addEventListener('click', startAnimateHandler, false);

  window.addEventListener('resize', resizeHandler, false);
}

const render = function () {
  requestAnimationFrame(render);

  // uniforms.u_time.value = clock.getElapsedTime();
  // console.log(material.uniforms.u_time);
  controls.update();

  renderer.render(scene, camera);
}

const resizeHandler = function () {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  // composer.setSize(width, height);
}

const startAnimateHandler = function (ev) {
  TweenLite.to(uniforms.u_time, 5, {
    value: 1,
    // ease: Power4.easeIn,
    onUpdate: function () {
      
    },
    onComplete: function () {
      this.restart();
    }
  })
}

init();
