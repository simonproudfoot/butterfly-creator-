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
            const material = new Three.MeshBasicMaterial({ map: texture, side: Three.DoubleSide, alphaTest: 0.5 })
            material.map.flipY = false
            this.scene.getObjectByName('Wings').material = material
            this.scene.getObjectByName('Wings').rotation.y = Math.PI / 2;
        },
        init() {
            let container = document.getElementById(this.index);
            // camera
            this.camera = new Three.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 1, 30);
            if (!this.final) {
                this.camera.position.z = 20;
            } else {
                this.camera.position.z = 15;
            }
            this.scene = new Three.Scene();
            // background
            if (!this.final) {
                this.scene.background = new Three.Color(0xab2a2a);
            } else {
                this.scene.background = new Three.Color('white');
            }
            // LIGHT
            const ambientLight = new Three.AmbientLight('lightBlue', 2);
            const mainLight = new Three.DirectionalLight('lightGreen', 4);
            mainLight.position.set(10, 10, 10);
            const secondLight = new Three.DirectionalLight('aqua', 2)
            secondLight.position.set(10, 10, 10);
            this.scene.add(ambientLight);
            this.scene.add(mainLight);
            this.scene.add(secondLight);
            this.butterfly = this.loadedScene.scene
            this.scene.add(this.butterfly);
            this.mixer = new Three.AnimationMixer(this.loadedScene.scene);
            this.butterfly.position.y = 1
            this.butterfly.rotation.x = -30
            this.butterfly.rotation.y = -3.14

            this.loadedScene.animations.forEach((clip) => {
                this.mixer.clipAction(clip).play();
            });

            this.changeWing();
            this.loading = false

            // RENDER
            this.renderer = new Three.WebGLRenderer({ antialias: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);
        },
        animate() {
            requestAnimationFrame(this.animate);
            var delta = this.clock.getDelta();
            if (this.mixer && this.butterfly) this.mixer.update(delta);
            if (this.clock.elapsedTime < 2) {
                this.butterfly.rotation.x -= 0.01
            }
            if (this.clock.elapsedTime > 1 && this.clock.elapsedTime < 5.4) {
                this.butterfly.scale.x -= 0.004
                this.butterfly.scale.z -= 0.004
                this.butterfly.scale.y -= 0.004
                this.butterfly.rotation.z = Math.sin(Date.now() * 0.002) * Math.PI * 0.04;
            }
            if (this.clock.elapsedTime > 5.2) {
                // RESET
                this.$emit('event_child', 1)

            }
            this.renderer.render(this.scene, this.camera);
        }
    },
    mounted() {
        this.init();
        this.animate();
    }
}
</script>

<style>
#main {
    height: 100vh;
}

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
