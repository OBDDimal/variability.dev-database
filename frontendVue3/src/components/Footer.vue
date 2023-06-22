<template>
    <v-footer
        class="mt-8 d-flex py-4 h-auto"
        style="flex: initial"
        :class="smAndDown ? 'flex-column' : 'justify-space-between'"
        absolute
        border="t"
    >
        <span> © variability.dev, Ulm University </span>
        <span>Made with &#10084; in Institutspool</span>
        <v-btn
            variant="text"
            to="/dsgvo"
            color="primary"
            prepend-icon="mdi-scale-balance"
            size="small"
        >
            Imprint & Privacy
        </v-btn>
    </v-footer>
</template>

<script setup>
import { useDisplay } from 'vuetify';

const { smAndDown } = useDisplay();
</script>
