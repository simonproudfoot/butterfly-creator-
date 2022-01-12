<template>
<div id="app">
    <!-- <div class="key" style="display:">
        Current
        <div v-for="(img, i) in butterFlys" :key="i" >
            <img :src="img.image" />
            <small>{{img.wing}}</small>
        </div>

    </div> -->

    <v-idle style="display: none" :duration="100" :loop="true" @idle="idle" />

    <video class="attractor" autoplay muted loop v-if="showAttractor" :src="require('@/assets/attractor.mp4')" @click="showAttractor=false"></video>
    <div class="zoomOut creator" v-if="scene" :style="{ backgroundImage: 'url(' + require('@/assets/Paper.jpg') + ')' }">
        <div v-show="!wingSelected" class="choose">
            <h1 class="display-1 mb-1" style="color: #7392a6">Choose your butterfly</h1>
            <button v-for="nth in 3" :key="nth" @click="selectWing(nth)" class="choose__icon">
                <img :src="require('@/assets/selection'+nth+'.svg')">
            </button>
        </div>
        <div v-show="wingSelected">
            <div class="row align-items-center" :key="refresh">
                <div class="col-2">
                    <div class="pallet">
                        <span v-for="c in colours" class="color" :class="c == color ? 'selected' : null" :style="'border-color:'+shadeColor(c,-15)+'; background-color:' + c" :key="c" @click="selectColor(c)"></span>
                    </div>
                </div>
                <div class="col-8 wrapper">
                    <img class="boxShadow" :src="require('@/assets/shadow.svg')">
                    <img :src="require('@/assets/body.svg')" class="body" v-if="!showFinished" :style="wingSelected == 3? 'top: 38%' : 'top: 49%'">
                    <canvas v-if="!showFinished" ref="paintable" id="c1" :width="buttDimensions.width" :height="buttDimensions.height" :style="['height:'+buttDimensions.height, 'width:'+buttDimensions.width ]" style="display: flex; margin: auto"></canvas>
                    <canvas v-if="!showFinished" ref="background" id="c2" :width="buttDimensions.width" :height="buttDimensions.height" style=" display: flex; margin: auto"></canvas>
                </div>
                <div class="col-2">
                    <div class="brushes">
                        <div v-for="b in brushWidths" :key="b.size" style="margin-bottom: 65px">
                            <span class="brushWidths" :class="b.size == dynamicLineWidth ? 'selected' : null" @click="selectBrush(b.size)" :style="{ backgroundImage: 'url(' + require('@/assets/brush.svg') + ')' }"></span>
                            <h3>{{ b.name }}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <button v-if="wingSelected" class="saveButton saveButtonReady" @click="save">
                <img :src="require('@/assets/fly.svg')">
                <h3 v-if="showGoButton">Fly away!</h3>
                <h3 v-else style="left: 47px">Please wait</h3>
            </button>

            <!-- <button v-if="!scene" class="saveButton">
                LOADING MODEL <br />
                <small>online example only</small>
            </button> -->
        </div>
    </div>
    <h1 v-else class="loading">Loading</h1>
    <butterFlyModel v-on:animPlaying="animPlaying" :allDesigns="butterFlys" v-if="scene && sceneLoop1" :wingDesign="currentImage" :wingSelected="wingSelected" :final="true" :index="'main'" :loadedScene="scene" :ready="showFinished" :loopA="sceneLoop1" />
</div>
</template>

