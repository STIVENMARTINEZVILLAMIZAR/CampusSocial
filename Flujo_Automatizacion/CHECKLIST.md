# Checklist — Flujo_Automatizacion y CampusSocial

Usa esto para validar que todo el software y n8n Docker/ngrok quedan alineados.

## Infraestructura

| Paso | Estado | Notas |
|------|--------|-------|
| Docker Desktop en ejecución | ☐ | Contenedor `n8n` puerto 5678 |
| Workflow importado y **Active** | ☐ | JSON en esta carpeta |
| ngrok → `localhost:5678` (opcional remoto) | ☐ | URL pública para Functions en la nube |
| `N8N_WEBHOOK_URL` en `.secret.local` o Ajustes | ☐ | Producción: `https://xxx.ngrok-free.dev/webhook/campus-post-form` |
| `N8N_WEBHOOK_SECRET` = Header Auth en n8n | ☐ | Mismo valor en nodo webhook |
| Backend emulador reiniciado | ☐ | `npm run dev` en Backend |

## Credenciales en n8n (workflow JSON)

| Credencial | Obligatorio | CampusSocial |
|------------|-------------|--------------|
| Header `X-Campus-Secret` | Sí | `N8N_WEBHOOK_SECRET` |
| Google Gemini | Sí* | Misma idea que `GEMINI_API_KEY` |
| OpenAI (DALL-E) | Si `include_image` en n8n | Opcional si la app ya envía `image_url` |
| Telegram | Opcional | `telegram_notify: true` en payload |
| Postiz / LinkedIn | Para publicar | Canales → Postiz |

\* La app ya genera texto/imagen; n8n puede solo publicar.

## Secciones de la app

| Pantalla | Qué debe hacer | Enlace con n8n |
|----------|----------------|----------------|
| **Asistente IA** | Ideas + botón **Generar publicación** → Nueva pub. auto | No llama n8n directo |
| **Nueva publicación** | Gemini + webhook n8n con `body`/`image_url` | `triggerN8nWorkflow` |
| **Subir publicación** | Storage + programar | Opcional webhook al programar |
| **Borradores** | Firestore | n8n crea borrador al disparar webhook |
| **Calendario** | Programados + arrastrar fecha | `schedulePost` + opcional n8n |
| **Canales** | Verificar cuenta + Postiz | `verify_channel` en webhook |
| **Ajustes** | URL webhook n8n/ngrok | `N8N_WEBHOOK_URL` |
| **Inicio** | KPIs y actividad | Trazas en `ejecuciones_n8n` |

## Payload mínimo de prueba

```json
{
  "topic": "Bootcamp Campus Lands",
  "tone": "profesional",
  "include_image": true,
  "telegram_notify": false,
  "schedule_now": false,
  "platforms": ["linkedin"]
}
```

## Pendientes habituales (fuera de n8n)

- [ ] Subir imagen IA a Firebase Storage antes del webhook (URL estable)
- [ ] OAuth real Meta/LinkedIn (hoy Postiz + ID integración)
- [ ] Callback n8n → actualizar `publicaciones.estado` en Firestore
