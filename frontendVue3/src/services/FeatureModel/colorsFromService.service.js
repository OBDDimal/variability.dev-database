import { jsonToXML } from '@/services/xmlTranspiler.service';
import axios, { CancelToken } from 'axios';
import { NODE_CORE_COLOR, NODE_DEAD_COLOR, NODE_FALSEOP_COLOR } from '@/classes/constants';
import { useAppStore } from '@/store/app';

export async function getColorsFromService(featureModel, d3Data) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
          source.cancel();
          // Timeout Logic
        }, 450);
        const content = new TextEncoder().encode(jsonToXML(featureModel));
        let response = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}stats`, {
          name: featureModel.id + ".xml",
          content: Array.from(content)
        }, {cancelToken: source.token});
        clearTimeout(timeout);
        let deadFeatures = response.data.deadFeatures;
        let falseOptionalFeatures = response.data.falseOptionalFeatures;
        let coreFeatures = response.data.coreFeatures;

        if (coreFeatures.length > 0) {
            d3Data.root.descendants().filter(node => coreFeatures.includes(node.data.name)).forEach(node => node.data.setColor(NODE_CORE_COLOR));
        }
        if (falseOptionalFeatures.length > 0) {
            d3Data.root.descendants().filter(node => falseOptionalFeatures.includes(node.data.name)).forEach(node => node.data.setColor(NODE_FALSEOP_COLOR));
        }
        if (deadFeatures.length > 0) {
            d3Data.root.descendants().filter(node => deadFeatures.includes(node.data.name)).forEach(node => node.data.setColor(NODE_DEAD_COLOR));
        }
        return true;
    } catch (e) {
        const appStore = useAppStore()
        appStore.updateSnackbar(
          'Could not detect any special cases, because Service is down.',
          'error',
          3000,
          true)
        return false;
    }
}
