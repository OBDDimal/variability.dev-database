<template>
    <v-card
        elevation="8"
    >
        <v-card-text>
            <v-simple-table>
                <template v-slot:default>
                    <thead>
                    <tr>
                        <th class="text-left">
                            Category
                        </th>
                        <th class="text-left">
                            Value
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr
                        v-for="item in information"
                        :key="item.category"
                    >
                        <td>{{ item.category }}</td>
                        <td>{{ item.value }}</td>
                    </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </v-card-text>

    </v-card>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'FeatureModelInformation',

    props: {},

    data: () => ({
        information: [
            {category: "Test 1", value: "asdasdasd"},
            {category: "Test 2", value: true},
            {category: "Test 3", value: 1234},
        ]
    }),

    methods: {

    }
})
</script>