<script>
import Vue from 'vue'
// import IdleVue from 'idle-vue'
// Vue.use(IdleVue, {
//   eventEmitter: eventsHub,
//   idleTime: 10000
// })
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import butterFlyModel from "./components/butterFlyModel";
import gsap from "gsap";
import * as Hammer from 'hammerjs';
window.Hammer = Hammer.default;
export default {
    name: "App",
    components: { butterFlyModel },
    data() {
        return {
            showAttractor: false,
            showGoButton: true,
            imageDimension: {
                height: 790 * 2,
                width: 1080 * 2
            },
            outlineImage: new Image(),
            backImage: new Image(),
            buttDimensions: {
                height: 790 * 2,
                width: 1080 * 2,
            },
            refresh: 0,
            canvas: null,
            canvasBack: null,
            ctx: null,
            tempCanvas: null,
            tempCtx: null,
            wingSelected: 0,
            updated: 0,
            ready: false,
            butterFlys: [],
            colours: [
                "#bc291e",
                '#fc8c54',
                '#fdc451',
                '#c6de94',
                '#339164',
                '#5489af',
                '#7fddda',
                '#766a90',
                '#9c76a3',
            ],
            brushWidths: [{
                    name: "Small brush",
                    size: 50,
                },
                {
                    name: "Large brush",
                    size: 150,
                },
            ],
            currentImage: null,
            isFirstPaintable: false,
            hidePaintable: false,
            disableNavigation: true,
            dynamicLineWidth: 150,
            isActive: true,
            useEraser: false,
            color: "#bc291e",
            threshold: 1,
            showFinished: false,
            butterflyUrl: require("@/assets/butterflyFlat.glb"),
            loop1Url: require("@/assets/butterfly_spot_a.gltf"),
            modelLoading: true,
            scene: null,
            sceneLoop1: null,
            sceneLoop2: null,
            sceneLoop3: null,
        };
    },
    methods: {
        begin(){

        },
        idle() {
            this.showAttractor = true
            this.color = "#bc291e"
            this.wingSelected = 0

            // gsap.to('.zoomOut', { scale: 1, opacity: 1 })
            this.refresh++
            this.wingSelected = 0
            this.showFinished = false

        },
        animPlaying(val) {
            if (val == false) {
                setTimeout(() => {
                    this.showGoButton = false
                }, 3000);
            } else {
                this.showGoButton = true
            }
        },
        shadeColor(color, percent) {
            var R = parseInt(color.substring(1, 3), 16);
            var G = parseInt(color.substring(3, 5), 16);
            var B = parseInt(color.substring(5, 7), 16);
            R = parseInt(R * (100 + percent) / 100);
            G = parseInt(G * (100 + percent) / 100);
            B = parseInt(B * (100 + percent) / 100);
            R = (R < 255) ? R : 255;
            G = (G < 255) ? G : 255;
            B = (B < 255) ? B : 255;
            var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
            var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
            var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));
            return "#" + RR + GG + BB;
        },
        selectWing(wng) {
            this.wingSelected = wng
            //  this.paintInit()
        },
        reset() {
            this.showFinished = false;
            this.refresh++;
            this.loadObj();
            setTimeout(() => {
                this.paintInit();
            }, 1000);
        },
        getSaved() {
            var saved = JSON.parse(localStorage.getItem("previous") || "[]");
            // console.log(saved[0])

            // console.log(saved)
            if (saved.length > 3) saved.length = 3;
            if (saved) {
                this.butterFlys = saved;
                console.log(saved)
            } else {
                this.butterFlys = [];
            }
        },
        paintInit() {
            this.canvas = this.$refs.paintable;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingQuality = 'high'
            console.log(this.ctx)
            this.canvasBack = this.$refs.background;
            this.ctxBack = this.canvasBack.getContext("2d");
            var hRatio = this.canvas.width / this.imageDimension.width;
            var vRatio = this.canvas.height / this.imageDimension.height;
            var ratio = Math.min(hRatio, vRatio);
            var centerShift_x = (this.canvas.width - this.imageDimension.width * ratio) / 2;
            var centerShift_y = (this.canvas.height - this.imageDimension.height * ratio) / 2;
            this.ctxBack.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var topOffset = 0
            if (this.wingSelected == 3) {
                topOffset = -200
            }
            this.ctxBack.drawImage(this.backImage, 0, topOffset, this.imageDimension.width + 1, this.imageDimension.height + 1, centerShift_x, centerShift_y, this.imageDimension.width * ratio, this.imageDimension.height * ratio);
            this.ctx.drawImage(this.outlineImage, 0, topOffset, this.imageDimension.width + 1, this.imageDimension.height + 1, centerShift_x, centerShift_y, this.imageDimension.width * ratio, this.imageDimension.height * ratio);
            this.ctx.globalCompositeOperation = "source-atop";

        },
        save() {
            if (this.showGoButton) {
                gsap.to('.pallet', { x: -20, opacity: 0, duration: 1 })
                gsap.to('.brushes', { x: 20, opacity: 0, duration: 1 })
                gsap.to('.saveButtonReady', { y: -20, opacity: 0, duration: 1 })
                gsap.to('.zoomOut', { opacity: 0, scale: 0.9, duration: 1, delay: 2 })
                this.ctx.globalCompositeOperation = "destination-over";
                this.ctx.fillStyle = '#000';
                // draw background/rectangle on entire canvas
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                var tempCanvas = document.createElement("canvas");
                var tCtx = tempCanvas.getContext("2d");
                tCtx.imageSmoothingQuality = 'high'
                tempCanvas.width = this.canvasBack.width / 2;
                tempCanvas.height = this.canvasBack.height;
                tCtx.drawImage(this.canvasBack, 0, 0, this.canvasBack.width - 50, this.canvasBack.height - 50);
                tCtx.globalCompositeOperation = "source-atop";
                tCtx.drawImage(this.canvas, 0, 0, this.canvasBack.width - 50, this.canvasBack.height - 50);
                var img = tempCanvas.toDataURL("image/svg");
                this.currentImage = img;
                // go go got
                if (!this.showFinished) {

                    let currentCreation = { image: this.currentImage, wing: this.wingSelected.toString(), id: Math.floor(Math.random() * 10).toString() }

                    this.butterFlys.unshift(currentCreation);
                    if (this.butterFlys.length > 3) {
                        this.butterFlys.pop();
                    }
                    this.isActive = false;
                    this.showFinished = true;

                    setTimeout(() => {
                        localStorage.setItem("previous", JSON.stringify(this.butterFlys));
                    }, 1000);
                }
                setTimeout(() => {
                    gsap.to('.zoomOut', { scale: 1, opacity: 1 })
                    this.refresh++
                    this.wingSelected = 0
                    this.showFinished = false
                }, 3500);
            }
        },
        selectColor(color) {
            this.color = color;
        },
        selectBrush(b) {
            this.dynamicLineWidth = b;
        },
        navigate() {
            this.isFirstPaintable = !this.isFirstPaintable;
        },
        hide() {
            this.$hidePaintableNavigation();
        },
        show() {
            this.$showPaintableNavigation();
        },
        loadObj() {
            const gltfLoader = new GLTFLoader();
            if (!this.scene) {
                gltfLoader.load(this.butterflyUrl, (gltf) => {
                    // console.log("Model loaded");
                    this.scene = gltf;
                });

                gltfLoader.load(this.loop1Url, (gltf) => {
                    this.sceneLoop1 = gltf;

                });

            }
        },
        preventDefault(e) {
            e.preventDefault();
        },
        disableScroll() {
            document.body.addEventListener('touchmove', this.preventDefault, { passive: false });
        },
        enableScroll() {
            document.body.removeEventListener('touchmove', this.preventDefault, { passive: false });
        },
        onHold() {
            console.log('go')
        }
    },
   
    watch: {
        canvas(val) {
            var options = {
                dragLockToAxis: true,
                dragBlockHorizontal: true,
                threshold: 0.1,
                preventDefault: true,
                velocity: 0.001
            };
            var hammertime = new Hammer(this.canvas, options);
            hammertime.on("panstart", (ev) => {
                this.ctx.beginPath();
                let px = ev.srcEvent.offsetX
                let py = ev.srcEvent.offsetY
                this.ctx.strokeStyle = this.color;
                this.ctx.lineCap = "round";
                this.ctx.lineWidth = this.dynamicLineWidth;
            })
            hammertime.on("panmove", (ev) => {
                let px = ev.srcEvent.offsetX
                let py = ev.srcEvent.offsetY
                let mirrorPx = this.canvas.width - ev.srcEvent.offsetX
                this.ctx.moveTo(px, py)
                this.ctx.lineTo(ev.srcEvent.offsetX, ev.srcEvent.offsetY);
                this.ctx.stroke();
                this.ctx.moveTo(mirrorPx, py);
                this.ctx.lineTo(this.canvas.width - ev.srcEvent.offsetX, ev.srcEvent.offsetY);
                this.ctx.stroke();
            })
            hammertime.on("panend", (ev) => {
                this.ctx.strokeStyle = ''
                this.ctx.lineCap = '';
                this.ctx.lineWidth = ''
                this.canvas.onmousemove = null;
                this.ctx.closePath();
            });
        },
        wingSelected(v) {
            this.outlineImage.src = require("@/assets/wings/" + v + "-front.svg");
            this.backImage.src = require("@/assets/wings/" + v + "-back.svg");
            this.outlineImage.onload = () => {
                setTimeout(() => {
                    this.paintInit()
                }, 100);
            }
        },
        butterFlys() {
            if (this.ready) {
                localStorage.setItem("previous", JSON.stringify(this.butterFlys));
            }
        },
    },
    mounted() {
        this.disableScroll()
        this.loadObj();
        this.getSaved()
    },

};
</script>

