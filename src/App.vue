<template>
<div id="app">
    <div class="wrapper">
        <div class="menu">
            <div class="text-white">Select colour</div>
            <div style="display: flex; flex-wrap: wrap">
                <span v-for="c in colours" class="color" :class="c == color ? 'selected' : null" :style="'background-color:' + c" :key="c" @click="selectColor(c)"></span>
            </div>
            <div class="text-white">Brush width</div>
            <div style="
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
          ">
                <span v-for="b in brushWidths" class="brushWidths" :class="b == dynamicLineWidth ? 'selected' : null" :style="{ height: b + 'px', width: b + 'px' }" :key="b" @click="selectBrush(b)"></span>
            </div>
        </div>
        <div class="row g-0">
            <div class="col-6 wrapper__col left" style="position: relative">
                <img :src="require('@/assets/butterfly.svg')" class="template left" />
                <paintable alwaysOnTop :active="isActive" :width="600" :height="800" :disableNavigation="disableNavigation" :hide="hidePaintable" :horizontalNavigation="true" :navigation="navigation" :name="isFirstPaintable ? 'my-screen' : 'my-second-screen'" :factor="1" :lineWidth="dynamicLineWidth" :lineWidthEraser="20" :useEraser="useEraser" :color="color" class="paint" :threshold="10" ref="paintable" @toggle-paintable="finishedPaint">
                </paintable>
            </div>
            <div class="col-6 wrapper__col" style="cursor: drop; pointer-events: none">
                <img :src="require('@/assets/butterfly-right.svg')" class="template right" />
                <img :src="currentImage" alt="" class="mirror" style="cursor: drop; pointer-events: none" />
            </div>
        </div>
    </div>
</div>
</template>
<script>
export default {
    name: "App",
    data() {
        return {
            colours: ["#fd8686", "#ffa77c", "#f9d62e", "#a0e169", "#04d2d4", "#000"],
            brushWidths: [10, 20, 30, 40],
            currentImage: null,
            isFirstPaintable: false,
            hidePaintable: false,
            disableNavigation: true,
            dynamicLineWidth: 0,
            isActive: true,
            useEraser: false,
            color: "#000",
            threshold: 1,
        };
    },
    computed: {
        navigation() {
            return {
                "draw-save": {
                    body: "click here!",
                    activeBody: "<strong>save</strong>",
                },
                color: {
                    body: "color",
                },
            };
        },
    },
    methods: {
        selectColor(color) {
            this.color = color;
        },
        selectBrush(b) {
            this.dynamicLineWidth = b;
        },
        mirrorScreen() {
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
    },
    mounted() {
        setTimeout(() => {
            this.mirrorScreen();
        }, 100);
    },
};
</script>
<style>
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
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
}
.menu {
    top: 10px;
    left: 10px;
    position: fixed;
    width: 200px;
    height: 500px;
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
</style>
