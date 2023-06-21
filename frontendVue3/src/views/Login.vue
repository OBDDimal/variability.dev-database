<template>
    <div class="mainView">
        <div
            style="
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: center;
            "
        >
            <h4 class="text-h4 mb-2 mt-8">Login to variability.dev</h4>
            <login-div style="max-width: 500px"></login-div>
        </div>
    </div>
</template>

<script setup>
import LoginDiv from '@/components/LoginDiv.vue';
</script>
