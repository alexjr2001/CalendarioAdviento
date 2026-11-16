const design2 = {
  id: 'design2',
  label: 'Diseño 2 · Vino caliente',
  publicPath: '/Design2/index.html',
  fields: [
    {
      key: 'title',
      label: 'Título',
      type: 'textarea',
      rows: 2,
      maxLength: 160,
      required: true,
      defaultValue: '24 momentos\npara ti.'
    },
    {
      key: 'introText',
      label: 'Mensaje de bienvenida',
      type: 'textarea',
      rows: 4,
      maxLength: 700,
      required: true,
      defaultValue: 'Un pequeño ritual para hacer más bonita la espera. Abre una puerta cada día y guarda ese momento.'
    },
    {
      key: 'displayText',
      label: 'Dedicatoria debajo de las fotos',
      type: 'text',
      maxLength: 120,
      required: true,
      defaultValue: 'Name 1 & Name 2'
    },
    {
      key: 'relationshipStartDate',
      label: 'Fecha especial',
      type: 'date',
      group: 'scratch',
      required: true,
      defaultValue: '2022-01-24'
    },
    {
      key: 'scratchEnabled',
      label: 'Mostrar tarjetas para rascar',
      type: 'checkbox',
      group: 'scratch',
      helpText: 'Completa la fecha y los tres textos para activar las tarjetas para rascar.',
      defaultValue: true
    },
    {
      key: 'scratchTitle',
      label: 'Título de las tarjetas para rascar',
      type: 'text',
      group: 'scratch',
      maxLength: 120,
      required: true,
      defaultValue: 'Fueron los momentos más bonitos...'
    },
    {
      key: 'scratchHint',
      label: 'Instrucción para rascar',
      type: 'text',
      group: 'scratch',
      maxLength: 180,
      required: true,
      defaultValue: 'Rasca los círculos para descubrirlo'
    },
    {
      key: 'scratchEndText',
      label: 'Texto final debajo de las tarjetas',
      type: 'text',
      group: 'scratch',
      maxLength: 120,
      required: true,
      defaultValue: 'de mi vida.'
    }
  ]
};

export default design2;