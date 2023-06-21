<template>
    <v-alert
        border="left"
        class="information-bubble"
        color="blue accent-4"
        colored-border
        elevation="2"
    >
        <div class="text-h6">Information</div>

        <v-simple-table>
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">Category</th>
                        <th class="text-left">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in information" :key="item.category">
                        <td>{{ item.category }}</td>
                        <td>{{ item.value }}</td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </v-alert>
</template>

<script>
export default {
    name: 'FeatureModelInformation',

    props: {},

    data: () => ({
        information: [
            { category: 'Test 1', value: 'asdasdasd' },
            { category: 'Test 2', value: true },
            { category: 'Test 3', value: 1234 },
        ],
    }),

    methods: {},
};
</script>
<style lang="scss">
.information-bubble {
    position: absolute;
    bottom: 4rem;
    right: 2rem;
}
</style>
