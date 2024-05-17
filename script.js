import * as THREE from 'three';
import { OrbitControls } from '/OrbitControls.js';
import { GLTFLoader } from '/GLTFLoader.js';

let selectedFileEl;
const getBtn = document.querySelectorAll("#getBtn");
let renderingDiv;
let classToIdx = { first: 0, second: 1, third: 2 };
let allModels = [];
let allCtrrls = [];
let cameraData = [{ x: -5, y: 2, z: -5 }, { x: -5, y: 2, z: -5 }, { x: -5, y: 2, z: -5 }]


for (let index = 0; index < getBtn.length; index++) {
    const element = getBtn[index];
    element.addEventListener("click", render3D);
}

let renderingDivId;
function render3D(ev) {
    renderingDiv = ev.target.closest(".eachDiv");
    let selectedFileElClass = renderingDiv.id + "Inp";
    renderingDivId = renderingDiv.id;
    // console.log(selectedFileElClass);

    selectedFileEl = document.querySelector(`.${selectedFileElClass}`);
    // console.log(div);
    renderingDiv.innerHTML = "";
    init();
}


let scene, camera, renderer;
let hlight, directionalLight;


function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(-5, 2, -5);

    // let position = new THREE.Vector3(-5, 2, -5);


    scene = new THREE.Scene();
    const color = new THREE.Color("skyblue");
    scene.background = color;

    hlight = new THREE.AmbientLight(0x404040, 100);
    scene.add(hlight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);


    const loader = new GLTFLoader();
    const fileSrc = URL.createObjectURL(selectedFileEl.files[0]);
    // allFiles[renderingDiv.id] = fileSrc;
    loader.load(fileSrc, async function (gltf) {
        // console.log("loading....");
        const model = gltf.scene;
        allModels.push(model);
        // model.scale.set(0.01, 0.01, 0.01);



        // Size setting 
        var boundingBox = new THREE.Box3().setFromObject(model);
        // console.log(boundingBox);

        var size = new THREE.Vector3();
        boundingBox.getSize(size);
        // console.log(boundingBox.getSize(size));
        var maxSize = new THREE.Vector3(5, 5, 5);
        var minSize = new THREE.Vector3(1.3, 1.3, 1.3);

        if (size.x > maxSize.x || size.y > maxSize.y || size.z > maxSize.z) {
            var scaleFactor = Math.min(maxSize.x / size.x, maxSize.y / size.y, maxSize.z / size.z);
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        if (size.x < minSize || size.y < minSize.y || size.z < minSize.z) {
            var scaleFactor = Math.max(minSize.x / size.x, minSize.y / size.y, minSize.z / size.z);
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }



        await renderer.compileAsync(scene, camera);
        scene.add(model);
        render();
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(300, 200);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    renderingDiv.appendChild(renderer.domElement);
    renderer.domElement.id = `${renderingDiv.id}Cnv`;

    camera.lookAt(new THREE.Vector3());

    const controls = new OrbitControls(camera, renderer.domElement);
    allCtrrls.push(controls);

    // controls.addEventListener('change', render);
    // controls.minDistance = 0.1;
    // controls.maxDistance = 900;
    // controls.target.set(0, 0, 0);
    // controls.update();
}



let allDivs = document.querySelectorAll(".eachDiv");

for (let i = 0; i < allDivs.length; i++) {
    allDivs[i].addEventListener("click", ctrls);
}


let selectedDiv;
let divId
function ctrls(ev) {
    let cnv;
    selectedDiv = ev.target.closest(".eachDiv");
    // console.log(selectedDiv);

    let idxForModel;
    let idxForcamera;
    if (selectedDiv) {
        divId = selectedDiv.id;
        idxForModel = classToIdx[divId];
        idxForcamera = classToIdx[divId];
        if (selectedDiv.childElementCount == 1) {
            let cnvId = divId + "Cnv";
            cnv = document.getElementById(cnvId);
            add();
        }
    }

    function add() {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
        let x = cameraData[idxForcamera].x;
        let y = cameraData[idxForcamera].y;
        let z = cameraData[idxForcamera].z;
        camera.position.set(x, y, z);
        camera.lookAt(new THREE.Vector3());

        scene = new THREE.Scene();
        const color = new THREE.Color("skyblue");
        scene.background = color;

        scene.add(allModels[idxForModel]);

        hlight = new THREE.AmbientLight(0x404040, 100);
        scene.add(hlight);

        directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(0, 1, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(devicePixelRatio);
        renderer.setSize(300, 200);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        async function name() {
            await renderer.compileAsync(scene, camera);
        }

        name();

        selectedDiv.innerHTML = '';
        selectedDiv.appendChild(renderer.domElement)

        render();

        let controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', render);
        controls.minDistance = 0.1;
        controls.maxDistance = 900;
        controls.target.set(0, 0, 0);
        controls.update();
    }

}


function render() {
    renderer.render(scene, camera);
    if (selectedDiv) {
        let idxForCamera = cameraData[classToIdx[selectedDiv.id]];
        idxForCamera.x = camera.position.x;
        idxForCamera.y = camera.position.y;
        idxForCamera.z = camera.position.z;
    }
    // console.log("loaded");
}