<style scoped>
@font-face {
    font-family: "Gilroy-Bold";
    src: local("Gilroy-Bold.woff"), url('./fonts/Gilroy-Bold.woff') format("woff");
}

@font-face {
    font-family: "Gilroy-Regular";
    src: local("Gilroy-Regular.woff"), url('./fonts/Gilroy-Regular.woff') format("woff");
}

* {
    -webkit-touch-callout: none;
    /* iOS Safari */
    -webkit-user-select: none;
    /* Safari */
    -khtml-user-select: none;
    /* Konqueror HTML */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* Internet Explorer/Edge */
    user-select: none;
    /* Non-prefixed version, currently supported by Chrome and Opera */
}

h1,
h2,
h3 {
    font-family: "Gilroy-Bold";
}

.key {
    position: absolute;
    width: 200px;
    height: auto;
    background-color: olivedrab;
    top: 0;
    z-index: 999;

}

.key img {

    width: 100%;

}

.creator {
    margin-top: 1080px;
}

.attractor {
    margin-top: 1080px;
    height: 1080px;
    position: absolute;
    left: 0;
    width: 1920px;
    z-index: 99;
}

.choose,
.loading {
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.choose__icon {
    height: 510px;
    width: 500px;
    border: none;
    padding: 1em;
    animation: fadeInUp 1s ease-in-out 1 forwards;
    transition-duration: 1s;
    transition-delay: 3s;
    opacity: 0;
}

.choose__icon {}

@keyframes fadeInUp {
    from {
        margin-top: 600px;
        opacity: 0;
    }

    to {
        margin-top: 0;
        opacity: 1;
    }
}

.butterfly {
    position: relative;
    width: 180px;
    height: 180px;
}

.butterfly--body {
    width: 15%;
    height: 70px;
    background-color: #000;
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    margin: auto;
    right: 0;
    bottom: 0;
    border-radius: 34px;
}

.butterfly--left {
    width: 40%;
    height: 70%;
    background-color: #000;
    display: inline-block;
    position: absolute;
    top: 0;
    left: 2%;
    margin: auto;
    bottom: 0;
    animation: spinLeft 1s linear infinite;
    transform-origin: center right;
}

.butterfly--right {
    width: 40%;
    height: 70%;
    background-color: #000;
    display: inline-block;
    position: absolute;
    top: 0;
    margin: auto;
    bottom: 0;
    animation: spin 1s linear infinite;
    left: 18%;
    margin: auto;
    transform-origin: center right;
}

@keyframes fadeInUp {
    from {
        transform: translate3d(0, 40px, 40px)
    }

    to {
        transform: translate3d(0, 0, 0);
        opacity: 1
    }
}

@keyframes spinLeft {
    0% {
        transform: rotateY(40deg) rotateZ(-5deg);
    }

    50% {
        transform: rotateY(-40deg) rotateZ(5deg);
    }

    100% {
        transform: rotateY(40deg) rotateZ(-5deg);
    }
}

@keyframes spin {
    0% {
        transform: rotateY(-40deg) rotateZ(5deg) scaleX(-1);
    }

    50% {
        transform: rotateY(40deg) rotateZ(-5deg) scaleX(-1);
    }

    100% {
        transform: rotateY(-40deg) rotateZ(5deg) scaleX(-1);
    }
}

button {
    -webkit-appearance: none;
    background-color: transparent;
}

body,
html {
    height: 1080px;
    width: 1920px;
    overflow: hidden;
    touch-action: unset;
}

#app {
    font-family: 'Gilroy-Regular', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 1080px;
    width: 1920px;
    background-size: cover;
    background-repeat: no-repeat;
    font-size: 25px;
    position: relative;
}

