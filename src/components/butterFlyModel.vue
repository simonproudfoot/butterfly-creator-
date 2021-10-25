<template>
<div>
    <div :id="index" class="container">
        <p v-if="loading">LOADING...</p>
    </div>
</div>
</template>

<script>
import * as Three from 'three'
export default {
    props: ['wingDesign', 'index', 'final', 'loadedScene', 'event_child'],
    name: 'ThreeTest',
    data() {
        return {
            loading: true,
            ready: true,
            clock: new Three.Clock(),
            mixer: null,
            camera: null,
            scene: null,
            renderer: null,
            butterfly: '',
            alphaMapImageUlr: require('@/assets/test.png'),
        }
    },
    methods: {
        changeWing() {
            const texture = new Three.TextureLoader().load(this.wingDesign);
            if (texture.onUpdate) {
                texture.needsUpdate = false;
                texture.onUpdate(texture);
                texture.flipY = true;
            }
            const material = new Three.MeshBasicMaterial({ map: texture, side: Three.DoubleSide, alphaTest: 0.5, color: 0xFF0000 })
            material.map.flipY = false
            this.scene.getObjectByName('Wings').material = material
            this.scene.getObjectByName('Wings').rotation.y = Math.PI / 2;
        },
        init() {
            let container = document.getElementById(this.index);
            // CAMERA
            this.camera = new Three.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 1, 30);
            this.camera.position.z = 16;
            this.scene = new Three.Scene();

            // LIGHT
            const ambientLight = new Three.AmbientLight('lightBlue', 2);
            const mainLight = new Three.DirectionalLight('lightGreen', 4);
            mainLight.position.set(10, 10, 10);
            const secondLight = new Three.DirectionalLight('aqua', 2)
            secondLight.position.set(10, 10, 10);
            this.scene.add(ambientLight);
            this.scene.add(mainLight);
            this.scene.add(secondLight);
            this.butterfly = this.scene.add(this.loadedScene.scene);
            this.mixer = new Three.AnimationMixer(this.loadedScene.scene);
            this.butterfly.position.y = 1.3
            this.butterfly.scale.set(1, 1, 1)
            this.butterfly.position.set(0, 0.95, -4)
            //  this.butterfly.position.x = -0.3
            this.butterfly.rotation.x = -30
            this.butterfly.rotation.y = -3.14

            this.loadedScene.animations.forEach((clip) => {
                this.mixer.clipAction(clip).play();
            });

            this.changeWing();
            this.loading = false

            // RENDER
            this.renderer = new Three.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);
        },
        animate() {
            requestAnimationFrame(this.animate);
            var delta = this.clock.getDelta(3);
            if (this.mixer && this.butterfly) this.mixer.update(delta);
            if (this.clock.elapsedTime > 1) {
                this.mixer.timeScale = 2.5
                this.butterfly.position.z += 0.1
                this.butterfly.rotation.x += 0.01
                this.butterfly.rotation.z = Math.sin(Date.now() * 0.002) * Math.PI * 0.04;
                this.butterfly.position.x = Math.sin(Date.now() * 0.02) * Math.PI * 0.015;
                this.butterfly.position.y += 0.1
            }
            this.renderer.render(this.scene, this.camera);
        }
    },
    mounted() {
        this.init();
        this.animate();
        setTimeout(() => {
            this.$emit('event_child')

        }, 2500);
    }
}
</script>

<style>
.container {
    height: 1080px;
    width: 1920px;
    position: absolute;
    width: 100% !important;
    height: 100% !important;
    transition-duration: 1s;
    max-width: none !important;
    padding: 0 !important;
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
