# LinkedIn OAuth — CampusSocial

## URL de política de privacidad (formulario LinkedIn Developers)

Usa una de estas URLs **públicas en HTTPS** (tras desplegar Hosting):

| URL | Cuándo |
|-----|--------|
| `https://campussocial-f56a0.web.app/privacidad` | App React (recomendada) |
| `https://campussocial-f56a0.web.app/privacidad.html` | HTML estático (respaldo) |

En local (solo pruebas): `http://localhost:5173/privacidad` — LinkedIn **no** acepta `localhost` en producción; despliega primero para crear la app.

## Crear app en LinkedIn

1. [LinkedIn Developers](https://www.linkedin.com/developers/apps) → **Crear aplicación**
2. Página: **Campuslands**
3. **URL de política de privacidad:** ver tabla arriba
4. Producto: **Share on LinkedIn** (y permisos de organización si publicas como empresa)

## Redirect URI (Auth)

En la app de LinkedIn → **Auth** → **Authorized redirect URLs**, añade:

**Producción:**

```
https://us-central1-campussocial-f56a0.cloudfunctions.net/linkedinOAuthCallback
```

**Emulador local:**

```
http://127.0.0.1:5001/campussocial-f56a0/us-central1/linkedinOAuthCallback
```

## Secretos (`Backend/.secret.local`)

```env
LINKEDIN_CLIENT_ID=tu_client_id
LINKEDIN_CLIENT_SECRET=tu_client_secret
# Opcional (si no usas el valor por defecto):
# LINKEDIN_REDIRECT_URI=https://us-central1-campussocial-f56a0.cloudfunctions.net/linkedinOAuthCallback
APP_FRONTEND_URL=https://campussocial-f56a0.web.app
```

Producción en Firebase:

```bash
firebase functions:secrets:set LINKEDIN_CLIENT_ID
firebase functions:secrets:set LINKEDIN_CLIENT_SECRET
firebase functions:secrets:set APP_FRONTEND_URL
```

## Flujo en la app

1. Usuario → **Canales** → **Conectar LinkedIn** → **Conectar con LinkedIn**
2. Callable `linkedinOAuthStart` → redirect a LinkedIn
3. LinkedIn → `linkedinOAuthCallback` → guarda `tokens_redes` + `canales`
4. Redirect a `/?linkedin=success` → pantalla Canales

## Desplegar política de privacidad

```bash
cd Frontend && npm run build
cd .. && firebase deploy --only hosting,functions,firestore
```
