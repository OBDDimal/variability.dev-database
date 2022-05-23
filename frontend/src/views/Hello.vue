<template>
    <v-btn :class="test">{{age}}</v-btn>
</template>

<script>

import { defineComponent } from "@vue/composition-api";

export default defineComponent({
    data: {
        return {
            age: 2
        }
    },
    computed: {
        test() {
            return age == 3 ? "green" : "red";
        },
    }
});
</script>
