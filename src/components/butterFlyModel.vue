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
import * as dat from 'dat.gui';
import { gsap, MotionPathPlugin } from "gsap/all";
gsap.registerPlugin(MotionPathPlugin);

export default {
    props: ['wingDesign', 'index', 'final', 'loadedScene', 'event_child', 'wingSelected', 'ready', 'resetTime'],
    name: 'ThreeTest',
    data() {
        return {
            gui: new dat.GUI(),
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
            axis: '',
            leave: false,
            sittingPoint: {
                x: -1,
                y: 3,
                z: -10
            }
        }
    },
    methods: {
        changeWing(design) {
            const texture = new Three.TextureLoader().load(design);
            const texture2 = new Three.TextureLoader().load(design);
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

            const material = new Three.MeshBasicMaterial({ map: texture, side: Three.DoubleSide })
            material.map.flipY = false
            material.map.center = new Three.Vector2(0.5, 0.5);
            material.map.rotation = Math.PI
            this.butterfly.getObjectByName('wing2').material = material

            const material2 = new Three.MeshBasicMaterial({ map: texture2, side: Three.DoubleSide })
            // material2.map.flipY = true
            material2.map.center = new Three.Vector2(0.5, 0.5);
            this.butterfly.getObjectByName('wing1').material = material2

        },
        originalPosition() {
            this.butterfly.scale.set(0.44, 0.44, 0.44)
            this.butterfly.position.set(0, -1.7, 0)
            this.butterfly.rotation.x = -30
            this.butterfly.rotation.y = -3.14
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
            // this.butterfly.visible = false
            this.originalPosition()
            this.mixer = new Three.AnimationMixer(this.loadedScene.scene);

            // boudning
            const geometry = new Three.BoxGeometry(1, 1, 1);
            const material = new Three.MeshBasicMaterial({ color: 0x00ff00 });
            this.testMesh = new Three.Mesh(geometry, material);
            //  this.scene.add(this.testMesh);

            // this.loadedScene.animations.forEach((clip) => {
            //     this.mixer.clipAction(clip).play();
            // });
            //  console.log(this.wingDesign)

            //this.createPath()
            this.loading = false
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

            //  this.butterfly.getObjectByName('Armature').position.y = 1.2
            // RENDER
            this.renderer = new Three.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);
        },

        wingSize() {
            if (this.wingSelected == 1) {

                this.butterfly.getObjectByName('wing2').scale.set(2.4, 5.9, 3.6)
                this.butterfly.getObjectByName('wing2').position.set(2.6, 0.93, -1.4)

                this.butterfly.getObjectByName('wing1').scale.set(2.4, 5.9, 3.6)
                this.butterfly.getObjectByName('wing1').position.set(-2.6, 0.93, -1.4)

                // this.butterfly.getObjectByName('wing1').position.z = 0.660
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
        },

        wiggle() {
            gsap.fromTo(this.butterfly.rotation, {
                y: -2.7,
            }, {
                y: -3.4,
                repeat: 1,
                repeatDelay: 0.01,
                yoyo: true,
                ease: 'none'
            })
        },

        moveAlong() {

            setTimeout(() => {
                this.wiggle()
            }, 500);
            gsap.to(this.butterfly.position, {
                z: -30,
                motionPath: {
                    path: [{ x: 0, y: 0, }, { x: -1, y: -0.5 }, { x: 0.5, y: 2 }, { x: -0.5, y: 5 }],
                    alignOrigin: [0, 0],
                    autoRotate: true
                },
                delay: 0.5,
                duration: 2,
            }).then(() => {

            });

            gsap.to(this.butterfly.position, {
                motionPath: {
                    path: [{ x: -1, y: 5 }, { x: 0.5, y: 15 }],
                    alignOrigin: [0, 0],
                    autoRotate: true
                },
                delay: 6,
                duration: 2,
            }).then(() => {
                //  this.butterfly.visible = false
                this.originalPosition()
            });

            setTimeout(() => {
                this.wiggle()
            }, 6000);
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);

            //   this.butterfly.getObjectByName('wing_lower2R').rotation.copy(this.butterfly.getObjectByName('wing_lowerR').rotation)
        }
    },
    watch: {
        ready(val) {
            if (val) {
                this.butterfly.visible = true
                //  this.wingSize()
                this.changeWing(this.wingDesign)
                this.moveAlong()

            } else {
                // this.butterfly.visible = false
                //this.originalPosition()

            }

        }
    },
    mounted() {

        this.init();
        this.animate();
        gsap.to(this.butterfly.getObjectByName('wing1').rotation, { z: -1, repeat: -1, duration: 0.2, yoyo: true });
        gsap.to(this.butterfly.getObjectByName('wing2').rotation, { z: 1, repeat: -1, duration: 0.2, yoyo: true });

        const size = this.gui.addFolder('Size')
        size.add(this.butterfly.getObjectByName('wing1').scale, 'x', 0, 10)
        size.add(this.butterfly.getObjectByName('wing1').scale, 'y', 0, 10)
        size.add(this.butterfly.getObjectByName('wing1').scale, 'z', 0, 10)

        const pos = this.gui.addFolder('Position')
        pos.add(this.butterfly.getObjectByName('wing1').position, 'x', -3, 3)
        pos.add(this.butterfly.getObjectByName('wing1').position, 'y', -3, 3)
        pos.add(this.butterfly.getObjectByName('wing1').position, 'z', -3, 3)

        // const rot = this.gui.addFolder('Rotation')
        // rot.add(this.butterfly.rotation, 'y', -10, 10)
        // rot.add(this.butterfly.rotation, 'z', -10, 10)

        // const wing = this.gui.addFolder('Move wing upper')
        // wing.add(this.butterfly.getObjectByName('wing_upperR').rotation, 'z', -10, 10)

        // const wingLow = this.gui.addFolder('Move wing lower')
        // wingLow.add(this.butterfly.getObjectByName('wing_lowerR').rotation, 'x', -10, 10)
        // wingLow.add(this.butterfly.getObjectByName('wing_lowerR').rotation, 'y', -10, 10)
        // wingLow.add(this.butterfly.getObjectByName('wing_lowerR').rotation, 'z', -10, 10)

        // wingLow.add(this.butterfly.getObjectByName('wing_lower2R').rotation, 'x', -10, 10)

        //     wingLow.add(this.butterfly.getObjectByName('wing_lower2R').position, 'x', -10, 10)

        // gsap.to(this.butterfly.rotation, {
        //     //   y: '10%',
        //     repeat: -1,
        //     yoyo: true,
        //     y: 3,

        //     duration: 2,
        // });

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
