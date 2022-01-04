<template>
<div>
    <span class="background"></span>
    <div id="container" class="container">
        <p v-if="loading">LOADING...</p>
    </div>
</div>
</template>

<script>
import * as Three from 'three'
export default {
    props: ['wingDesign', 'index', 'final', 'loadedScene', 'event_child', 'wingSelected', 'ready'],
    name: 'ThreeTest',
    data() {
        return {
            loading: true,
            clock: new Three.Clock(),
            mixer: null,
            camera: null,
            scene: null,
            renderer: null,
            butterfly: '',
            alphaMapImageUlr: require('@/assets/test.png'),
            curve: null,
            points: null,
            t: 0,
            testMesh: null,
            axis: ''
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
            if (this.wingSelected == 1) {
                texture.offset.x = -0.050
                texture.offset.y = -0.030
            }
            if (this.wingSelected == 2) {
                texture.offset.x = -0.040
                texture.offset.y = -0.030
            }
            if (this.wingSelected == 3) {
                texture.offset.x = -0.050
                texture.offset.y = 0.030
            }

            const material = new Three.MeshBasicMaterial({ map: texture, side: Three.DoubleSide, alphaTest: 0.5 })
            material.map.flipY = false
            this.scene.getObjectByName('Wings').material = material
            this.scene.getObjectByName('Wings').rotation.y = Math.PI / 2;
        },
        originalPosition() {
            this.butterfly.scale.set(0.44, 0.44, 0.44)
            this.butterfly.position.set(0, -1.7, 0)
            this.butterfly.rotation.x = -30
            this.butterfly.rotation.y = -3.14
        },
        createPath() {
            //Create a closed wavey loop
            // X: L/R
            // y: up
            // z: elevation
            var pos = this.butterfly.position
            this.curve = new Three.CatmullRomCurve3([
                new Three.Vector3(pos.x, pos.y, pos.z),
                new Three.Vector3(0, 0, 0),
                new Three.Vector3(-1, 1, -5),
                new Three.Vector3(1, 2, -7.5),
                new Three.Vector3(-1, 3, -10),

            ]);

            const points = this.curve.getPoints(50);
            const geometry = new Three.BufferGeometry().setFromPoints(points);
            const material = new Three.LineBasicMaterial({ color: 0x000 });
            const visCurve = new Three.Line(geometry, material);
            this.scene.add(this.curve)
            this.scene.add(visCurve)
        },
        init() {
            let container = document.getElementById('container');
            // CAMERA
            this.camera = new Three.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 1, 3000);
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
            console.log('model', this.loadedScene.scene)
            this.butterfly = this.loadedScene.scene
            this.scene.add(this.butterfly);
            //     this.butterfly.visible = false
            this.originalPosition()
            this.mixer = new Three.AnimationMixer(this.loadedScene.scene);

            // boudning
            const geometry = new Three.BoxGeometry(1, 1, 1);
            const material = new Three.MeshBasicMaterial({ color: 0x00ff00 });
            this.testMesh = new Three.Mesh(geometry, material);
            //  this.scene.add(this.testMesh);

            this.loadedScene.animations.forEach((clip) => {
                this.mixer.clipAction(clip).play();
            });
            this.wingSelected ? this.changeWing() : null
            this.createPath()
            this.loading = false
            if (this.wingSelected == 1) {

                this.butterfly.getObjectByName('Armature').scale.x = 1.310
                this.butterfly.getObjectByName('Armature').scale.y = 1.2
                this.butterfly.getObjectByName('Armature').scale.z = 1.640
                this.butterfly.getObjectByName('Armature').position.z = 0.660
                this.butterfly.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                this.butterfly.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                this.butterfly.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                this.butterfly.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                this.butterfly.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)

            }
            if (this.wingSelected == 2) {
                this.butterfly.getObjectByName('Armature').scale.x = 1.370
                this.butterfly.getObjectByName('Armature').scale.y = 1.020
                this.butterfly.getObjectByName('Armature').scale.z = 1.710
                this.butterfly.getObjectByName('Armature').position.z = 0.840
                this.butterfly.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                this.butterfly.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                this.butterfly.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                this.butterfly.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                this.butterfly.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            }
            if (this.wingSelected == 3) {
                this.butterfly.getObjectByName('Armature').position.z = 0.330
                this.butterfly.getObjectByName('Armature').scale.x = 1.400
                this.butterfly.getObjectByName('Armature').scale.y = 1.020
                this.butterfly.getObjectByName('Armature').scale.z = 1.750
                this.butterfly.getObjectByName('body').position.z = -1.006
                this.butterfly.getObjectByName('ant-1').position.z = 0.370
                this.butterfly.getObjectByName('ant-2').position.z = 0.370
                this.butterfly.getObjectByName('bulb_left').position.z = 1.819
                this.butterfly.getObjectByName('bulb_right').position.z = 1.819
            }

            this.scene.getObjectByName('body').material.color.setHex(0x000);
            this.scene.getObjectByName('body').material.metalness = 1;

            this.scene.getObjectByName('ant-1').material.color.setHex(0x000);
            this.scene.getObjectByName('ant-1').material.metalness = 1;

            this.scene.getObjectByName('ant-2').material.color.setHex(0x000);
            this.scene.getObjectByName('ant-2').material.metalness = 1;

            this.scene.getObjectByName('bulb_left').material.color.setHex(0x000);
            this.scene.getObjectByName('bulb_left').material.metalness = 1

            this.scene.getObjectByName('bulb_right').material.color.setHex(0x000);
            this.scene.getObjectByName('bulb_right').material.metalness = 1
            this.scene.getObjectByName('bulb_right').material.flatShading = true

            console.log(this.scene.getObjectByName('bulb_right').material)

            //  this.butterfly.getObjectByName('Armature').position.y = 1.2
            // RENDER
            this.renderer = new Three.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);
        },
        animate() {
            requestAnimationFrame(this.animate);
            var delta = this.clock.getDelta(9);
            if (this.mixer && this.butterfly) this.mixer.update(delta);
            if (this.ready) {
                if (this.clock.elapsedTime > 2) {
                    this.t += 0.01;
                    var pos = this.curve.getPoint(this.t);
                    var look = this.curve.getPoint(this.t + delta)

                    this.butterfly.position.set(pos.x, pos.y, pos.z);

                    //     this.butterfly.lookAt(look);
                } else {
                    // reset the position
                    this.originalPosition()
                    //   this.ready = false
                }
            }
            this.renderer.render(this.scene, this.camera);
        }
    },
    watch: {
        ready(val) {
            if (val) {
                //      this.butterfly.visible = true
            } else {
                //      this.butterfly.visible = false
            }

        }
    },
    mounted() {
        this.init();
        this.animate();
    }
}
</script>

<style>
#container {

    height: 2160px !important;
    width: 1920px;
    position: absolute;
    width: 100% !important;
    transition-duration: 1s;
    max-width: none !important;
    padding: 0 !important;
    pointer-events: none;
}

.background {
    background-color: olivedrab;
    position: absolute;
    height: 1080px !important;
    width: 1920px;
    position: absolute;
    top: 0;
    left: 0;
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
