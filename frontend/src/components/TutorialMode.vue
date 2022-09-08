<template>
    <v-dialog v-model="showDialog" persistent>
        <div id="tutorial-dialog">
            <svg height="50px">
                <polygon points="0,0 120,50 220,50" style="fill: white"/>
            </svg>
            <v-card v-if="step">
                <v-card-title>
                    {{ step.title }}
                </v-card-title>

                <v-card-text>
                    {{ step.description }}
                </v-card-text>

                <v-card-actions>
                    <v-btn :disabled="!beforeSteps.length" text @click="beforeStep">Back</v-btn>
                    <v-btn color="primary" text @click="nextStep">Continue</v-btn>
                </v-card-actions>
            </v-card>
            <v-card v-else>
                <v-card-title>
                    Do you want to start the tutorial?
                </v-card-title>

                <v-card-text>
                    Text
                </v-card-text>

                <v-card-actions>
                    <v-btn text @click="$emit('close')">Close</v-btn>
                    <v-btn color="primary" text @click="startTutorial">Start Tutorial</v-btn>
                </v-card-actions>
            </v-card>
        </div>
    </v-dialog>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'tutorial-mode',

    data: () => ({
        step: undefined,
        nextSteps: [
            {
                title: "Step 1",
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                elementCssSelector: "#tutorial-mode",
            },
            {
                title: "Step 2",
                description: "asdasdasdas",
                elementCssSelector: "#svg-container",
            },
            {
                title: "Step 3",
                description: "asdasdasdas",
                elementCssSelector: "#svg-container",
            },
        ],
        beforeSteps: [],
    }),

    props: {
        show: Boolean,
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
            },
            set() {
            }
        },
    },

    components: {},

    mounted() {
    },

    methods: {
        startTutorial() {
            this.step = this.nextSteps.shift();
            this.setBubblePosition();
        },

        setBubblePosition() {
            if (this.step.elementCssSelector) {
                const rect = document.querySelector(this.step.elementCssSelector).getBoundingClientRect();
                const tutorialDialog = document.querySelector("#tutorial-dialog");
                const middleX = ((rect.left - rect.right) / 2) + rect.right;
                const middleY = ((rect.bottom - rect.top) / 2) + rect.top;

                tutorialDialog.style.left = `calc(${middleX}px + 2rem)`;
                tutorialDialog.style.top = middleY + "px";
            }
        },

        nextStep() {
            if (this.nextSteps.length) {
                this.beforeSteps.unshift(this.step);
                this.step = this.nextSteps.shift();
                this.setBubblePosition();
            } else {
                this.$emit('close');
            }
        },

        beforeStep() {
            this.nextSteps.unshift(this.step);
            this.step = this.beforeSteps.shift();
            this.setBubblePosition();
        }
    },

    watch: {
        show(newValue, oldValue) {
            if (oldValue) {
                this.nextSteps = [...this.beforeSteps.reverse(), this.step, ...this.nextSteps];
                this.beforeSteps = [];
                this.step = undefined;

                // Reset position to 0 0
                const tutorialDialog = document.querySelector("#tutorial-dialog");
                tutorialDialog.style.left = 0;
                tutorialDialog.style.top = 0;
            }
        },
    },
})
</script>

<style lang="scss">
#tutorial-dialog {
    position: absolute;
    max-width: 400px;
    transition: all .75s;
    top: 0;
    left: 0;

    > .v-card {
        margin-top: -10px;
    }
}
</style>
