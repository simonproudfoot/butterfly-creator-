<template>
<div>
    <div :id="index" class="container"></div>
</div>
</template>

<script>
import * as Three from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export default {
    props: ['wingDesign', 'index'],
    name: 'ThreeTest',
    data() {
        return {
            ready: true,
            clock: new Three.Clock(),
            mixer: null,
            camera: null,
            scene: null,
            renderer: null,
            butterfly: '',
            butterflyUlr: require('@/assets/test.glb'),
            alphaMapImageUlr: require('@/assets/test.png'),

        }
    },
    methods: {

        changeWing() {
            const texture = new Three.TextureLoader().load(this.wingDesign);
            const alphaMapImage = new Three.TextureLoader().load(this.wingDesign);
            if (texture.onUpdate) {
                texture.needsUpdate = false;
                texture.onUpdate(texture);
                texture.flipY = false;
            }
            const material = new Three.MeshBasicMaterial({ map: texture, side: Three.DoubleSide, alphaTest: 0.5 })
            console.log(material.map.flipY = false)
            this.scene.getObjectByName('Wings').material = material
            this.scene.getObjectByName('Wings').rotation.y = Math.PI / 2;

        },

        init() {
            let container = document.getElementById(this.index);
            // camera
            this.camera = new Three.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 1, 30);
            this.camera.position.z = 20;
            this.scene = new Three.Scene();
            // background
            this.scene.background = new Three.Color(0xab2a2a);
            // LIGHT
            const ambientLight = new Three.AmbientLight('lightBlue', 2);
            const mainLight = new Three.DirectionalLight('lightGreen', 4);
            mainLight.position.set(10, 10, 10);
            const secondLight = new Three.DirectionalLight('aqua', 2)
            secondLight.position.set(10, 10, 10);
            this.scene.add(ambientLight);
            this.scene.add(mainLight);
            this.scene.add(secondLight);
            // Load object
            const gltfLoader = new GLTFLoader();
            gltfLoader.load(this.butterflyUlr, (gltf) => {
                this.butterfly = gltf.scene
                this.scene.add(this.butterfly);
                this.mixer = new Three.AnimationMixer(gltf.scene);
                this.butterfly.rotation.x = -30
                this.butterfly.rotation.y = -3.14
                gltf.animations.forEach((clip) => {
                    this.mixer.clipAction(clip).play();
                });
                this.changeWing();
            })
            // RENDER
            this.renderer = new Three.WebGLRenderer({ antialias: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);

        },

        animate() {
            requestAnimationFrame(this.animate);
            var delta = this.clock.getDelta();
            if (this.mixer && this.butterfly) this.mixer.update(delta);
            this.renderer.render(this.scene, this.camera);
        }
    },
    created() {

    },
    mounted() {
        this.init();
        this.animate();
    }
}
</script>

<style scoped>
.container {
    width: 100%;
    height: 200px;
    color: rgb(112, 207, 207);
    z-index: 100;

    right: 0;
    z-index: 99999;
}

.controls {
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: black;
    color: #fff;
    padding: 10px;
    width: 100%;
}
</style>
