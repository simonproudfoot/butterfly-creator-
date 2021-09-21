<template>
<div id="app" :style="{ backgroundImage: 'url(' + require('@/assets/paper.png') + ')' }">

    <div class="row align-items-center" :key="refresh">
        <div class="col-2">
            <div class="pallet">
                <span v-for="c in colours" class="color" :class="c == color ? 'selected' : null" :style="'background-color:' + c" :key="c" @click="selectColor(c)"></span>
            </div>
        </div>
        <!-- <div class="text-white">Brush width</div> -->
        <!--
        -->
        <div class="col-8 wrapper">
            <canvas v-if="!showFinished" ref="paintable" id="c1" width="800" height="400" style="width: 800px;height: 400px;display: flex;margin: auto;"></canvas>

        </div>
        <div class="col-2">
            <div class="brushes">
                <div v-for="b in brushWidths" :key="b.size">
                    <span class="brushWidths" :class="b.size == dynamicLineWidth ? 'selected' : null" @click="selectBrush(b.size)"></span>
                    {{b.name}}
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
        LOADING MODEL <br> <small>online example only</small>
    </button>
    <butterFlyModel v-on:event_child="reset" v-if="scene && showFinished" :wingDesign="butterFlys[0]" :final="true" :index="'main'" :loadedScene="scene" :ready="showFinished" />
</div>
</template>

