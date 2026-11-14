# davidballesterosbarrio.github.io

## TinaCMS

TinaCMS administra `content/portfolio.json`; el campo del CV acepta únicamente archivos PDF y los medios se guardan en `content/`.

1. Crea un proyecto en [Tina Cloud](https://app.tina.io), conecta este repositorio y configura los usuarios autorizados.
2. Ejecuta `npm ci`, copia `.env.example` a `.env` y añade el Client ID del proyecto y su token de solo lectura. No publiques el token.
3. Ejecuta `npx tinacms dev` una vez para generar `tina/tina-lock.json` y sube ese archivo al repositorio.
4. En GitHub, añade `NEXT_PUBLIC_TINA_CLIENT_ID` y `TINA_TOKEN` como secretos del repositorio. En **Settings → Pages**, selecciona **GitHub Actions** como origen.
5. Ejecuta `npm run build` para probar la compilación local. El panel se genera en `admin/` y el sitio completo queda en `_site/`.

El workflow de GitHub Actions compila TinaCMS y publica el sitio; el panel estará disponible en `/admin/`.

El acceso de los editores lo gestiona Tina Cloud mediante las cuentas autorizadas en el proyecto.