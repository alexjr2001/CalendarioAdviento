const design4 = {
  id: 'design4',
  label: 'Diseño 4 · Magia invernal',
  publicPath: '/Design4/index.html',
  fields: [
    {
      key: 'title',
      label: 'Título principal',
      type: 'textarea',
      rows: 2,
      maxLength: 160,
      required: true,
      defaultValue: 'Magia invernal\nen diciembre.'
    },
    {
      key: 'introText',
      label: 'Texto de introducción',
      type: 'textarea',
      rows: 3,
      maxLength: 700,
      required: true,
      defaultValue: 'Noches despejadas, nieve brillante y una pequeña sorpresa cada día. Abre una puerta cada día.'
    },
    {
      key: 'displayText',
      label: 'Dedicatoria',
      type: 'text',
      maxLength: 160,
      required: true,
      defaultValue: 'Para ti'
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
      defaultValue: false
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

export default design4;
