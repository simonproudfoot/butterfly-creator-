<template>
<div>
    <video class="background" autoplay muted loop :src="require('@/assets/slave-bg.mp4')"></video>
    <div id="container" class="container">
        <div id="looping"></div>
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
    props: ['wingDesign', 'index', 'final', 'loadedScene', 'event_child', 'wingSelected', 'ready', 'resetTime', 'loopA', 'allDesigns'],
    name: 'ThreeTest',
    data() {
        return {
            mainTl: gsap.timeline({ paused: true }),
            butterflyScale: 0.20,
            landingZones: [{ x: 0, y: 1 }, { x: -2.4, y: 1.4, z: -30 }, { x: 1.5, y: 1.3 }], // in order
            gui: new dat.GUI(),
            loading: true,
            flapSettings: {
                z: -1,
                repeat: -1,
                delay: 0,
                duration: 0.05,
                yoyo: true
            },
            clock: new Three.Clock(),
            mixer: null,
            camera: null,
            scene: null,
            renderer: null,
            butterfly: null,
            butterflyA: {
                model: null,
                timeLine: null,
                flapping: true,
                image: null
            },
            butterflyB: {
                model: null,
                timeLine: null,
                image: null
            },
            butterflyC: {
                model: null,
                timeLine: null,
                image: null
            },
            alphaMapImageUlr: require('@/assets/test.png'),
            curve: null,
            points: null,
            t: 0,
            maskObject: null,
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
        changeWing(item, main) {
            let image;
            let model;
            let wing;
            if (item) {
                if (main) {
                    image = this.allDesigns[0].image
                    wing = this.allDesigns[0].wing
                    model = item
                } else {
                    image = item.image
                    model = item.model
                    wing = item.wing
                }
                const texture = new Three.TextureLoader().load(image);
                const texture2 = new Three.TextureLoader().load(image);
                if (texture.onUpdate) {
                    texture.needsUpdate = true;
                    texture.onUpdate(texture);
                }
                // if (this.wingSelected == 1) {
                //     texture.offset.x = -0.050
                //     texture.offset.y = -0.030
                // }
                // if (this.wingSelected == 2) {
                //     texture.offset.x = -0.040
                //     texture.offset.y = -0.030
                // }
                if (wing == 3) {
                    // texture.offset.x = 1
                    texture.offset.y = 0.030
                }
                const material = new Three.MeshBasicMaterial({ map: texture, side: Three.DoubleSide, alphaTest: 0.5 })
                material.map.flipY = false
                material.map.center = new Three.Vector2(0.5, 0.5);
                material.map.rotation = Math.PI
                model.getObjectByName('wingLeft').material = material
                const material2 = new Three.MeshBasicMaterial({ map: texture2, side: Three.DoubleSide, alphaTest: 0.5 })
                material2.map.center = new Three.Vector2(0.5, 0.5);
                model.getObjectByName('wingRight').material = material2
                setTimeout(() => {
                    model.getObjectByName('wingLeft').material.needsUpdate = true
                    model.getObjectByName('wingRight').material.needsUpdate = true
                }, 1000);
            }
        },
        changeWingsAll(butterFly) {
            this.changeWing(butterFly)
            this.wingSize(butterFly)
            //  this.hideShow();
        },
        originalPosition() {
            this.butterfly.scale.set(0.44, 0.44, 0.44)
            this.butterfly.position.set(0, -1.7, 0)
            this.butterfly.rotation.x = -30
            this.butterfly.rotation.y = -3.14
            gsap.set(this.butterfly.getObjectByName('wingRight').rotation, { z: 0 })
            gsap.set(this.butterfly.scale, { x: 0.44, y: 0.44, z: 0.44 })
            gsap.set(this.butterfly.getObjectByName('wingLeft').rotation, { z: 0 })
        },
        loadButterFly(butterFly, index, startDelay, restDelay) {
            butterFly.model = this.loadedScene.scene.clone()
            butterFly.model.visible = true
            butterFly.model.name = 'Butterfly-' + index
            butterFly.timeLine = gsap.timeline({ repeat: -1, repeatDelay: 0.1 });
            butterFly.flapTl = gsap.timeline({ paused: false });
            // set positions
            butterFly.model.scale.set(this.butterflyScale, this.butterflyScale, this.butterflyScale)
            butterFly.model.position.set(0, -2, 0)
            butterFly.model.rotation.x = -30
            butterFly.model.rotation.y = -3.14
            this.scene.add(butterFly.model)
            // load inital 
            if (this.allDesigns[index] && this.allDesigns[index].image) {
                this.changeWingsAll(butterFly)
            }
            // Wings
            butterFly.flapTl.to(butterFly.model.getObjectByName('wingRight').rotation, {
                z: -1,
                repeat: -1,
                delay: 0,
                duration: 0.05,
                yoyo: true
            })
            butterFly.flapTl.to(butterFly.model.getObjectByName('wingLeft').rotation, {
                z: 1,
                // y: 0.5,
                repeat: -1,
                delay: 0,
                duration: 0.05,
                yoyo: true
            }, 0)
            // body
            // butterFly.flapTl.fromTo(butterFly.model.rotation, {
            //     y: -2.7,
            // }, {
            //     y: -3.4,
            //     repeat: -1,
            //     repeatDelay: 0.01,
            //     yoyo: true,
            //     ease: 'none'
            // })
            // SCENE 1 - enter
            butterFly.timeLine.to(butterFly.model.position, {
                //   z: 0,
                motionPath: {
                    path: this.paths[index].enter,
                    autoRotate: true,
                },
                //onUpdate: this.updateMesh(butterFly),
                delay: startDelay,
                duration: 2,
                onComplete: () => butterFly.flapTl.timeScale(0.01),
            })
            // SCENE 2 - fly away
            butterFly.timeLine.to(butterFly.model.position, {
                motionPath: {
                    path: this.paths[index].leave,
                    autoRotate: true,
                    useRadians: true
                },
                delay: restDelay,
                duration: 2,
                onStart: () => butterFly.flapTl.timeScale(1),
                onComplete: () => this.changeWingsAll(butterFly),
            })
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
            this.butterfly = this.loadedScene.scene
            this.scene.add(this.butterfly);
            this.butterfly.visible = false
            this.originalPosition()
            this.loadButterFly(this.butterflyA, 0, 2, 3) // index, start delay, rest delay
            this.loadButterFly(this.butterflyB, 1, 1, 3) // index, start delay, rest delay
            this.loadButterFly(this.butterflyC, 2, 1, 5) // index, start delay, rest delay
            // bounding
            const geometry = new Three.BoxGeometry(10.000, 5.380, 1);
            const material = new Three.MeshBasicMaterial({
                blending: 0,
                transparent: false,
                opacity: 0,
                color: 0x00000,
            });
            this.maskObject = new Three.Mesh(geometry, material);
            this.maskObject.position.set(0.450, -2.690, -0.360)
            this.scene.add(this.maskObject)
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
            // RENDER
            this.renderer = new Three.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);
            this.hideShow()
        },
        wingSize(butterFly, main) {
            let size = this.allDesigns[0].wing
            let model;
            if (main) {
                model = butterFly
            } else {
                model = butterFly.model
            }
            if (size == 1) {
                model.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingRight').position.set(0.3919, 0.84, 1.06)
                model.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingLeft').position.set(-0.3919, 0.84, 1.06)
                // model.getObjectByName('wingRight').position.z = 0.660
                model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            }
            if (size == 2) {
                model.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingRight').position.set(0.3919, 0.84, 1.06)
                model.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingLeft').position.set(-0.3919, 0.84, 1.06)
                // model.getObjectByName('wingRight').position.z = 0.660
                model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
                // model.getObjectByName('Armature').scale.x = 1.370
                // model.getObjectByName('Armature').scale.y = 1.020
                // model.getObjectByName('Armature').scale.z = 1.710
                // model.getObjectByName('Armature').position.z = 0.840
                // model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                // model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                // model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                // model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                // model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            }
            if (size == 3) {
                model.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingRight').position.set(0.3919, 0.84, 1.2)
                model.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingLeft').position.set(-0.3919, 0.84, 1.2)
                // model.getObjectByName('wingRight').position.z = 0.660
                model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
                // model.getObjectByName('Armature').position.z = 0.330
                // model.getObjectByName('Armature').scale.x = 1.400
                // model.getObjectByName('Armature').scale.y = 1.020
                // model.getObjectByName('Armature').scale.z = 1.750
                model.getObjectByName('body').position.z = -1.006
                model.getObjectByName('ant-1').position.z = 0.370
                model.getObjectByName('ant-2').position.z = 0.370
                model.getObjectByName('bulb_left').position.z = 1.819
                model.getObjectByName('bulb_right').position.z = 1.819
            }
            //  console.log('to wing', butterFly.model.name)
            // if (butterFly.wing == 1) {
            //     butterFly.model.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
            //     butterFly.model.getObjectByName('wingRight').position.set(0.3919, 0.84, 1.06)
            //     butterFly.model.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
            //     butterFly.model.getObjectByName('wingLeft').position.set(-0.3919, 0.84, 1.06)
            //     // butterFly.model.getObjectByName('wingRight').position.z = 0.660
            //     butterFly.model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
            //     butterFly.model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
            //     butterFly.model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
            //     butterFly.model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
            //     butterFly.model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            // }
            // if (butterFly.wing == 2) {
            //     butterFly.model.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
            //     butterFly.model.getObjectByName('wingRight').position.set(0.3919, 0.84, 1.06)
            //     butterFly.model.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
            //     butterFly.model.getObjectByName('wingLeft').position.set(-0.3919, 0.84, 1.06)
            //     // butterFly.model.getObjectByName('wingRight').position.z = 0.660
            //     butterFly.model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
            //     butterFly.model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
            //     butterFly.model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
            //     butterFly.model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
            //     butterFly.model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            //     // butterFly.model.getObjectByName('Armature').scale.x = 1.370
            //     // butterFly.model.getObjectByName('Armature').scale.y = 1.020
            //     // butterFly.model.getObjectByName('Armature').scale.z = 1.710
            //     // butterFly.model.getObjectByName('Armature').position.z = 0.840
            //     // butterFly.model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
            //     // butterFly.model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
            //     // butterFly.model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
            //     // butterFly.model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
            //     // butterFly.model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            // }
            // if (butterFly.wing == 3) {
            //     butterFly.model.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
            //     butterFly.model.getObjectByName('wingRight').position.set(0.3919, 0.84, 1.2)
            //     butterFly.model.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
            //     butterFly.model.getObjectByName('wingLeft').position.set(-0.3919, 0.84, 1.2)
            //     // butterFly.model.getObjectByName('wingRight').position.z = 0.660
            //     butterFly.model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
            //     butterFly.model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
            //     butterFly.model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
            //     butterFly.model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
            //     butterFly.model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            //     // butterFly.model.getObjectByName('Armature').position.z = 0.330
            //     // butterFly.model.getObjectByName('Armature').scale.x = 1.400
            //     // butterFly.model.getObjectByName('Armature').scale.y = 1.020
            //     // butterFly.model.getObjectByName('Armature').scale.z = 1.750
            //     butterFly.model.getObjectByName('body').position.z = -1.006
            //     butterFly.model.getObjectByName('ant-1').position.z = 0.370
            //     butterFly.model.getObjectByName('ant-2').position.z = 0.370
            //     butterFly.model.getObjectByName('bulb_left').position.z = 1.819
            //     butterFly.model.getObjectByName('bulb_right').position.z = 1.819
            // }
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
        // flapWings(object) {
        //     object.flapTl.to(object.model.getObjectByName('wingRight').rotation, { z: -1, y: 0.1, duration: 0.2, repeat: -1, yoyo: true })
        //     object.flapTl.to(object.model.getObjectByName('wingLeft').rotation, { z: 1, y: 0.1, duration: 0.2, repeat: -1, yoyo: true })
        // },
        moveAlong() {
            // this is for the new butterfly
            this.mainTl.play()
            //  this.mainTl.to(this.butterfly.scale, { x: this.butterflyScale, y: this.butterflyScale, z: this.butterflyScale, delay: 2, duration: 1 })
            this.mainTl.to(this.butterfly.getObjectByName('wingRight').rotation, { z: -1, duration: 0.5, repeat: 2, yoyo: true });
            this.mainTl.to(this.butterfly.getObjectByName('wingLeft').rotation, { z: 1, duration: 0.5, repeat: 2, yoyo: true }, 0)
            // mainTl(() => {
            //   //  this.wiggle()
            // }, 1000);

            this.mainTl.to(this.butterfly.getObjectByName('wingRight').rotation, { delay: 0.8, z: -0.1, repeat: -1, duration: 0.05, yoyo: true }, 1);
            this.mainTl.to(this.butterfly.getObjectByName('wingLeft').rotation, { delay: 0.8, z: 0.1, repeat: -1, duration: 0.05, yoyo: true }, 1);
            this.mainTl.to(this.butterfly.scale, { x: this.butterflyScale, y: this.butterflyScale, z: this.butterflyScale, duration: 1, delay: 1 }, 1)

            this.mainTl.to(this.butterfly.position, {
                motionPath: {
                    path: this.paths[0].enter,
                    autoRotate: true
                },
                delay: 0.8,
                duration: 2,
            }, 1)
            //.then(() => {});
            this.mainTl.to(this.butterfly.position, {
                motionPath: {
                    path: this.paths[0].leave,
                    alignOrigin: [0, 0],
                    autoRotate: true
                },
                delay: 7,
                duration: 2,
                onComplete: () => this.resetOrig(),
            })
            // setTimeout(() => {
            //     this.wiggle()
            // }, 7000);
        },

        resetOrig() {
            this.butterfly.visible = false
            this.mainTl.pause(0)
            this.originalPosition()
     
        },

        switchWings() {
            this.allDesigns[0] ? this.butterflyA.image = this.allDesigns[0].image : null
            this.allDesigns[1] ? this.butterflyB.image = this.allDesigns[1].image : null
            this.allDesigns[2] ? this.butterflyC.image = this.allDesigns[2].image : null
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
        },
        hideShow() {
            this.allDesigns[0] ? this.butterflyA.model.visible = true : this.butterflyA.model.visible = false
            this.allDesigns[1] ? this.butterflyB.model.visible = true : this.butterflyB.model.visible = false
            this.allDesigns[2] ? this.butterflyC.model.visible = true : this.butterflyC.model.visible = false
        }
    },
    computed: {
        paths() {
            let paths = [{
                    enter: [{ x: 0, y: 0, }, this.landingZones[0]],
                    leave: [this.landingZones[0], { x: 0, y: 5 }]
                },
                {
                    enter: [{ x: -2, y: 0, }, this.landingZones[1]],
                    leave: [this.landingZones[1], { x: 0, y: 5, }]
                },
                {
                    enter: [{ x: -2, y: 0, }, this.landingZones[2]],
                    leave: [this.landingZones[2], { x: 0, y: 5, }]
                }
            ]
            return paths
        },
    },
    watch: {
        allDesigns(updated) {
            this.switchWings()
        },
        ready(val) {
            if (val) {
                this.butterfly.visible = true
                this.wingSize(this.butterfly, true)
                this.changeWing(this.butterfly, true)
                this.moveAlong()
                this.hideShow()
            }
        }
    },
    mounted() {
        //alert('add camera cntroler')
        this.switchWings()
        this.init();
        //  alert('todo, set textureoffsets, option for no flys yet, curve directions, hide new first time')
        this.animate();
        //setTimeout(() => {
        //   }, 1000);
        const size = this.gui.addFolder('Size')
        size.add(this.butterfly.getObjectByName('wingLeft').scale, 'x', 0, 10, 0.1)
        size.add(this.butterfly.getObjectByName('wingLeft').scale, 'y', 0, 10, 0.1)
        size.add(this.butterfly.getObjectByName('wingLeft').scale, 'z', 0, 10, 0.1)
        const pos = this.gui.addFolder('Position')
        pos.add(this.butterfly.getObjectByName('wingLeft').position, 'x', -3, 3, 0.1)
        pos.add(this.butterfly.getObjectByName('wingLeft').position, 'y', -3, 3, 0.1)
        pos.add(this.butterfly.getObjectByName('wingLeft').position, 'z', -3, 3, 0.1)
        const rot = this.gui.addFolder('Rotation')
        rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'x', -3, 3, 0.1)
        rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'y', -3, 3, 0.1)
        //  rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'z', -3, 3).onChange(this.changeRot);
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
        // wingLow.add(this.butterfly.getObjectByName('wing_lower2R').position, 'x', -10, 10)
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
