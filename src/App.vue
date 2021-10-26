<template>
<div id="app" :style="{ backgroundImage: 'url(' + require('@/assets/paper.png') + ')' }">
    <div class="row align-items-center" :key="refresh">
        <div class="col-2">
            <div class="pallet">
                <span v-for="c in colours" class="color" :class="c == color ? 'selected' : null" :style="'background-color:' + c" :key="c" @click="selectColor(c)"></span>
            </div>
        </div>

        <div class="col-8 wrapper">
            <canvas v-if="!showFinished" ref="paintable" id="c1" width="800" height="700" style="width: 800px; height: 700px; display: flex; margin: auto"></canvas>
            <canvas v-if="!showFinished" ref="background" id="c2" width="800" height="700" style="width: 800px; height: 700px; display: flex; margin: auto"></canvas>
        </div>
        <div class="col-2">
            <div class="brushes">
                <div v-for="b in brushWidths" :key="b.size">
                    <span class="brushWidths" :class="b.size == dynamicLineWidth ? 'selected' : null" @click="selectBrush(b.size)"></span>
                    {{ b.name }}
                </div>
            </div>
        </div>
        <!--canvas -->
        <!-- <div class="previous px-3 py-3" :key="updated">
        <p class="text-white mb-4">
            previous designs get added to array and save in browser session (refresh
            the page)
        </p>
        <div v-for="(butterfly, i) in butterFlys" :key="i" class="px-3 py-3">
            <img :src="butterfly" class="wingA">
            <img :src="butterfly" style="width; 100%" class="wingB">
        </div>
    </div> -->
    </div>
    <button v-if="scene && !showFinished" class="saveButton" @click="save">
        {{ !showFinished ? "FLY AWAY" : "START AGAIN" }}
    </button>
    <button v-if="!scene" class="saveButton">
        LOADING MODEL <br />
        <small>online example only</small>
    </button>
    <butterFlyModel v-on:event_child="reset" v-if="scene && showFinished" :wingDesign="butterFlys[0]" :final="true" :index="'main'" :loadedScene="scene" :ready="showFinished" />
</div>
</template>

