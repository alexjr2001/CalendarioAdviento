import './globals.css';

export const metadata = {
  title: 'Calendario de Adviento',
  description: 'Un calendario de Adviento personalizado'
};

export default function RootLayout({ children }) {
  return <html lang="es"><body>{children}</body></html>;
}