.zoomOut {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.wingB {
    transform: scaleX(-1);
}

.wingB,
.wingA {
    display: inline-block;
    width: 50%;
}

.template {
    width: 500px;
    height: unset;
    pointer-events: none;
    -o-object-fit: contain;
    object-fit: contain;
    z-index: 1;
    position: absolute;
    top: 0;
    mix-blend-mode: color-burn;
}

#c2 {
    z-index: -1;
}

canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    user-select: none;
}

.wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    height: 869px;
    padding: 3em;
    width: 1347px;
    border-radius: 30px;
}

.wrapper::after {
    content: "";
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
}

.body {
    position: absolute;
    height: 434px;
    left: 50%;
    transform: translate(-50%, -50%);
}

.wrapper .boxShadow {
    position: absolute;
    bottom: -22px;
    height: 22px;
    width: 1847px;
    left: -249px;
}

.wrapper__col {
    position: relative;
    background-size: contain;
    background-repeat: no-repeat;
}

.left {
    right: 0;
}

.right {
    left: 0;
}

.paint {
    width: 100% !important;
}

.paintable {
    width: 100% !important;
    position: relative !important;
    height: 100vh;
}

.mirror {
    transform: scaleX(-1);
}

.menu {
    top: 0;
    left: 0;
    position: fixed;
    width: 200px;
    height: 100%;
    background: brown;
    z-index: 1000;
}

