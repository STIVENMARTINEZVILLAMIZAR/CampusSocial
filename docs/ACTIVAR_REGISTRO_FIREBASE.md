# Activar registro de usuarios (Firebase)

Si al **Crear cuenta** aparece:

`Firebase: Error (auth/operation-not-allowed)`

significa que el método **Correo/Contraseña** no está habilitado en tu proyecto.

## Pasos (proyecto `campussocial-f56a0`)

1. Abre [Firebase Console](https://console.firebase.google.com/) → proyecto **CampusSocial**.
2. Menú **Authentication** (Autenticación).
3. Pestaña **Sign-in method** (Método de acceso).
4. Haz clic en **Correo/Contraseña** (Email/Password).
5. Activa **Habilitado** y guarda.
6. (Opcional) Activa también **Google** si usarás “Continuar con Google”.

## Después del registro

Al crear la cuenta, el sistema crea automáticamente en Firestore:

| Colección | Documento |
|-----------|-----------|
| `usuarios` | Perfil (email, nombre, rol) |
| `canales` | Estado de redes (LinkedIn, etc.) |
| `configuracion` | Webhook n8n, zona horaria |
| `actividad` | Mensaje de bienvenida |

Las colecciones `publicaciones`, `borradores`, `chats`, `ejecuciones_n8n` se llenan cuando uses la app.

## Desplegar reglas e índices

```bash
firebase deploy --only firestore
```

## Desplegar función de alta de usuario (recomendado)

```bash
cd Backend
npm run build
cd ..
firebase deploy --only functions:onAuthUserCreate
```