<script>
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import butterFlyModel from "./components/butterFlyModel";
export default {
    name: "App",
    components: { butterFlyModel },
    data() {
        return {
            refresh: 0,
            canvas: null,
            canvasBack: null,
            ctx: null,
            tempCanvas: null,
            tempCtx: null,
            wingMap: require("@/assets/wings/front.png"),
            updated: 0,
            ready: false,
            butterFlys: [],
            colours: [
                "#fd8686",
                "#ffa77c",
                "#f9d62e",
                "#a0e169",
                "#04d2d4",
                "#dc3545",
                "#6f42c1",
                "#198754",
                "#0d6efd",
                "#d63384",
                "#000",
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
            color: "#fd8686",
            threshold: 1,
            showFinished: false,
            butterflyUlr: require("@/assets/test.glb"),
            modelLoading: true,
            scene: null,
        };
    },

    methods: {
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

            this.mirrorScreen();

            var backImage = new Image();
            var outlineImage = new Image();
            outlineImage.src = require("@/assets/wings/front.png");
            backImage.src = require("@/assets/wings/back.png");

            backImage.onload = () => {
                this.ctxBack.drawImage(backImage, 90, 120, backImage.width, backImage.height);
            };

            // backImage.onload = () => {
            //     this.ctx.globalCompositeOperation = 'destination-over';
            //     this.ctx.drawImage(backImage, 0, 0);
            //     this.ctx.globalCompositeOperation = 'source-atop';

            // }

            outlineImage.onload = () => {
                // this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.drawImage(outlineImage, 90, 120);
                this.ctx.globalCompositeOperation = "source-atop";
            };

            var saved = JSON.parse(localStorage.getItem("previous"));
            if (saved.length > 5) saved.length = 5;
            if (saved) {
                this.butterFlys = saved;
            } else {
                this.butterFlys = [];
            }
        },

        save() {
            // get the current ImageData for the canvas
            var data = this.ctx.getImageData(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
            // store the current globalCompositeOperation
            //   var compositeOperation = this.ctx.globalCompositeOperation;
            // set to draw behind current content
            this.ctx.globalCompositeOperation = "destination-over";
            //set background color
            this.ctx.fillStyle = '#000';
            // draw background/rectangle on entire canvas
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            var tempCanvas = document.createElement("canvas");
            var tCtx = tempCanvas.getContext("2d");
            tempCanvas.width = 400;
            tempCanvas.height = 400;

            tCtx.drawImage(this.canvasBack, 0, 0);
            tCtx.globalCompositeOperation = "source-atop";
            tCtx.drawImage(this.canvas, 0, 0);
            // write on screen
            var img = tempCanvas.toDataURL("image/png");
            this.currentImage = img;

            // put back when finished
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
            } else {
                location.reload();
            }

        },
        selectColor(color) {
            this.color = color;
        },
        selectBrush(b) {
            this.dynamicLineWidth = b;
        },
        mirrorScreen() {
            this.canvas.onmousedown = (event) => {
                this.ctx.beginPath();
                let px = event.offsetX;
                let py = event.offsetY;
                let mirrorPx = 800 - event.offsetX;
                let mirrorPy = 400 - event.offsetY;
                this.ctx.moveTo(px, py);
                this.canvas.onmousemove = (event) => {
                    this.ctx.lineTo(event.offsetX, event.offsetY);
                    this.ctx.strokeStyle = this.color;
                    this.ctx.lineCap = "round";
                    this.ctx.lineWidth = this.dynamicLineWidth;
                    this.ctx.stroke();
                    this.ctx.moveTo(mirrorPx, py);
                    this.ctx.lineTo(800 - event.offsetX, event.offsetY);
                    this.ctx.stroke();
                    mirrorPx = 800 - event.offsetX;
                    mirrorPy = 400 - event.offsetY;
                    px = event.offsetX;
                    py = event.offsetY;
                    this.ctx.moveTo(event.offsetX, event.offsetY);
                };
                this.canvas.onmouseup = (event) => {
                    this.canvas.onmousemove = null;
                    this.ctx.closePath();
                };
            };
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
        addMask() {
            var map = new Image();
            map.src = this.wingMap;
            // ctx.drawImage(image, dx, dy, dWidth, dHeight);
            map.onload = () => {
                this.ctx.drawImage(map, 0, 0, 800, 400);
            };
        },
    },
    watch: {
        butterFlys() {
            if (this.ready) {
                localStorage.setItem("previous", JSON.stringify(this.butterFlys));
            }
        },
    },
    mounted() {
        this.paintInit();
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

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 1080px;
    width: 1920px;
    background-size: 200px;
    background-repeat: repeat;
    position: relative;
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
    border: 1px red dashed;
}

.wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    height: 500px;
    padding: 3em;
    box-shadow: 0px 10px 0px -5px #dddddd;
    min-width: 830px;
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
    width: 33.33%;
    height: 80px;
    cursor: pointer;
}

.brushWidths {
    background-color: #fff;
    margin: 10px;
    width: 80px;
    height: 80px;
    cursor: pointer;
    display: block;
    border-radius: 100px;
}

.brushWidths.selected {
    border: 2px border #000;
    background-color: #ffcb00;
}

.saveButton {
    position: absolute;
    bottom: 10px;
    background-color: #ffcb00;
    width: 200px;
    left: 0;
    right: 0;
    margin: auto;
    height: 70px;
    display: block;
    left: 0;
    color: #000;
    border: none;
}

.brush {
    background-color: #452770;
    width: 100%;
    height: 100px;
    display: block;
    color: #fff;
    border: none;
}

.brushes {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 30px;
}

.pallet {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}

.color.selected {
    width: 6em;
}

.color {
    transition-duration: 0.3s;
    width: 5em;
    height: 2em;
    display: block;
    margin-bottom: 1em;
    border-radius: 0 1em 1em 0;
}
</style>
