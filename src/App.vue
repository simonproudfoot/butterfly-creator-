<template>
<div id="app">
    <div class="wrapper">
        <div class="menu">
            <button class="brush" @click="useEraser = !useEraser">{{useEraser ? 'USE BRUSH' : 'USE ERASER'}}</button>
            <div style="display: flex; flex-wrap: wrap" :style="useEraser ? 'opacity: 0.5' : null">
                <span v-for="c in colours" class="color" :class="c == color ? 'selected' : null" :style="'background-color:' + c" :key="c" @click="selectColor(c)"></span>
            </div>
            <div class="text-white">Brush width</div>
            <div style=" display: flex; flex-wrap: wrap; align-items: center;justify-content: center;">
                <span v-for="b in brushWidths" class="brushWidths" :class="b == dynamicLineWidth ? 'selected' : null" :style="{ height: b + 'px', width: b + 'px' }" :key="b" @click="selectBrush(b)"></span>
            </div>

            <button class="saveButton" @click="save">{{!showFinished ? 'CREATE' : 'START AGAIN'}}</button>
        </div>
        <!-- canvas -->
        <div class="row g-0" v-if="!this.showFinished">
            <div class="col-6 wrapper__col left" style="position: relative; border-right: 1px grey solid">
                <h4 style="position: absolute; top: 0; left: 0; right: 0; margin: auto ">Paint here</h4>
                <!-- <img :src="require('@/assets/butterfly.svg')" class="template left" /> -->
                <paintable alwaysOnTop :active="isActive" :width="600" :height="800" :disableNavigation="disableNavigation" :hide="hidePaintable" :horizontalNavigation="true"  :name="isFirstPaintable ? 'my-screen' : 'my-second-screen'" :factor="1" :lineWidth="dynamicLineWidth" :lineWidthEraser="20" :useEraser="useEraser" :color="color" class="paint" :threshold="10" ref="paintable" @toggle-paintable="finishedPaint">
                </paintable>
            </div>
            <div class="col-6 wrapper__col" style="cursor: drop; pointer-events: none">
                <!-- <img :src="require('@/assets/butterfly-right.svg')" class="template right" /> -->
                <img :src="currentImage" alt="" class="mirror" style="cursor: drop; pointer-events: none" />
            </div>
        </div>
        <butterFlyModel v-else :wingDesign="butterFlys[0]" :final="true" :index="'main'" />

    </div>

    <!--canvas -->
    <div class="previous" :key="updated">
        <p class="text-white mb-0">previous designs get added to array and save in browser session (refresh the page)</p>

        <div v-for="(butterfly, i) in butterFlys" :key="i">
            <butterFlyModel :wingDesign="butterfly" :index="i" />
        </div>
    </div>
</div>
</template>

<script>
import butterFlyModel from './components/butterFlyModel'
export default {
    name: "App",
    components: { butterFlyModel },
    data() {
        return {
            wingMap: require('@/assets/test2.png'),
            updated: 0,
            ready: false,
            butterFlys: [],
            colours: ["#fd8686", "#ffa77c", "#f9d62e", "#a0e169", "#04d2d4", '#dc3545', '#6f42c1', '#198754', '#0d6efd', '#d63384', "#000"],
            brushWidths: [10, 20, 30, 40],
            currentImage: null,
            isFirstPaintable: false,
            hidePaintable: false,
            disableNavigation: true,
            dynamicLineWidth: 20,
            isActive: true,
            useEraser: false,
            color: "#fd8686",
            threshold: 1,
            showFinished: false

        };
    },

    methods: {
        save() {

            if (!this.showFinished) {
                this.butterFlys.unshift(this.currentImage)
                if (this.butterFlys.length > 2) {
                    this.butterFlys.pop()
                }
                this.isActive = false
                this.showFinished = true

            } else {
                location.reload();
            }

            // setTimeout(() => {
            //     this.isActive = true
            //     this.mirrorScreen()

            // }, 100);
        },
        selectColor(color) {
            this.color = color;
        },
        selectBrush(b) {
            this.dynamicLineWidth = b;
        },
        mirrorScreen() {
            // this.addMask()
            var image = new Image();
            var canvas = this.$refs.paintable.$el.children[0];
            image.id = "pic";
            image.src = canvas.toDataURL();
            this.currentImage = image.src;

        },
        finishedPaint() {
            document.body.onmouseup = () => {
                this.mirrorScreen();
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
        toggledPaintable(isActive) {
            this.isActive = isActive;
        },
        addMask() {
            var canvas = this.$refs.paintable.$el.children[0];
            var ctx = canvas.getContext("2d");
            var map = new Image();
            map.src = this.wingMap;
            map.onload = function () {
                ctx.drawImage(map, 0, 0);
            }
        }
    },
    watch: {
        butterFlys() {
            if (this.ready) {
                localStorage.setItem('previous', JSON.stringify(this.butterFlys));
            }
        }
    },
    mounted() {
        this.addMask()
        setTimeout(() => {
            this.mirrorScreen();
        }, 100);
        var saved = JSON.parse(localStorage.getItem('previous'))
        if (saved.length > 3) saved.length = 3
        if (saved) {
            this.butterFlys = saved
        } else {
            this.butterFlys = []
        }
        setTimeout(() => {
            this.ready = true
        }, 1000);

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
        transform: rotateY(40deg) rotateZ(-5deg)
    }

    50% {
        transform: rotateY(-40deg) rotateZ(5deg)
    }

    100% {
        transform: rotateY(40deg) rotateZ(-5deg)
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
    height: 100%;
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

.wrapper {
    width: 1200px;
    height: 800px;
    position: fixed;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
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

.canvas,
.mirror {
    width: 100% !important;
    height: 100% !important;
}

.paint {
    width: 100% !important;
}

.paintable {
    width: 100% !important;
    position: relative !important;
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

.selected {
    border: 1px #fff solid;
}

.color {
    width: 33.33%;
    height: 80px;
    cursor: pointer;
}

.brushWidths {
    background-color: #000;
    margin: 10px;
    height: 80px;
    cursor: pointer;
    border-radius: 100px;
}

.saveButton {
    position: absolute;
    bottom: 0;
    background-color: blue;
    width: 100%;
    height: 100px;
    display: block;
    left: 0;
    color: #fff;
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
</style>
