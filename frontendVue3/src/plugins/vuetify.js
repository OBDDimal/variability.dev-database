import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { VDataTable } from 'vuetify/labs/VDataTable';
import { VBottomSheet} from 'vuetify/labs/VBottomSheet';

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'


export default createVuetify({
    theme: {
        defaultTheme: 'light',
    },
    components: {
        VDataTable,
        VBottomSheet,
        ContextMenu
    },
});
/*{
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
}*/
