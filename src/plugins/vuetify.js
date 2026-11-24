import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VApp, VMain, VCard, VBtn, VCheckbox, VProgressLinear, VTable, VTextField, VAlert } from 'vuetify/components'

export default createVuetify({
  components: { VApp, VMain, VCard, VBtn, VCheckbox, VProgressLinear, VTable, VTextField, VAlert },
  theme: { defaultTheme: 'dark' }
})
