import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { VDataTable } from 'vuetify/labs/VDataTable';
import { VBottomSheet} from 'vuetify/labs/VBottomSheet';

export default createVuetify({
    theme: {
        defaultTheme: 'light',
    },
    components: {
        VDataTable,
        VBottomSheet
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
