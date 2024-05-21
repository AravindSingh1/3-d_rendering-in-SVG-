import * as THREE from 'three';
import { OrbitControls } from '/OrbitControls.js';
import { GLTFLoader } from '/GLTFLoader.js';

const fullSvgEl = document.getElementById("parentSVG");
const selectedFiles = document.getElementById("filesInp");
const getBtn = document.getElementById("getBtn");

let allCtrls = {};
let allScenes = {};
let allCameras = {};
let allModels = {};
let renderer;
let allRenderers = {};


getBtn.addEventListener("click", get);

function get() {
    const fileCount = selectedFiles.files.length;
    console.log(fileCount);
    for (let i = 0; i < fileCount; i++) {
        renderAll(i);
    }
}

function renderAll(i) {

    let camera, scene;
    let hlight, directionalLight;


    let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');

    var newNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    let attributesForNewNode = {width:"300px", height:"200px", x:`${350*i}`, y: "0"};
    setAttributes(newNode, attributesForNewNode);
    g.appendChild(newNode);

    var renderingDiv = document.createElement('div');
    var divIdName = `div_${i}`;
    setAttributes(renderingDiv, {id:divIdName, class:"eachDiv"});

    var fullViewBtn = document.createElement("input");
    let fullViewBtnAttributes = {type:"button", value:'↗️', class:"fullScreenBtn", id:"fullViewBtn"};
    setAttributes(fullViewBtn, fullViewBtnAttributes);

    fullViewBtn.addEventListener('click', fullView);

    renderingDiv.appendChild(fullViewBtn);
    newNode.appendChild(renderingDiv);
    fullSvgEl.appendChild(g);

    renderingDiv.addEventListener("mouseenter", function () {
        fullViewBtn.style.display = "block";
    });

    renderingDiv.addEventListener("mouseleave", function () {
        fullViewBtn.style.display = "none";
    })

    innit();


    function innit() {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
        camera.position.set(-5, 2, -5);

        scene = new THREE.Scene();
        const color = new THREE.Color("skyblue");
        scene.background = color;

        hlight = new THREE.AmbientLight(0x404040, 100);
        scene.add(hlight);

        directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(0, 1, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // console.log(i);
        const loader = new GLTFLoader();
        const fileSrc = URL.createObjectURL(selectedFiles.files[i]);
        // console.log(fileSrc);

        loader.load(fileSrc, async function (gltf) {
            const model = gltf.scene;
            allModels[i] = model;

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

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(devicePixelRatio);
            renderer.setSize(300, 200);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.5;

            camera.lookAt(new THREE.Vector3());

            await renderer.compileAsync(scene, camera);
            allRenderers[i] = renderer;

            scene.add(model);
            renderer.render(scene, camera);
            allCameras[i] = camera;
            allScenes[i] = scene;

            renderingDiv.appendChild(renderer.domElement);
            renderingDiv.addEventListener("click", addCtrls);

        });
    }

}

function addCtrls(ev) {
    let div = ev.target.closest(".eachDiv");
    let divId = div.id;
    let Idx = divId[divId.length - 1];
    console.log(+Idx);

    let renderer = allRenderers[Idx];
    let scene = allScenes[Idx];
    let camera = allCameras[Idx];


    if (!allCtrls[Idx]) {
        console.log("new control added");
        let controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', render);
        controls.minDistance = 0.1;
        controls.maxDistance = 900;
        controls.target.set(0, 0, 0);
        controls.update();
        allCtrls[Idx] = controls;
    }


    function render() {
        renderer.render(scene, camera)
    }


}


function fullView(ev) {
    let div = ev.target.closest(".eachDiv");
    let divId = div.id;
    let Idx = divId[divId.length - 1];
    console.log(Idx);
    console.log("fulll");
    let scene = allScenes[+Idx];
    let camera = allCameras[+Idx];
    let renderer = allRenderers[+Idx];

    // let controler = allCtrls[Idx];

    makeFullDom();
    function makeFullDom() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');

        var newNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        let newNodeAttributes = {width: width, height: height, x:"0", y:"0"};
        setAttributes(newNode, newNodeAttributes);

        g.appendChild(newNode);

        var renderingDiv = document.createElement('div');
        renderingDiv.setAttribute("class", "fullViewDiv");

        var exitBtn = document.createElement("input");
        const exitBtnAttributes = {type:"button", value:"↖️", class:"exitBtn"};
        setAttributes(exitBtn, exitBtnAttributes);
        exitBtn.addEventListener("click", exit);
        renderingDiv.appendChild(exitBtn);

        newNode.appendChild(renderingDiv);
        fullSvgEl.appendChild(g);

        renderer.setSize(width, height);
        renderer.render(scene, camera);
        renderingDiv.appendChild(renderer.domElement);

        function exit() {
            g.remove();
            renderer.setSize(300, 200);
            div.innerHTML = "";
            div.appendChild(renderer.domElement);

            var fullViewBtn = document.createElement("input");
            const fullViewBtnAttributes = {type:"button", value:"↗️", class:"fullScreenBtn", id:"fullViewBtn"};
            setAttributes(fullViewBtn, fullViewBtnAttributes);
            fullViewBtn.addEventListener('click', fullView);

            div.appendChild(fullViewBtn);

            div.addEventListener("mouseenter", function () {
                fullViewBtn.style.display = "block";
            });
            div.addEventListener("mouseleave", function () {
                fullViewBtn.style.display = "none";
            })


        }

    }

}

function setAttributes(element, allAttributes) {
    let attriButes = Object.keys(allAttributes);
    let attributeValues = Object.values(allAttributes);
    for(let i=0; i<attriButes.length; i++){
        element.setAttribute(attriButes[i], attributeValues[i]);
    }
}
