# CampusSocial — Base de datos Firestore

Proyecto: `campussocial-f56a0` · Región: `southamerica-east1`

## Colecciones

### `usuarios/{uid}`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `uid` | string | Igual al Auth UID |
| `email` | string | Correo |
| `nombre` | string | Nombre visible |
| `rol` | `admin` \| `editor` \| `viewer` | Permisos |
| `redesConectadas` | map | `{ linkedin: bool, ... }` |
| `creadoEn` | timestamp | |
| `actualizadoEn` | timestamp | |

---

### `publicaciones/{postId}`

Posts finales (manual, programados o publicados vía n8n/Postiz).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | string | |
| `contenido` | string | Copy del post |
| `imagenUrl` | string \| null | Storage URL |
| `redesDestino` | array | `linkedin`, `instagram`, … |
| `estado` | string | `borrador`, `programado`, `publicado`, `fallido`, `pendiente`, `en_proceso` |
| `fechaProgramada` | timestamp \| null | |
| `creadoPor` | string | UID usuario |
| `resultados` | map | Por red: `{ success, postId?, error? }` |
| `n8nExecutionId` | string \| null | |
| `creadoEn` | timestamp | |
| `actualizadoEn` | timestamp | |

---

### `borradores/{draftId}`

Salida del Asistente IA / n8n antes de publicar.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuarioId` | string | |
| `titulo` | string | |
| `contenidoGenerado` | string | |
| `hashtags` | array | |
| `promptOriginal` | string | |
| `tono` | string | |
| `redSocial` | string | Red principal o `multi` |
| `redesDestino` | array | |
| `estado` | string | `pendiente`, `aprobado`, `rechazado`, `programado` |
| `n8nExecutionId` | string \| null | |
| `programadoPara` | timestamp \| null | |
| `creadoEn` | timestamp | |
| `actualizadoEn` | timestamp | |

---

### `ejecuciones_n8n/{id}`

Trazabilidad de cada llamada al webhook `campus-post-form`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuarioId` | string | |
| `borradorId` | string \| null | |
| `publicacionId` | string \| null | |
| `payload` | map | `topic`, `tone`, `include_image`, `platforms[]`, … |
| `respuesta` | map \| null | Respuesta n8n |
| `estado` | string | `enviado`, `completado`, `error` |
| `errorMensaje` | string \| null | |
| `creadoEn` | timestamp | |

---

### `canales/{uid}`

Un documento por usuario: estado de conexión por red (pantalla Canales).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuarioId` | string | |
| `linkedin` | map | `{ conectado, cuentaNombre, proveedor?, ultimaSync? }` |
| `instagram` | map | |
| `facebook` | map | |
| `twitter` | map | |
| `tiktok` | map | |
| `actualizadoEn` | timestamp | |

---

### `chats/{uid}/mensajes/{messageId}`

Historial del Asistente IA.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `role` | string | `user` \| `model` |
| `content` | string | |
| `orden` | number | Orden en el hilo |
| `creadoEn` | timestamp | |

---

### `actividad/{id}`

Feed del dashboard y notificaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuarioId` | string | |
| `tipo` | string | `publicado`, `programado`, `borrador`, `error`, `sistema` |
| `mensaje` | string | |
| `red` | string? | |
| `creadoEn` | timestamp | |

---

### `configuracion/{uid}`

Preferencias y webhook n8n por usuario (pantalla Ajustes).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuarioId` | string | Igual al UID |
| `n8nWebhookUrl` | string | URL del workflow n8n |
| `notifications` | boolean | Preferencia de alertas |
| `timezone` | string | Ej. `America/Bogota` |
| `creadoEn` | timestamp | |
| `actualizadoEn` | timestamp | |

---

### `tokens_redes/{uid}`

**Solo Cloud Functions** (reglas: cliente `deny`). Tokens OAuth LinkedIn/Meta/etc.

---

## Código cliente

| Repositorio | Archivo |
|-------------|---------|
| Tipos | `Fontend/src/lib/db/types.ts` |
| Usuarios | `usuarios.ts` |
| Publicaciones | `publicaciones.ts` |
| Borradores | `borradores.ts` |
| n8n | `ejecuciones.ts` |
| Canales | `canales.ts` |
| Actividad | `actividad.ts` |
| Chat IA | `chats.ts` |

Reglas: `firestore.rules` · Índices: `firestore.indexes.json`

---

## Poblar datos demo (emulador)

**1.** Emuladores encendidos (`npm run dev` en Backend, terminal abierta).

**2.** En otra terminal:

```bash
cd Backend
npm run seed
```

No uses `node ..\scripts\seed-firestore.mjs` sin emuladores: por defecto apunta al emulador local.  
Para la nube real (requiere `firebase login`): `node ../scripts/seed-firestore.mjs --production`

Crea usuario demo:

- **Email:** `demo@campuslands.com`
- **Contraseña:** `CampusSocial123!`
- **UID:** `campus-lands-demo-uid`

Ver datos: http://127.0.0.1:4000/firestore

En `Fontend/.env`:

```
VITE_USE_FIREBASE_EMULATOR=true
```

---

## n8n (webhook)

```json
{
  "topic": "string",
  "tone": "profesional",
  "include_image": true,
  "telegram_notify": true,
  "schedule_now": false,
  "platforms": ["linkedin", "instagram"]
}
```

Header: `X-Campus-Secret`
