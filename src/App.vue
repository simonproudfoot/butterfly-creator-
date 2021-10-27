<template>
<div id="app" :style="{ backgroundImage: 'url(' + require('@/assets/Paper.jpg') + ')' }">
    <div class="zoomOut" v-if="scene">
        <div v-show="!wingSelected" class="choose">
            <h1 class="display-1">Choose your butterfly</h1>
            <button v-for="nth in 3" :key="nth" @click="selectWing(nth)" class="choose__icon">
                <img :src="require('@/assets/selection'+nth+'.svg')">
            </button>
        </div>
        <div v-show="wingSelected">
            <div class="row align-items-center" :key="refresh">
                <div class="col-2">
                    <div class="pallet">
                        <span v-for="c in colours" class="color" :class="c == color ? 'selected' : null" :style="'border-color:'+shadeColor(c,-50)+'; background-color:' + c" :key="c" @click="selectColor(c)"></span>
                    </div>
                </div>
                <div class="col-8 wrapper">
                    <img class="boxShadow" :src="require('@/assets/shadow.svg')">
                    <img :src="require('@/assets/body.svg')" class="body" v-if="!showFinished">
                    <canvas @mousedown="mirrorScreen(true)" @mouseleave="mirrorScreen(false)" @mouseup="mirrorScreen(false)" v-touch:start="mirrorScreen(true)" v-touch:end="mirrorScreen(false)" v-if="!showFinished" ref="paintable" id="c1" :width="buttDimensions.width" :height="buttDimensions.height" :style="['height:'+buttDimensions.height, 'width:'+buttDimensions.width ]" style="display: flex; margin: auto"></canvas>
                    <canvas v-if="!showFinished" ref="background" id="c2" :width="buttDimensions.width" :height="buttDimensions.height" style=" display: flex; margin: auto"></canvas>
                </div>
                <div class="col-2">
                    <div class="brushes">
                        <div v-for="b in brushWidths" :key="b.size" style="margin-bottom: 65px">
                            <span class="brushWidths" :class="b.size == dynamicLineWidth ? 'selected' : null" @click="selectBrush(b.size)" :style="{ backgroundImage: 'url(' + require('@/assets/brush.svg') + ')' }"></span>
                            {{ b.name }}
                        </div>
                    </div>
                </div>
            </div>
            <button v-if="wingSelected" class="saveButton" @click="save">
                <!-- {{ !showFinished ? "FLY AWAY" : "START AGAIN" }} -->
                <img :src="require('@/assets/fly.svg')">
            </button>
            <button v-if="!scene" class="saveButton">
                LOADING MODEL <br />
                <small>online example only</small>
            </button>
        </div>
    </div>
    <h1 v-else class="loading">Loading</h1>
    <butterFlyModel v-on:event_child="reset" v-if="scene && showFinished" :wingDesign="butterFlys[0]" :final="true" :index="'main'" :loadedScene="scene" :ready="showFinished" />
</div>
</template>

