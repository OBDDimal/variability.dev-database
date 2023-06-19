<template>
    <v-dialog v-model="showDialog" persistent width="400">
        <div id="tutorial-dialog">
            <svg
                v-if="!isMobile && isTop && isLeft"
                height="50px"
                width="400px"
            >
                <polygon
                    points="0,0 120,50 220,50"
                    :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                />
            </svg>
            <svg
                v-if="!isMobile && isTop && !isLeft"
                height="50px"
                width="400px"
            >
                <polygon
                    points="400,0 280,50 180,50"
                    :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                />
            </svg>
            <v-card
                v-if="step"
                outlined
                :style="
                    $vuetify.theme.dark
                        ? 'border: 1px solid white;'
                        : 'border: 1px solid #121212'
                "
            >
                <v-card-title>
                    <span>{{ step.title }}</span>
                    <v-spacer></v-spacer>
                    <v-btn icon text @click="exit">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    {{ step.description }}
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        :disabled="!beforeSteps.length"
                        text
                        color="error"
                        @click="beforeStep"
                        >Back</v-btn
                    >
                    <v-btn color="primary" text @click="nextStep"
                        >Continue</v-btn
                    >
                </v-card-actions>
            </v-card>
            <v-card v-else>
                <v-card-title>
                    Do you want to start the tutorial?
                </v-card-title>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="error" @click="$emit('close')"
                        >Close</v-btn
                    >
                    <v-btn color="primary" text @click="startTutorial"
                        >Start Tutorial</v-btn
                    >
                </v-card-actions>
            </v-card>
            <svg
                v-if="!isMobile && !isTop && isLeft"
                height="50px"
                width="400px"
            >
                <polygon
                    points="120,0 220,0 0,50"
                    :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                />
            </svg>
            <svg
                v-if="!isMobile && !isTop && !isLeft"
                height="50px"
                width="400px"
            >
                <polygon
                    points="180,0 280,0 400,50"
                    :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                />
            </svg>
        </div>
    </v-dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const step = ref(undefined);
const beforeSteps = ref([]);
const isTop = ref(false);
const isLeft = ref(false);
const isMobile = ref(false);
const counter = ref(0);

const props = defineProps({
    show: Boolean,
    nextSteps: {
        type: Array,
        required: false,
        default: () => [
            {
                title: 'Welcome to the tutorial!',
                description:
                    'You can restart the tutorial anytime by clicking on this icon on the left.',
                elementCssSelector: '#tutorial-mode',
            },
            {
                title: 'The menu',
                description:
                    "For a more precise description of the menu's icons click on this icon on the left.",
                elementCssSelector: '#feature-model-toolbar-extend',
            },
            {
                title: 'Your feature model',
                description:
                    'This is your main workspace. The feature model tree. You can move around and zoom in and out with your mouse or your fingers, depending on your platform.',
                elementCssSelector: '#svg-container',
            },
            {
                title: 'Your feature model',
                description:
                    'Feature model nodes are collapsed and uncollapsed when double-clicking. You can edit individual nodes with a right click and also use the corresponding context menu for other means of interacting with the feature model.',
                elementCssSelector: '#svg-container',
            },
            {
                title: 'Search',
                description:
                    'Feature models can get rather complex. To search for a node an navigate there automatically just click the magnifying glass above and enter your search query. In case there are multiple results you can navigate them with the arrows above.',
                elementCssSelector: '#feature-model-search',
            },
            {
                title: 'Your feature model',
                description:
                    "You may move around individual feature model nodes with 'drang and drop™'️. This does not allow semantic changes by default.",
                elementCssSelector: '#svg-container',
            },
            {
                title: 'Undo and redo',
                description:
                    'When making changes to a feature model it is important to have the possibility to revert changes. On the left you can find the undo and redo button.',
                elementCssSelector: '#feature-model-toolbar-undo',
            },
            {
                title: 'Save your changes',
                description:
                    'All of your modifications can be saved via the button on the left, even when you are offline!',
                elementCssSelector: '#feature-model-toolbar-save',
            },
            {
                title: 'Collaboration',
                description:
                    'You want to show others your feature model, or even edit it together with them? Just click the collaboration button on the left and share your thoughts!',
                elementCssSelector: '#feature-model-toolbar-collaboration',
            },
            {
                title: 'Constraints',
                description:
                    'To edit and view all of your cross-tree-constraints just click the button below. You may click individual constraints to highlight the corresponding feature model nodes in the tree above.',
                elementCssSelector: '#feature-model-constraints',
            },
            {
                title: 'Information',
                description:
                    'You may see individual statistics about your model by clicking the button below.',
                elementCssSelector: '#feature-model-information',
            },
            {
                title: 'Other settings',
                description:
                    'To change defaults and other settings just click on this icon on the left. You may also experiment around with all the other options. Remember the undo option.',
                elementCssSelector: '#feature-model-toolbar-other-settings',
            },
        ],
    },
    localStorageIdentifier: {
        type: String,
        required: false,
        default: 'featureModelTutorialCompleted',
    },
});

