# Spin to Win

Juego web (React + Vite). El proyecto fue consolidado para funcionar completamente desde la carpeta raíz.

## Estructura del repositorio
- `src/`: código fuente React (App.jsx, TypingReveal.jsx, estilos y datos)
- `package.json`: scripts y dependencias
- `vite.config.mjs`: configuración de Vite
- `.gitignore`, `README.md`, `vercel.json`: configuración de despliegue

## Desarrollo local

Instala dependencias e inicia el servidor de desarrollo:

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
npm run preview
```

## Despliegue en Vercel

1. Inicia sesión con la CLI si no lo has hecho:

```bash
npx vercel login
```

2. Despliega desde la raíz del repo:

```bash
npx vercel --prod --cwd .
```

o configura el proyecto en la web de Vercel y conecta el repositorio.

## Notas

- He consolidado el código en la raíz para simplificar el despliegue. Si necesitas restaurar la versión anterior con `frontend/` y `backend/`, revisa el historial de commits si lo hay.

---

