# Despliegue del Editor y webs cliente

## Arquitectura

Un solo proyecto Next.js/Vercel sirve el Editor, la API y los cuatro diseños:

- Design1: `/Design1/index.html`
- Design2: `/Design2/index.html`
- Design3: `/Design3/index.html`
- Design4: `/Design4/index.html`
- Cliente por slug: `/c/SLUG`
- Editor privado: `/edit/TOKEN`

Cada diseño vive en su propia carpeta dentro de `public/Design1` a `public/Design4`. Varios calendarios pueden elegir el mismo diseño; `/c/SLUG` consulta la fila del cliente y abre esa carpeta con el slug adecuado. Cada calendario conserva sus propios textos, fecha y medios.

## Supabase

Para una base nueva, ejecuta `supabase-schema.sql` en el SQL Editor de Supabase. Si ya tienes la base anterior, ejecuta en este orden `supabase-migration-photo-slots.sql`, `supabase-migration-editor-settings.sql`, `supabase-migration-editor-security.sql` y `supabase-migration-audio-recordings.sql`. Las migraciones son aditivas y conservan calendarios y medios existentes.

Cada foto se asocia a `calendar_id`, no al token:

- `cover`: espacios 1 a 5.
- `gift`: espacios 1 a 24, cada uno con tipo imagen/video/audio y caption; también puede tener un juego asignado.
- `music`: un archivo de audio en el espacio 0.

El token privado se guarda como hash en `calendars.editor_token_hash`. Los campos variables por diseño, la visibilidad/textos scratch y el orden de las cinco portadas se guardan por cliente en `calendars.settings` (JSONB). Cada definición de Editor está en `lib/designs/`; cambiar los campos de un diseño no requiere una columna nueva. Supabase Storage usa el bucket privado `calendar-media`; las cargas usan URLs temporales firmadas por el servidor.

## Seguridad del Editor

- Los enlaces de Editor vencen al año. El servidor compara el hash del token y la fecha de expiración antes de permitir acceso.
- El Editor y sus APIs limitan 180 solicitudes por IP cada 15 minutos. Se guarda un hash de la IP, no la dirección en claro; la tabla solo es accesible por `service_role` y la RPC está revocada para `anon` y `authenticated`.
- Las mutaciones verifican el encabezado `Origin`. Los enlaces privados no se envían como `Referer`; el Editor/API usan `no-store`, `noindex`, protección contra iframe y `nosniff`.
- Para invalidar un enlace antes de su vencimiento, desde el proyecto ejecuta `npm run calendar:rotate-token -- <slug>`. Esto reemplaza el hash del token anterior y muestra el enlace nuevo una sola vez.
- `SUPABASE_SERVICE_ROLE_KEY` debe ser una clave Secret, solo en variables de entorno de Vercel/servidor; nunca en `NEXT_PUBLIC_*`, en el navegador ni en Git.

## Variables del proyecto Editor

Configura estas variables en el proyecto Vercel de `CalendarioAdviento` y en `.env.local` para desarrollo. La clave `service_role` solo vive en el servidor del Editor; nunca la pongas en una web cliente ni la subas a Git.

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=https://TU-EDITOR.vercel.app
```

## Vercel

Cuando el proyecto esté subido a GitHub, impórtalo en Vercel una sola vez con `CalendarioAdviento` como directorio raíz. Vercel detectará Next.js y desplegará junto el Editor, la API y los cuatro diseños.

Las páginas cliente usarán el mismo dominio con las rutas `/Design1/index.html`, `/Design2/index.html`, `/Design3/index.html` y `/Design4/index.html`; cada cliente tiene su URL `/c/SLUG`. `site-config.js` obtiene automáticamente el mismo origen para conectarse a la API. Los nuevos clientes pueden reutilizar cualquier diseño existente con un slug distinto.

Para añadir un diseño adicional, crea su carpeta pública y archivo de configuración, agrega su definición en `lib/designs/` con sus propios `fields`, `defaultValue` y `publicPath`, y regístralo en `lib/designs/index.js`. La carpeta define la apariencia y los campos definen ese Editor; no agregues columnas a la base de datos por cada campo nuevo.

## Crear calendarios y enlaces privados

En la carpeta `CalendarioAdviento`, ejecuta una vez por calendario:

```powershell
npm run calendar:create -- anna design1
npm run calendar:create -- maria design1
npm run calendar:create -- alex design2
```

El comando recibe un slug y un diseño, crea la fila en Supabase, almacena únicamente el hash del token y muestra la URL pública y el enlace privado del Editor. Guarda el enlace privado de forma segura. Si un slug ya existe, no lo vuelvas a crear.

Para crear otro calendario, configura `NEXT_PUBLIC_APP_URL` con el dominio desplegado y ejecuta `npm run calendar:create -- nombre-cliente design1` (cambia `design1` por el diseño deseado). Envía la URL `/c/nombre-cliente` como página pública y el enlace `/edit/TOKEN` por un canal privado. Al terminar, confirma que el cliente puede subir archivos y que su calendario público los muestra; no compartas ni registres el token en tickets o analytics.

## Editor

El Editor permite modificar los campos definidos por cada diseño, cambiar la visibilidad y textos de las tarjetas scratch, y ordenar las cinco portadas. También permite subir 24 fotos o videos con un caption por puerta y elegir música. Admite imágenes JPG, PNG, WebP, GIF y AVIF; videos MP4, MOV y WebM; y audio MP3, M4A, AAC, OGG o WAV. El límite de aplicación y bucket es 50 MB por archivo. Los videos se almacenan tal cual: no se comprimen ni transcodifican.