.previous {
    top: 0;
    right: 0;
    position: fixed;
    width: 200px;
    height: 100%;
    background: brown;
    z-index: 1000;
}

.color {
    border-left: 0 !important;
    width: 33.33%;
    height: 80px;
    cursor: pointer;
}

.brushWidths {
    background-color: #7392a6;
    margin: 10px 0;
    width: 152px;
    height: 152px;
    cursor: pointer;
    display: block;
    border-radius: 100px;
    border: 2px border #7392a6;
    opacity: 0.7;
    background-repeat: no-repeat;
    background-size: 35%;
    background-position: center -40%;
}

.brushWidths.selected {
    border: 6px solid #2b3a45;
    opacity: 1
}

.brushes div:first-of-type .brushWidths {
    background-size: 20%;
    background-position: center 180%;
}

.saveButton {
    position: absolute;
    width: 248px;
    right: 16px;
    display: block;
    border: none;
    top: -1px;
}

.saveButton h3 {
    position: absolute;
    bottom: 31px;
    left: 61px;
}

.brush {
    background-color: #746f7a;
    width: 100%;
    height: 100px;
    display: block;
    color: #fff;
    border: none;
}

.brushes {
    position: absolute;
    top: 489px;
    right: 68px;
}

.pallet {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}

.color.selected {
    width: 225px;
    border: 6px solid;
}

.color {
    transition-duration: 0.3s;
    width: 156px;
    height: 65px;
    display: block;
    margin-bottom: 1em;
    border-radius: 0 2em 2em 0;
}

#stage {
    position: relative;
    z-index: 9999;
}
</style>
