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
import { gsap, MotionPathPlugin, Power2 } from "gsap/all";
gsap.registerPlugin(MotionPathPlugin);

export default {
    props: ['wingDesign', 'index', 'final', 'loadedScene', 'event_child', 'wingSelected', 'ready', 'resetTime', 'loopA', 'allDesigns'],
    name: 'ThreeTest',
    data() {
        return {
            mainAnimationActive: false,
            premadeimages: [require('@/assets/4x/premade1@4x.png'), require('@/assets/4x/premade2@4x.png'), require('@/assets/4x/premade3@4x.png'), require('@/assets/4x/premade4@4x.png'), require('@/assets/4x/premade5@4x.png')],

            paths: {
                path1: [
                    { x: 0, y: -1, }, { x: -2, y: -1, }, { x: -1.4, y: 3 }, { x: -3, y: 6 }
                ],
                path2: [
                    { x: 0, y: -1, }, { x: 0.3, y: 1.8 }, { x: 2, y: 6 }
                ],
                path3: [
                    { x: 0, y: -1, }, { x: 0.8, y: -1, }, { x: 1.2, y: 3 }, { x: -2, y: 6 }
                ],
                path4: [
                    { x: 0, y: -1, }, { x: 1.4, y: -1, }, { x: 3.3, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }
                ],
                path5: [
                    { x: 0, y: -1, }, { x: -5, y: -1, }, { x: -2, y: 3 }, { x: -3, y: 6 }
                ]
            },
            flapSpeed: {
                slow: 0.01,
                fast: 0.8,
            },
            mainTl: null,
            mainFlapTl: null,
            curve1: {
                line: null,
                points: null
            },
            butterflyScale: 0.15,
            //  landingZones: [{ x: 0, y: 1 }, { x: -2.4, y: 1.4, z: -30 }, { x: 1.5, y: 1.3 },], // in order
            //  gui: new dat.GUI(),
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
                flapTl: null,
                timeLine: null,
                rotation: null,
                image: null
            },
            butterflyB: {
                model: null,
                timeLine: null,
                flapTl: null,
                image: null,
                rotation: null,
            },
            butterflyC: {
                model: null,
                timeLine: null,
                flapTl: null,
                image: null,
                rotation: null,
            },
            butterflyD: {
                size: null,
                model: null,
                timeLine: null,
                flapTl: null,
                image: null,
                rotation: null,
            },
            butterflyE: {
                size: null,
                model: null,
                timeLine: null,
                flapTl: null,
                image: null,
                rotation: null,
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
        changeWing(item, main, premade) {
            let image;
            let model;
            let wing;
            if (item) {
                if (main) {
                    image = this.allDesigns[0].image
                    wing = this.allDesigns[0].wing
                    model = item
                    this.wingSize(item, this.allDesigns[0].wing)
                } else {
                    image = item.image
                    model = item.model
                    wing = item.wing
                    this.wingSize(item, item.wing)
                }
                let random = Math.floor(Math.random() * 5);

                if (premade) {
                    image = this.premadeimages[random]
                    model = item.model
                    if (random == 3 || random == 5) {
                        wing = 3
                    } else if (random == 1) {
                        wing = 2
                    } else {
                        wing = 1
                    }

                    //   console.log('premade',item.model)

                    //      
                }

                console.log(item.name + ' is wing ' + wing)

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
                console.log(model.getObjectByName('wingLeft'))
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
            console.log(butterFly.model.name)
            if (butterFly.model.name == "Butterfly-3" || butterFly.model.name == "Butterfly-4") {
                this.changeWing(butterFly, false, true)
            } else {
                this.changeWing(butterFly)
                this.wingSize(butterFly)
            }

            //  this.hideShow();
        },
        originalPosition() {
            this.butterfly.scale.set(0.44, 0.44, 0.44)
            this.butterfly.position.set(0, -1.7, 0)
            this.butterfly.rotation.x = -30
            this.butterfly.rotation.y = -3.14
            gsap.set(this.butterfly.getObjectByName('wingRight').rotation, { z: 0, repeat: 0 })
            gsap.set(this.butterfly.getObjectByName('wingLeft').rotation, { z: 0, repeat: 0 })
            gsap.set(this.butterfly.scale, { x: 0.44, y: 0.44, z: 0.44 })

        },

        changeFlap(butterFly, fast, main, mainStart) {
            if (!main) {
                if (butterFly.flapTl && butterFly.flapTl.isActive()) {
                    butterFly.flapTl.kill()
                }

                butterFly.flapTl = gsap.timeline({ paused: true, smoothChildTiming: true, repeat: -1, yoyo: true });

                butterFly.model.getObjectByName('wingRight').rotation.z = 0
                butterFly.model.getObjectByName('wingLeft').rotation.z = 0

                if (fast) {

                    butterFly.flapTl.to(butterFly.model.getObjectByName('wingRight').rotation, {
                        z: -1,
                        duration: 0.1,
                    }, 0)
                    butterFly.flapTl.to(butterFly.model.getObjectByName('wingLeft').rotation, {
                        z: 1,
                        duration: 0.1,
                    }, 0)

                } else {
                    butterFly.flapTl.repeatDelay(Math.floor(Math.random() * 3))
                    butterFly.flapTl.to(butterFly.model.getObjectByName('wingRight').rotation, {
                        z: 0,
                        delay: 2,
                        duration: 1,
                    }, 0)
                    butterFly.flapTl.to(butterFly.model.getObjectByName('wingLeft').rotation, {
                        z: 0,
                        delay: 2,
                        duration: 1,
                    }, 0)

                    butterFly.flapTl.to(butterFly.model.getObjectByName('wingRight').rotation, {
                        z: -0.5,
                        duration: 1,

                    }, 1)
                    butterFly.flapTl.to(butterFly.model.getObjectByName('wingLeft').rotation, {
                        z: 0.5,
                        duration: 1,
                    }, 1)
                }
                butterFly.flapTl.play(0)
            } else {

                if (this.mainFlapTl && this.mainFlapTl.isActive()) {
                    this.mainFlapTl.kill()
                }

                this.mainFlapTl = gsap.timeline({ paused: true, smoothChildTiming: true, repeat: -1, yoyo: true });
                this.butterfly.getObjectByName('wingRight').rotation.z = 0
                this.butterfly.getObjectByName('wingLeft').rotation.z = 0

                if (fast) {
                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingRight').rotation, {
                        z: -1,
                        duration: 0.1,
                    }, 0)
                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingLeft').rotation, {
                        z: 1,
                        duration: 0.1,
                    }, 0)

                } else if (mainStart) {
                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingRight').rotation, { z: -1, duration: 0.5, repeat: 2, yoyo: true });
                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingLeft').rotation, { z: 1, duration: 0.5, repeat: 2, yoyo: true }, 0)
                } else {
                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingRight').rotation, {
                        z: 0,
                        delay: 2,
                        duration: 1,
                    }, 0)
                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingLeft').rotation, {
                        z: 0,
                        delay: 2,
                        duration: 1,
                    }, 0)

                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingRight').rotation, {
                        z: -0.5,
                        duration: 1,

                    }, 1)
                    this.mainFlapTl.to(this.butterfly.getObjectByName('wingLeft').rotation, {
                        z: 0.5,
                        duration: 1,
                    }, 1)
                }
                this.mainFlapTl.play(0)
            }
        },

        loadButterFly(butterFly, index, startDelay, restDelay, path, stopAt) {
            butterFly.model = this.loadedScene.scene.clone()
            butterFly.model.visible = true
            butterFly.model.name = 'Butterfly-' + index
            butterFly.timeLine = gsap.timeline({ repeat: -1, ease: 'none', });
            butterFly.model.scale.set(this.butterflyScale, this.butterflyScale, this.butterflyScale)
            butterFly.model.position.set(0, -1, -1)
            butterFly.model.rotation.x = -30
            butterFly.model.rotation.y = -3.14
            this.scene.add(butterFly.model)

            // create curve 
            const curve = new Three.SplineCurve();

            this.paths[path].forEach(element => {
                curve.points.push(new Three.Vector2(element.x, element.y))
            })

            const points = curve.getPoints(50);
            const geometry2 = new Three.BufferGeometry().setFromPoints(points);

            let linecolor;
            let visible;
            if (index == 2) {
                visible = true
                linecolor = 'fc0303'
            } else {
                visible = true
                linecolor = Math.floor(Math.random() * 16777215).toString(16);
            }

            const material2 = new Three.LineBasicMaterial({ visible: false, color: '#' + linecolor });
            this.curve1.points = points
            this.curve1.curve = new Three.Line(geometry2, material2);
            this.scene.add(this.curve1.curve)

            // load inital 
            if (this.allDesigns[index] && this.allDesigns[index].image) {
                this.changeWingsAll(butterFly)
            }
            //  this.changeFlap(butterFly, true)
            // SCENE 1 - enter

            butterFly.timeLine.set(butterFly.model.position, { y: -4 })
            butterFly.timeLine.to(butterFly.model.position, {
                motionPath: {
                    path: this.paths[path],
                    autoRotate: true,
                    useRadians: true,
                    end: stopAt,
                    fromCurrent: true,
                },
                delay: Math.floor(Math.random() * 20) + 5,
                ease: "Power2.easeOut", //do this
                immediateRender: true,
                duration: path == 'path5' ? 3 : 2,
                onStart: () => this.changeFlap(butterFly, true, false),
                onUpdate: (i) => butterFly.model.rotation.y = butterFly.timeLine['_recent']['_targets'][0]['rotation'] + Math.PI / 2,
                onComplete: () => this.changeFlap(butterFly, false, false),
            })

            // SCENE 2 - fly away
            butterFly.timeLine.to(butterFly.model.position, {
                z: 5,
                motionPath: {
                    path: this.paths[path],
                    start: stopAt,
                    autoRotate: true,
                    useRadians: true,
                    fromCurrent: true
                },
                ease: "Power1.easeIn", //do this
                immediateRender: true,
                delay: Math.floor(Math.random() * 20) + 5,
                duration: 2,
                onUpdate: (i) => butterFly.model.rotation.y = butterFly.timeLine['_recent']['_targets'][0]['rotation'] + Math.PI / 2,
                onStart: () => this.changeFlap(butterFly, true),
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
            this.loadButterFly(this.butterflyA, 0, 4, 3, 'path1', 0.7) // index, start delay, rest delay, path, stopPoint
            this.loadButterFly(this.butterflyB, 1, 1, 3, 'path2', 0.35) // MAIN! index, start delay, rest delay 
            this.loadButterFly(this.butterflyC, 2, 6, 5, 'path3', 0.36) // index, start delay, rest delay

            this.loadButterFly(this.butterflyD, 3, 2, 5, 'path4', 0.51) // index, start delay, rest delay
            this.loadButterFly(this.butterflyE, 4, 1, 5, 'path5', 0.65) // index, start delay, rest delay

            this.changeWing(this.butterflyD, false, true)
            this.changeWing(this.butterflyE, false, true)

          //  this.wingSize(this.butterflyD, false, this.butterflyD.size)

            // boundingfs
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
        wingSize(butterFly, main, premade) {
            let size;
            if (!premade) {
                size = this.allDesigns[0].wing
            }
            if (premade) {
                size = premade
                //  alert(premade)
            }
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
                model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
            }
            if (size == 3) {
                model.getObjectByName('wingRight').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingRight').position.set(0.3919, 0.84, 1.2)
                model.getObjectByName('wingLeft').scale.set(2.4, 1.9, 3.5)
                model.getObjectByName('wingLeft').position.set(-0.3919, 0.84, 1.2)
                model.getObjectByName('body').position.set(0.000, 0.729, -1.926)
                model.getObjectByName('ant-1').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('ant-2').position.set(0.008, 0.810, -0.496)
                model.getObjectByName('bulb_left').position.set(0.446, 0.813, 0.959)
                model.getObjectByName('bulb_right').position.set(-0.433, 0.813, 0.959)
                model.getObjectByName('body').position.z = -1.006
                model.getObjectByName('ant-1').position.z = 0.370
                model.getObjectByName('ant-2').position.z = 0.370
                model.getObjectByName('bulb_left').position.z = 1.819
                model.getObjectByName('bulb_right').position.z = 1.819
            }
        },

        moveAlong() {
            this.$emit('animPlaying', false)
            let landTime = 4
            this.butterflyB.timeLine.repeat(0)
            this.butterflyB.timeLine.kill()

            console.log(this.butterflyB.timeLine.progress())

            if (this.butterflyB.timeLine && this.butterflyB.timeLine.isActive && this.butterflyB.timeLine.progress() > 0.05) {
                gsap.to(this.butterflyB.model.position, {
                    y: 7,
                    duration: 2,
                    onStart: () => this.changeFlap(this.butterflyB, true),
                    onComplete: () => this.butterflyB.visible = false,
                    onUpdate: () => console.log(this.butterflyB.timeLine.progress())
                })
                gsap.to(this.butterflyB.model.rotation, {
                    y: Math.PI,
                    duration: 0.5,
                })
            }

            // RUN MAIN
            this.mainTl = gsap.timeline({ paused: false })
            this.changeFlap(this.butterfly, false, true, true) // butterFly, fast, main, mainStart
            // scale
            this.mainTl.to(this.butterfly.scale, { x: this.butterflyScale, y: this.butterflyScale, z: this.butterflyScale, duration: 1, delay: 1 }, 1)
            // move
            this.mainTl.to(this.butterfly.position, {
                y: 1,
                delay: 0.8,
                duration: 2,
                onStart: () => this.changeFlap(this.butterfly, true, true, false),
                onComplete: () => this.changeFlap(this.butterfly, false, true, false),
            }, 1)

            // leave
            this.mainTl.to(this.butterfly.position, {
                y: 5,
                delay: landTime,
                duration: 2,
                onStart: () => this.changeFlap(this.butterfly, true, true, false),
                onComplete: () => this.resetOrig(),
            })
        },
        resetOrig() {
            this.butterfly.visible = false
            this.originalPosition()
            this.loadButterFly(this.butterflyB, 1, 1, 3, 'path2', 0.35) // MAIN! index, start delay, rest delay 
            this.$emit('animPlaying', true)

        },
        switchWings() {
            this.allDesigns[0] ? this.butterflyB.image = this.allDesigns[0].image : null
            this.allDesigns[1] ? this.butterflyA.image = this.allDesigns[1].image : null
            this.allDesigns[2] ? this.butterflyC.image = this.allDesigns[2].image : null
        },
        animate() {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
        },
        hideShow() {
            this.allDesigns[0] ? this.butterflyB.model.visible = true : this.butterflyB.model.visible = false
            this.allDesigns[1] ? this.butterflyA.model.visible = true : this.butterflyA.model.visible = false
            this.allDesigns[2] ? this.butterflyC.model.visible = true : this.butterflyC.model.visible = false
        }
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

        this.switchWings()
        this.init();
        this.animate();

        // const size = this.gui.addFolder('Size')
        // size.add(this.butterfly.getObjectByName('wingLeft').scale, 'x', 0, 10, 0.1)
        // size.add(this.butterfly.getObjectByName('wingLeft').scale, 'y', 0, 10, 0.1)
        // size.add(this.butterfly.getObjectByName('wingLeft').scale, 'z', 0, 10, 0.1)
        // const pos = this.gui.addFolder('Position')
        // pos.add(this.butterfly.getObjectByName('wingLeft').position, 'x', -3, 3, 0.1)
        // pos.add(this.butterfly.getObjectByName('wingLeft').position, 'y', -3, 3, 0.1)
        // pos.add(this.butterfly.getObjectByName('wingLeft').position, 'z', -3, 3, 0.1)
        // const rot = this.gui.addFolder('Rotation')
        // rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'x', -3, 3, 0.1)
        // rot.add(this.butterfly.getObjectByName('wingLeft').rotation, 'y', -3, 3, 0.1)
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

.node {
    position: fixed;
    height: 10px;
    width: 10px;
    z-index: 9999;
    background-color: orangered;
}
</style>
