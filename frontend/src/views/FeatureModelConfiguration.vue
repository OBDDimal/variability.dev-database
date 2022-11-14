<template>
    <div class="mainView">
        <h3 class="text-h3 mb-2 mt-8">Configurations</h3>
        <h5 class="text-h5 mb-4">Here you can edit or add new feature model configurations</h5>

        <v-treeview
            :items="[data.rootNode]"
            selectable
        ></v-treeview>
    </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';
import * as xmlTranspiler from '@/services/xmlTranspiler.service';
import beautify from 'xml-beautifier';

export default Vue.extend({
    name: 'FeatureModelConfiguration',

    props: {
        id: undefined,
    },

    data: () => ({
        data: {
            featureMap: [],
            constraints: [],
            properties: [],
            calculations: undefined,
            comments: [],
            featureOrder: undefined,
            rootNode: undefined,
        },
    }),

    created() {
        this.initData();
    },

    methods: {
        initData() {
            if (this.id === 'local') {
                const xml = beautify(localStorage.featureModelData);
                xmlTranspiler.xmlToJson(xml, this.data);
                this.xml = xml;
            } else if (this.id) {
                api.get(`${process.env.VUE_APP_DOMAIN}files/${this.id}/`).then(
                    (data) => {
                        api.get(data.data.local_file).then((rawData) => {
                            const xml = beautify(rawData.data);
                            xmlTranspiler.xmlToJson(xml, this.data);
                            this.xml = xml;
                        });
                    }
                );
            }

            console.log(this.data);
        },
    },


});
</script>

<style lang="scss">
</style>
