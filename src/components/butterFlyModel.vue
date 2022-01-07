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
            landingZones: [{ x: 0, y: 1 }, { x: -2.4, y: 1.4, z: -30 }, { x: 1.5, y: 1.3 }], // in order
            gui: new dat.GUI(),
            loading: true,
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
            if (item) {
                let image = ''
                let model = null

                if (main) {
                    image = this.allDesigns[0].image
                    model = item
                } else {
                    image = item.image
                    model = item.model
                }

                const texture = new Three.TextureLoader().load(image);
                const texture2 = new Three.TextureLoader().load(image);

                if (texture.onUpdate) {
                    texture.needsUpdate = true;
                    texture.onUpdate(texture);
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
            // this is the one first generated

            butterFly.model = this.loadedScene.scene.clone()
            butterFly.model.visible = true
            butterFly.model.name = 'Butterfly2'
            butterFly.timeLine = gsap.timeline({ repeat: -1, repeatDelay: 0.1, onComplete: () => alert('stop') });
            butterFly.flapTl = gsap.timeline({ paused: false });
            // set positions
            butterFly.model.scale.set(0.13, 0.13, 0.13)
            butterFly.model.position.set(0, -2, 0)
            butterFly.model.rotation.x = -30
            butterFly.model.rotation.y = -3.14
            this.scene.add(butterFly.model)
            // load inital 
            if (this.allDesigns[index] && this.allDesigns[index].image) {
                this.changeWing(butterFly)
            }
            // SCENE 1

            //    gsap.to(this.butterfly.getObjectByName('wingRight').rotation, { z: -0.1, repeat: -1, duration: 0.2, yoyo: true });
            // gsap.to(this.butterfly.getObjectByName('wingLeft').rotation, { z: 0.1, repeat: -1, duration: 0.2, yoyo: true });

            // Wings
            butterFly.flapTl.to(butterFly.model.getObjectByName('wingRight').rotation, {
                z: -1,
                // y: 0.5,
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
            })

            // body

            butterFly.flapTl.fromTo(butterFly.model.rotation, {
                y: -2.7,
            }, {
                y: -3.4,
                repeat: -1,
                repeatDelay: 0.01,
                yoyo: true,
                ease: 'none'
            })

            butterFly.timeLine.to(butterFly.model.position, {
                z: 0,
                motionPath: {
                    path: this.paths[index].enter,
                    alignOrigin: [0, 0],
                    autoRotate: true
                },
                delay: startDelay,
                duration: 2,
                onComplete: () => butterFly.flapTl.timeScale(0.01)
            })
            // SCENE 2
            butterFly.timeLine.to(butterFly.model.position, {
                z: 10,
                motionPath: {
                    path: this.paths[index].leave,
                    alignOrigin: [0, 0],
                    autoRotate: true
                },
                delay: restDelay,
                duration: 2,
                onStart: () => butterFly.flapTl.timeScale(1),
                onComplete: () => this.changeWing(butterFly),

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
            //   this.loadButterFlyB()
            // this.loadButterFlyC()

            // bounding
            const geometry = new Three.BoxGeometry(10.000, 5.380, 1);
            const material = new Three.MeshBasicMaterial({
                blending: 0,
                transparent: false,
                opacity: 0,
                color: 0x00000,
                //        wireframe: true
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
        },

        wingSize() {
            if (this.wingSelected == 1) {
                this.butterfly.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
                this.butterfly.getObjectByName('wingRight').position.set(0.5342, 0.84, 1.06)
                this.butterfly.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
                this.butterfly.getObjectByName('wingLeft').position.set(-0.4577, 0.84, 1.06)
                // this.butterfly.getObjectByName('wingRight').position.z = 0.660
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

        // flapWings(object) {
        //     object.flapTl.to(object.model.getObjectByName('wingRight').rotation, { z: -1, y: 0.1, duration: 0.2, repeat: -1, yoyo: true })
        //     object.flapTl.to(object.model.getObjectByName('wingLeft').rotation, { z: 1, y: 0.1, duration: 0.2, repeat: -1, yoyo: true })
        // },

        moveAlong() {
            // this is for the new butterfly
            gsap.to(this.butterfly.scale, { x: 0.13, y: 0.13, z: 0.13, delay: 2, duration: 1 })
            gsap.to(this.butterfly.getObjectByName('wingRight').rotation, { z: -1, y: 0.1, duration: 1 });
            gsap.to(this.butterfly.getObjectByName('wingLeft').rotation, { z: 1, duration: 1 }).then(() => {
                setTimeout(() => {
                    this.wiggle()
                }, 1000);

                gsap.to(this.butterfly.getObjectByName('wingRight').rotation, { z: -0.1, repeat: -1, duration: 0.2, yoyo: true });
                gsap.to(this.butterfly.getObjectByName('wingLeft').rotation, { z: 0.1, repeat: -1, duration: 0.2, yoyo: true });
            });

            gsap.to(this.butterfly.position, {
                motionPath: {
                    path: [{ x: 0, y: 0, }, this.landingZones[0]],
                    alignOrigin: [0, 0],
                    autoRotate: true
                },
                delay: 2,
                duration: 2,
            }).then(() => {

            });

            gsap.to(this.butterfly.position, {
                motionPath: {
                    path: [{ x: 1, y: 1 }, this.landingZones[0], { x: 2, y: 7 }],
                    alignOrigin: [0, 0],
                    autoRotate: true
                },
                delay: 7,
                duration: 2,
            }).then(() => {
                this.butterfly.visible = false
                this.originalPosition()
            });

            setTimeout(() => {
                this.wiggle()
            }, 7000);
        },

        switchWings() {
            this.butterflyA.image = this.allDesigns[0].image
            this.butterflyB.image = this.allDesigns[1].image
            this.butterflyC.image = this.allDesigns[2].image
        },

        animate() {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
        }

    },

    computed: {
        // { x: -2, y: 0, }, this.landingZones[1]
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
        }
    },

    watch: {

        allDesigns(updated) {
            this.switchWings()
        },

        ready(val) {
            if (val) {
                this.butterfly.visible = true
                this.wingSize()

                this.changeWing(this.butterfly, true)
                this.moveAlong()
            }
        }
    },
    mounted() {
        //alert('add camera cntroler')
        this.switchWings()
        this.init();

        this.animate();

        const size = this.gui.addFolder('Size')
        size.add(this.butterfly.getObjectByName('wingLeft').scale, 'x', 0, 10)
        size.add(this.butterfly.getObjectByName('wingLeft').scale, 'y', 0, 10)
        size.add(this.butterfly.getObjectByName('wingLeft').scale, 'z', 0, 10)

        const pos = this.gui.addFolder('Position')
        pos.add(this.butterfly.getObjectByName('wingLeft').position, 'x', -3, 3)
        pos.add(this.butterfly.getObjectByName('wingLeft').position, 'y', -3, 3)
        pos.add(this.butterfly.getObjectByName('wingLeft').position, 'z', -3, 3)

        const rot = this.gui.addFolder('Rotation')
        rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'x', -3, 3)
        rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'y', -3, 3)
        //     rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'z', -3, 3).onChange(this.changeRot);

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
