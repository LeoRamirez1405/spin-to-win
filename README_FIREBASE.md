Configuración rápida para Firebase (Realtime sync)

Resumen

Este proyecto usa Firestore como "singleton" de partida en el documento `games/shared`.

Qué debes hacer

1. Crear proyecto Firebase
   - Ve a https://console.firebase.google.com/
   - Crea un nuevo proyecto
   - En el panel de proyecto, ve a `Build` → `Firestore Database` y crea una base de datos (modo de prueba o producción según prefieras).
   - Ve a la rueda ⚙️ → `Project settings` → `General` → `Your apps` → `Add app` → `Web`.
   - Copia la configuración del SDK (apiKey, authDomain, projectId, appId, etc).

2. Rellenar variables de entorno
   - Copia `.env.example` a `.env.local` en la raíz del proyecto.
   - Pega los valores del SDK en las variables `VITE_FIREBASE_...`.

3. Instalar dependencias (si no lo hiciste):

```bash
npm install
```

4. Ejecutar localmente y probar en dos ventanas:

```bash
npm run dev
```

Abre la app en dos navegadores o pestañas; al agregar jugadores, retos o girar, los cambios deben sincronizarse entre las instancias.

Despliegue en Vercel

- Sube el repo a GitHub (o usa Vercel CLI).
- En el panel de Vercel para tu proyecto, añade las mismas variables de entorno `VITE_FIREBASE_*` con sus valores.
- Vercel hará build y tu front podrá comunicarse con Firestore.

Notas

- Si no quieres exponer claves en el cliente, considera un backend con endpoints protegidos para mutaciones.
- Firestore seguridad: en producción configura reglas y habilita autenticación si es necesario.