<script>
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import butterFlyModel from "./components/butterFlyModel";
import gsap from "gsap";
export default {
    name: "App",
    components: { butterFlyModel },
    data() {
        return {
            outlineImage: new Image(),
            backImage: new Image(),
            buttDimensions: {
                height: 650,
                width: 990,
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
                    size: 10,
                },
                {
                    name: "Large brush",
                    size: 50,
                },
            ],
            currentImage: null,
            isFirstPaintable: false,
            hidePaintable: false,
            disableNavigation: true,
            dynamicLineWidth: 50,
            isActive: true,
            useEraser: false,
            color: "#bc291e",
            threshold: 1,
            showFinished: false,
            butterflyUlr: require("@/assets/butterflyC.glb"),
            modelLoading: true,
            scene: null,
        };
    },
    methods: {
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
        paintInit() {

            this.canvas = this.$refs.paintable;
            this.ctx = this.canvas.getContext("2d");
            this.canvasBack = this.$refs.background;
            this.ctxBack = this.canvasBack.getContext("2d");

            var hRatio = this.canvas.width / this.backImage.width;
            var vRatio = this.canvas.height / this.backImage.height;
            var ratio = Math.min(hRatio, vRatio);

            var centerShift_x = (this.canvas.width - this.backImage.width * ratio) / 2;
            var centerShift_y = (this.canvas.height - this.backImage.height * ratio) / 2;
            this.ctxBack.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctxBack.drawImage(this.backImage, 0, 0, this.backImage.width, this.backImage.height, centerShift_x, centerShift_y, this.backImage.width * ratio, this.backImage.height * ratio);
            this.ctx.drawImage(this.outlineImage, 0, 0, this.backImage.width, this.backImage.height, centerShift_x, centerShift_y, this.backImage.width * ratio, this.backImage.height * ratio);
            this.ctx.globalCompositeOperation = "source-atop";
            var saved = JSON.parse(localStorage.getItem("previous"));
            if (saved.length > 5) saved.length = 5;
            if (saved) {
                this.butterFlys = saved;

            } else {
                this.butterFlys = [];
            }
        },
        save() {
            gsap.to('.pallet', { x: -20, opacity: 0, duration: 1 })
            gsap.to('.brushes', { x: 20, opacity: 0, duration: 1 })
            gsap.to('.saveButton', { y: -20, opacity: 0, duration: 1 })
            gsap.to('.zoomOut', { opacity: 0, scale: 0.9, duration: 1, delay: 2 })
            this.ctx.globalCompositeOperation = "destination-over";
            this.ctx.fillStyle = '#000';
            // draw background/rectangle on entire canvas
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            var tempCanvas = document.createElement("canvas");
            var tCtx = tempCanvas.getContext("2d");
            tempCanvas.width = this.canvasBack.width / 2;
            tempCanvas.height = this.canvasBack.height;

            tCtx.drawImage(this.canvasBack, 0, 0, this.canvasBack.width - 50, this.canvasBack.height - 50);

            tCtx.globalCompositeOperation = "source-atop";
            tCtx.drawImage(this.canvas, 0, 0, this.canvasBack.width - 50, this.canvasBack.height - 50);
            var img = tempCanvas.toDataURL("image/png");
            this.currentImage = img;
            // go go got
            if (!this.showFinished) {
                this.butterFlys.unshift(this.currentImage);
                if (this.butterFlys.length > 5) {
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
        },
        selectColor(color) {
            this.color = color;
        },
        selectBrush(b) {
            this.dynamicLineWidth = b;
        },

        mirrorScreen() {
            if (this.canvasBack) {
                this.canvas.onmousedown = (event) => {
                    this.ctx.beginPath();
                    let px = event.offsetX;
                    let py = event.offsetY;
                    let mirrorPx = this.canvas.width - event.offsetX;
                    this.ctx.moveTo(px, py);
                    this.canvas.onmousemove = (event) => {
                        this.ctx.lineTo(event.offsetX, event.offsetY);
                        this.ctx.strokeStyle = this.color;
                        this.ctx.lineCap = "round";
                        this.ctx.lineWidth = this.dynamicLineWidth;
                        this.ctx.stroke();
                        this.ctx.moveTo(mirrorPx, py);
                        this.ctx.lineTo(this.canvas.width - event.offsetX, event.offsetY);
                        this.ctx.stroke();
                        mirrorPx = this.canvas.width - event.offsetX;
                        px = event.offsetX;
                        py = event.offsetY;
                        this.ctx.moveTo(event.offsetX, event.offsetY);
                    };
                    this.canvas.onmouseup = (event) => {
                        this.ctx.strokeStyle = ''
                        this.ctx.lineCap = '';
                        this.ctx.lineWidth = ''
                        this.canvas.onmousemove = null;
                        this.ctx.closePath();
                    };
                };
            }
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
                gltfLoader.load(this.butterflyUlr, (gltf) => {
                    console.log("Model loaded");
                    this.scene = gltf;
                });
            }
        },
    },
    watch: {
        wingSelected(v) {

            this.outlineImage.src = require("@/assets/wings/" + v + "-front.png");
            this.backImage.src = require("@/assets/wings/" + v + "-back.png");

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
        //  this.paintInit();
        this.loadObj();

    },
    created() {
        this.$on("event_parent", function (id) {
            alert("Event from parent component emitted", id);
        });
    },
};
</script>

<style>
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

.choose,
.loading {
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.choose__icon {
    height: 500px;
    width: 500px;
    border: none;
    padding: 1em;
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
    transform: translate(-50%, -50%);
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
    height: 262px;
    left: 50%;
    transform: translate(-50%, -50%);
    top: 49%;

}

.wrapper .boxShadow {
    position: absolute;
    bottom: -20px;
    height: 21px;
    width: 1847px;
    left: -278px;
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
    border: 3px solid #2b3a45;
    opacity: 1
}

.brushes div:first-of-type .brushWidths {
    background-size: 20%;
    background-position: center 180%;
}

.saveButton {
    position: absolute;
    top: -45px;
    width: 248px;
    right: 16px;

    display: block;
    border: none;
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
</style>
