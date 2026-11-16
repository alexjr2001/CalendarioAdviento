const designs = [
  { href: '/Design1/index.html', name: 'Diseño 1 · Noche estrellada', theme: 'preview-design1', tagline: 'Elegante en verde oscuro y dorado', shapes: ['square'] },
  { href: '/Design2/index.html', name: 'Diseño 2 · Vino caliente', theme: 'preview-design2', tagline: 'Festivo en rojo vino, verde y dorado', shapes: ['square'] },
  { href: '/Design3/index.html', name: 'Diseño 3 · Alegría en familia', theme: 'preview-design3', tagline: 'Para la familia, en ciruela y dorado', shapes: ['normal', 'wide', 'normal', 'tall', 'normal', 'normal'] },
  { href: '/Design4/index.html', name: 'Diseño 4 · Magia invernal', theme: 'preview-design4', tagline: 'Invierno en azul noche y plateado', shapes: ['square'] }
];

export default function HomePage() {
  return <main>
    <p className="eyebrow">Calendario de Adviento</p>
    <h1>¡Elige un diseño y pruébalo!</h1>
    <p className="lead">Elige un diseño y prueba el calendario: haz clic en una tarjeta para abrir la vista previa interactiva.</p>
    <div className="design-gallery">
      {designs.map(design => <a className={`design-card ${design.theme}`} href={design.href} key={design.href}>
        <span className="design-card-preview">
          <span className="design-card-header">
            <span className="design-card-eyebrow">Diciembre</span>
            <span className="design-card-title">24 momentos<br />para ti.</span>
          </span>
          <span className="design-card-grid">
            {Array.from({ length: 6 }, (_, index) => <span className={`design-card-door door-span-${design.shapes[index % design.shapes.length]}`} key={index}>{String(index + 1).padStart(2, '0')}</span>)}
          </span>
        </span>
        <span className="design-card-footer">
          <span className="design-card-name">{design.name}</span>
          <span className="design-card-tagline">{design.tagline}</span>
        </span>
      </a>)}
    </div>
    <div className="buy-fab-group">
      <a className="buy-fab" href="https://ig.me/m/advents_kalender2026" target="_blank" rel="noopener">🛒 Haz tu pedido</a>
      <a className="buy-fab buy-fab-secondary" href="https://ig.me/m/advents_kalender2026" target="_blank" rel="noopener">💬 ¿Tienes dudas? ¡Escríbenos!</a>
    </div>
  </main>;
}