<script>
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import butterFlyModel from "./components/butterFlyModel";
export default {
    name: "App",
    components: { butterFlyModel },
    data() {
        return {
            refresh: 0,
            canvas: null,
            ctx: null,
            tempCanvas: null,
            tempCtx: null,
            wingMap: require("@/assets/wings.png"),
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
                name: 'Small brush',
                size: 10,
            }, {
                name: 'Large brush',
                size: 50,
            }],
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
            butterflyUlr: require('@/assets/test.glb'),
            modelLoading: true,
            scene: null

        };
    },

    methods: {
        reset() {
            this.showFinished = false
            this.refresh++
            this.loadObj()
            setTimeout(() => {
                this.paintInit()
            }, 1000);

        },
        paintInit() {
            this.canvas = this.$refs.paintable;
            this.ctx = this.canvas.getContext("2d");
            this.mirrorScreen();
            this.ctx.beginPath();
            var p = new Path2D(
                "M787.13,11.12a57.93,57.93,0,0,0-21.2-7.95c-18.4-3.44-36.84-2.48-55.28-.31-4.37.52-8.72,1.16-13.1,1.48-6.62.48-13.35.18-19.86,1.2-16.81,2.62-32.92,7.91-48.8,13.72a1252.73,1252.73,0,0,0-167,74.94,182.62,182.62,0,0,0-47.94,37.33,54.86,54.86,0,0,0-6.86,9.41c-3.25,5.58-2.43,12-3.19,18.07-1.29,10.39-2.16,20.83-3.3,31.23a3.56,3.56,0,0,1-.39,1.18l-.2-.13c-.46-.27-.53-1.31-.6-2-1.07-10.31-2-20.63-3.21-30.93-.64-5.58-.51-11.6-2.76-16.55-2.58-5.66-6.92-10.79-11.35-15.37-17.53-18.17-38.74-31.59-61.46-42.64-26.54-12.91-53.25-25.51-80.21-37.56C208.47,32,176.1,18.7,142.29,9.16c-12.09-3.42-24.29-6.37-37.06-6-3.38.08-6.79-.22-10.17-.46-2.15-.15-4.27-.53-6.4-.77L71.75,0H49.13C43.65.84,38.05,1.25,32.72,2.65a99.28,99.28,0,0,0-17.4,6.22C7.06,12.78,2.31,19.73,0,28.3V39c1.42,5.57,4.42,10.33,7.67,15a125,125,0,0,1,7.59,13C19.63,75.34,27.05,80.87,33.84,87a14.74,14.74,0,0,0,2,1A7.05,7.05,0,0,1,38,89.68c2.29,3.5,5.58,5.67,9.34,7.46a9.39,9.39,0,0,1,3.74,3.44,34.37,34.37,0,0,0,10.22,11.15,15,15,0,0,1,4,4.14c2.65,3.95,5,8.09,9.48,10.47a4.39,4.39,0,0,1,2,2.84c2.35,16.5,10,29.69,25.13,38.13a7.85,7.85,0,0,1,3.44,4.15,130.7,130.7,0,0,0,6.5,12.48c1.46,2.45,3.64,4.48,5.29,6.84a73,73,0,0,1,4.27,7c4.75,8.71,12.25,15,19.84,21.12,5.07,4.1,11.43,5.13,17.71,4.4,13.1-1.52,26.13-3.6,39.19-5.45.64-.09,1.28-.12,1.92-.17l.4.67c-1.14.94-2.36,1.8-3.41,2.83-4.72,4.59-10.12,8.71-13.94,13.93-14.13,19.31-17.5,28.62-20.29,52.15a62.12,62.12,0,0,0-.56,10c.16,3.8,1,7.44,4.73,9.8a7.15,7.15,0,0,1,2.63,3.16c3.06,7.83,5.71,15.86,13.08,21.16a2.57,2.57,0,0,1,.74,1.33c1.95,6.63,6.6,10.53,13.2,12.59a4.63,4.63,0,0,1,2.48,2.06A25.13,25.13,0,0,0,211.47,359a3.88,3.88,0,0,1,1.93,1.46c3.28,7.07,9.67,9.67,16.8,11.34a88.86,88.86,0,0,1,10.12,2.76c7.62,2.77,15.15,5.77,22.71,8.7.87.34,1.7.8,2.54,1.22,3.69,1.82,7.3,3.81,11.08,5.42,2.12.91,4.53,1.14,6.77,1.81,3.46,1,6.86,2.32,10.35,3.27,2.45.67,5.2.55,7.51,1.5a33.06,33.06,0,0,0,22.66,1.34,8.67,8.67,0,0,1,4.05-.15c7.67,1.63,13.37-1.17,15.7-8.32.81-2.49,2.11-3.33,4.52-3.86,7.93-1.72,15.42-4.54,22-9.32,5.42-3.95,9.4-8.83,10.62-15.55a4.64,4.64,0,0,1,1.95-2.56,24.73,24.73,0,0,0,10.88-16.79c.77-4.62,1.07-9.32,1.54-14q1.5-14.68,2.95-29.39.9-9,1.79-18c1.77,19.56,3.89,39.1,5.77,58.65.82,8.5,4.36,15.42,11.54,20.49a4.77,4.77,0,0,1,1.93,2.6c1.1,5.87,4.32,10.42,8.9,14.16,7.11,5.78,15.54,8.84,24.41,10.81a4.18,4.18,0,0,1,3.64,3.19c2.44,7.3,7.44,10.36,15.06,8.86,3.31-.65,6,.26,8.86,1.38h11c5.54-1.45,11.12-2.78,16.61-4.39,7.15-2.1,14.83-3.39,21.16-6.92,6.6-3.69,13.66-5.67,20.49-8.46.89-.37,1.81-.69,2.66-1.13a67.77,67.77,0,0,1,19.78-7c6.36-1.13,11.87-4.31,14.72-10.59a4.27,4.27,0,0,1,2.1-1.69,24.88,24.88,0,0,0,12.23-11.6,4.63,4.63,0,0,1,2.51-2c6.58-2.1,11.23-6,13.17-12.64a2.53,2.53,0,0,1,.74-1.33c7.26-5.1,9.79-13,12.88-20.55a9.77,9.77,0,0,1,3.15-3.88c3.34-2.51,4.25-6,4.41-9.71a62.78,62.78,0,0,0-.52-9.38c-.6-5.59-.82-11.29-2.18-16.7a86.65,86.65,0,0,0-6.08-16.11c-6-12.66-14-24-25.15-33-1.63-1.32-3.07-2.85-4.43-4.14,9.22,1.41,18.4,3,27.63,4.16,8.17,1,16.39,2.8,24.64.33A20.82,20.82,0,0,0,662,216.75c1.38-1.65,3.85-2.44,5.18-4.1,4.87-6.09,9.57-12.32,14.13-18.63,2.36-3.28,4.29-6.74,7.09-9.84,3-3.3,4.26-8.06,6.37-12.15.59-1.14,1.22-2.57,2.25-3.13,16.43-9,24.29-23.06,26.39-41,5.7-1.81,8.43-6.72,11.41-11.45a12.12,12.12,0,0,1,3.65-3.69c4.69-2.92,7.89-7,10.62-11.61a8,8,0,0,1,3.34-3c3.86-1.81,7.3-4,9.6-7.63A5.87,5.87,0,0,1,763.88,89a15.73,15.73,0,0,0,2.29-1.13c6.89-6.16,14.27-11.9,18.7-20.25,2.11-4,4.47-7.8,6.65-11.74,2.86-5.19,5.66-10.41,8.48-15.62V29.56A29.75,29.75,0,0,0,787.13,11.12Z"
            );

            this.ctx.stroke(p);
            this.ctx.clip(p);
            this.ctx.closePath();
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
            var data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            // store the current globalCompositeOperation
            var compositeOperation = this.ctx.globalCompositeOperation;
            // set to draw behind current content
            this.ctx.globalCompositeOperation = "destination-over";
            //set background color
            //this.ctx.fillStyle = "#000000";
            // draw background/rectangle on entire canvas
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            var tempCanvas = document.createElement("canvas")
            var tCtx = tempCanvas.getContext("2d");
            tempCanvas.width = 400;
            tempCanvas.height = 400;
            tCtx.drawImage(this.canvas, 0, 0);

            // write on screen
            var img = tempCanvas.toDataURL("image/png");
            this.currentImage = img

            if (!this.showFinished) {
                this.butterFlys.unshift(this.currentImage)
                if (this.butterFlys.length > 5) {
                    this.butterFlys.pop()
                }
                this.isActive = false
                this.showFinished = true
                setTimeout(() => {
                    localStorage.setItem("previous", JSON.stringify(this.butterFlys))
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
                    console.log('Model loaded')
                    this.scene = gltf
                })
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
        this.paintInit()
        this.loadObj()
    },

    created() {
        this.$on('event_parent', function (id) {
            alert('Event from parent component emitted', id)
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

canvas {}

.wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    height: 500px;
    padding: 3em;
    box-shadow: 0px 10px 0px -5px #DDDDDD;
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