onMounted(() => {
    reset();
});
function startTutorial() {
    isMobile.value = 'ontouchstart' in window;
    step.value = this.nextSteps[this.counter];
    counter.value++;
    if (!isMobile.value) {
        setBubblePosition();
    }
}

function setBubblePosition() {
    const tutorialDialog = document.querySelector('#tutorial-dialog');
    if (this.isMobile) {
        tutorialDialog.style.position = 'block';
    } else {
        tutorialDialog.style.position = 'absolute';
    }
    if (this.step.elementCssSelector) {
        const rect = document
            .querySelector(this.step.elementCssSelector)
            .getBoundingClientRect();
        const middleX = (rect.left - rect.right) / 2 + rect.right;
        const middleY = (rect.bottom - rect.top) / 2 + rect.top;

        tutorialDialog.style.left = null;
        tutorialDialog.style.right = null;
        tutorialDialog.style.top = null;
        tutorialDialog.style.bottom = null;

        if (
            middleX + 400 >
            (window.innerWidth || document.documentElement.clientWidth)
        ) {
            tutorialDialog.style.left = `calc(${middleX}px - 400px)`;
            isLeft.value = false;
        } else {
            tutorialDialog.style.left = `calc(${middleX}px + 2rem)`;
            isLeft.value = true;
        }
        if (
            middleY + 200 >
            (window.innerHeight || document.documentElement.clientHeight)
        ) {
            tutorialDialog.style.bottom = `calc(${
                window.innerHeight - middleY
            }px)`;
            isTop.value = false;
        } else {
            tutorialDialog.style.top = middleY + 'px';
            isTop.value = true;
        }
    }
}

function nextStep() {
    if (this.nextSteps.length > this.counter) {
        this.beforeSteps.unshift(this.step);
        this.step = this.nextSteps[this.counter];
        this.counter++;
        if (!this.isMobile) {
            this.setBubblePosition();
        }
    } else {
        this.exit();
    }
}

function exit() {
    console.log('start');
    if (!isMobile.value) {
        const tutorialDialog = document.querySelector('#tutorial-dialog');
        tutorialDialog.style.left = '';
        tutorialDialog.style.top = '';
        tutorialDialog.style.position = '';
    }
    step.value = undefined;
    beforeSteps.value = [];
    isTop.value = Boolean;
    isLeft.value = Boolean;
    isMobile.value = Boolean;
    counter.value = 0;
    localStorage[props.localStorageIdentifier] = true;
    console.log('midd');
    this.$emit('close');
    console.log('end');
}

function beforeStep() {
    counter.value = counter - 1;
    //this.nextSteps.unshift(this.step);
    step.value = beforeSteps.value.shift();
    if (!isMobile.value) {
        setBubblePosition();
    }
}

function reset() {
    if (!isMobile.value) {
        const tutorialDialog = document.querySelector('#tutorial-dialog');
        tutorialDialog.style.left = 0;
        tutorialDialog.style.top = 0;
        tutorialDialog.style.position = 'absolute';
    }
}

watch(show, (newValue, oldValue) => {
    if (oldValue) {
        /*this.nextSteps = [
        ...this.beforeSteps.reverse(),
        this.step,
        ...this.nextSteps,
    ];*/
        step.value = undefined;
        beforeSteps.value = [];
        isTop.value = false;
        isLeft.value = false;
        isMobile.value = false;
        counter.value = 0;

        // Reset position to 0 0 when restarting the tutorial again
        reset();
    }
});
</script>

<style lang="scss">
#tutorial-dialog {
    max-width: 400px;
    transition: all 0.75s;

    > .v-card {
        margin-top: -10px;
    }
}
</style>
