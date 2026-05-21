/**
 * Pobla Firestore con datos demo CampusSocial.
 *
 * Por defecto usa EMULADOR (sin credenciales Google).
 *   npm run seed          (desde Backend, con emuladores encendidos)
 *
 * Para la nube real (requiere firebase login + permisos):
 *   node ../scripts/seed-firestore.mjs --production
 */
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(__dirname, '../Backend/package.json'));
const admin = require('firebase-admin');

const PROJECT_ID = 'campussocial-f56a0';
const DEMO_UID = 'campus-lands-demo-uid';
const DEMO_EMAIL = 'demo@campuslands.com';
const DEMO_PASSWORD = 'CampusSocial123!';

/** Por defecto emulador; solo nube si pasas --production */
const useProduction = process.argv.includes('--production');
const useEmulator = !useProduction;

if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  // Evita que Admin SDK busque credenciales de Google Cloud
  process.env.GCLOUD_PROJECT = PROJECT_ID;
}

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();
const auth = admin.auth();
const { FieldValue, Timestamp } = admin.firestore;

const now = Timestamp.now();
const daysAgo = (n) => Timestamp.fromDate(new Date(Date.now() - n * 86400000));
const daysAhead = (n) => Timestamp.fromDate(new Date(Date.now() + n * 86400000));

async function ensureDemoUser() {
  if (!useEmulator && useProduction) {
    console.log('Modo nube: asegúrate de haber ejecutado: firebase login');
  }

  try {
    await auth.getUser(DEMO_UID);
    console.log('Usuario demo ya existe:', DEMO_EMAIL);
  } catch (err) {
    try {
      await auth.createUser({
        uid: DEMO_UID,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        displayName: 'Campus Lands Demo',
      });
      console.log('Usuario demo creado:', DEMO_EMAIL, '| contraseña:', DEMO_PASSWORD);
    } catch (createErr) {
      console.warn('⚠ No se pudo crear usuario Auth:', createErr.message);
      if (useEmulator) {
        console.warn('  → ¿Emuladores activos? En otra terminal: cd Backend && npm run dev');
        console.warn('  → Los datos Firestore se cargarán igual; login demo puede fallar hasta reiniciar emuladores con Auth.');
      } else {
        throw createErr;
      }
    }
  }
}

async function clearCollection(path, field, uid) {
  const snap = await db.collection(path).where(field, '==', uid).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
}

async function seed() {
  console.log('CampusSocial — seed Firestore');
  console.log('Proyecto:', PROJECT_ID, useEmulator ? '(emulador local)' : '(nube — requiere firebase login)');

  if (useEmulator) {
    console.log('Firestore →', process.env.FIRESTORE_EMULATOR_HOST);
    console.log('Auth      →', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    console.log('(Si falla, abre antes: cd Backend && npm run dev)\n');
  }

  await ensureDemoUser();

  // Limpiar datos previos del usuario demo (idempotente)
  await clearCollection('publicaciones', 'creadoPor', DEMO_UID);
  await clearCollection('borradores', 'usuarioId', DEMO_UID);
  await clearCollection('ejecuciones_n8n', 'usuarioId', DEMO_UID);
  await clearCollection('actividad', 'usuarioId', DEMO_UID);

  const chatsRef = db.collection('chats').doc(DEMO_UID).collection('mensajes');
  const oldMsgs = await chatsRef.get();
  const delBatch = db.batch();
  oldMsgs.docs.forEach((d) => delBatch.delete(d.ref));
  if (!oldMsgs.empty) await delBatch.commit();

  // ─── usuarios ─────────────────────────────────────────────
  await db.collection('usuarios').doc(DEMO_UID).set({
    uid: DEMO_UID,
    email: DEMO_EMAIL,
    nombre: 'Campus Lands',
    rol: 'admin',
    redesConectadas: {
      linkedin: true,
      instagram: false,
      facebook: false,
      twitter: false,
      tiktok: false,
    },
    creadoEn: daysAgo(30),
    actualizadoEn: now,
  });
  console.log('✓ usuarios');

  // ─── canales (LinkedIn principal) ───────────────────────
  await db.collection('canales').doc(DEMO_UID).set({
    usuarioId: DEMO_UID,
    linkedin: {
      conectado: true,
      cuentaNombre: 'Campus Lands',
      proveedor: 'postiz',
      ultimaSync: now,
    },
    instagram: { conectado: false, cuentaNombre: null },
    facebook: { conectado: false, cuentaNombre: null },
    twitter: { conectado: false, cuentaNombre: null },
    tiktok: { conectado: false, cuentaNombre: null },
    actualizadoEn: now,
  });
  console.log('✓ canales');

  // ─── publicaciones ────────────────────────────────────────
  const publicaciones = [
    {
      titulo: 'Bootcamp Full Stack 2025',
      contenido:
        '🚀 ¿Listo para ser desarrollador profesional?\n\nEn Campus Lands lanzamos el bootcamp Full Stack con proyectos reales, mentoría y conexión con empresas tech.\n\n#CampusLands #DesarrolloWeb #LinkedIn',
      imagenUrl: null,
      redesDestino: ['linkedin'],
      estado: 'publicado',
      fechaProgramada: null,
      creadoPor: DEMO_UID,
      resultados: {
        linkedin: { success: true, postId: 'li-demo-001' },
      },
      n8nExecutionId: null,
      creadoEn: daysAgo(2),
      actualizadoEn: daysAgo(2),
    },
    {
      titulo: 'Open Day virtual',
      contenido:
        'Te invitamos a nuestro Open Day virtual: conoce el campus, habla con mentores y resuelve dudas sobre carreras tech.\n\n📅 Este jueves 6pm COL',
      imagenUrl: null,
      redesDestino: ['linkedin', 'instagram'],
      estado: 'programado',
      fechaProgramada: daysAhead(3),
      creadoPor: DEMO_UID,
      resultados: {},
      n8nExecutionId: 'exec-demo-002',
      creadoEn: daysAgo(1),
      actualizadoEn: now,
    },
    {
      titulo: 'Testimonio egresado',
      contenido: '“En 6 meses pasé de cero a mi primer empleo como dev.” — María, egresada Campus Lands.',
      imagenUrl: null,
      redesDestino: ['linkedin'],
      estado: 'borrador',
      fechaProgramada: null,
      creadoPor: DEMO_UID,
      resultados: {},
      n8nExecutionId: null,
      creadoEn: now,
      actualizadoEn: now,
    },
    {
      titulo: 'Ciberseguridad para empresas',
      contenido: 'Nuevo diplomado en ciberseguridad aplicada. Cupos limitados.',
      imagenUrl: null,
      redesDestino: ['linkedin'],
      estado: 'fallido',
      fechaProgramada: daysAgo(1),
      creadoPor: DEMO_UID,
      resultados: {
        linkedin: { success: false, error: 'Token Postiz expirado (demo)' },
      },
      n8nExecutionId: null,
      creadoEn: daysAgo(5),
      actualizadoEn: daysAgo(4),
    },
  ];

  for (const pub of publicaciones) {
    await db.collection('publicaciones').add(pub);
  }
  console.log('✓ publicaciones (' + publicaciones.length + ')');

  // ─── borradores ───────────────────────────────────────────
  const borradores = [
    {
      usuarioId: DEMO_UID,
      titulo: 'IA y educación',
      contenidoGenerado:
        'La IA no reemplaza educadores: los potencia. En Campus Lands integramos herramientas como Gemini para acelerar la creación de contenido sin perder el sello humano.',
      hashtags: ['#IA', '#EdTech', '#CampusLands'],
      promptOriginal: 'Post sobre IA en educación para LinkedIn',
      tono: 'profesional',
      redSocial: 'linkedin',
      redesDestino: ['linkedin'],
      estado: 'pendiente',
      n8nExecutionId: 'exec-demo-001',
      programadoPara: null,
      creadoEn: daysAgo(1),
      actualizadoEn: now,
    },
    {
      usuarioId: DEMO_UID,
      titulo: 'Beca mujeres en tech',
      contenidoGenerado: 'Abrimos 20 becas para mujeres que quieran iniciar en programación. Postula antes del viernes.',
      hashtags: ['#MujeresEnTech'],
      promptOriginal: 'Anuncio becas LinkedIn',
      tono: 'inspirador',
      redSocial: 'linkedin',
      redesDestino: ['linkedin'],
      estado: 'aprobado',
      n8nExecutionId: null,
      programadoPara: daysAhead(1),
      creadoEn: daysAgo(3),
      actualizadoEn: daysAgo(2),
    },
    {
      usuarioId: DEMO_UID,
      titulo: '',
      contenidoGenerado: '',
      hashtags: [],
      promptOriginal: 'Carrusel Instagram campus',
      tono: 'casual',
      redSocial: 'multi',
      redesDestino: ['instagram', 'linkedin'],
      estado: 'rechazado',
      n8nExecutionId: null,
      programadoPara: null,
      creadoEn: daysAgo(7),
      actualizadoEn: daysAgo(6),
    },
  ];

  for (const b of borradores) {
    await db.collection('borradores').add(b);
  }
  console.log('✓ borradores (' + borradores.length + ')');

  // ─── ejecuciones_n8n ──────────────────────────────────────
  await db.collection('ejecuciones_n8n').add({
    usuarioId: DEMO_UID,
    borradorId: null,
    publicacionId: null,
    payload: {
      topic: 'Bootcamp Full Stack',
      tone: 'profesional',
      include_image: true,
      telegram_notify: true,
      schedule_now: false,
      platforms: ['linkedin'],
    },
    respuesta: {
      success: true,
      title: 'Bootcamp Full Stack 2025',
      body: publicaciones[0].contenido,
      hashtags: ['#CampusLands'],
      linkedin_status: 'scheduled',
    },
    estado: 'completado',
    errorMensaje: null,
    creadoEn: daysAgo(2),
  });
  await db.collection('ejecuciones_n8n').add({
    usuarioId: DEMO_UID,
    borradorId: null,
    publicacionId: null,
    payload: {
      topic: 'Test fallido',
      tone: 'profesional',
      include_image: false,
      telegram_notify: false,
      schedule_now: true,
      platforms: ['linkedin'],
    },
    respuesta: null,
    estado: 'error',
    errorMensaje: 'Webhook n8n timeout (demo)',
    creadoEn: daysAgo(4),
  });
  console.log('✓ ejecuciones_n8n');

  // ─── actividad (dashboard) ────────────────────────────────
  const actividades = [
    {
      usuarioId: DEMO_UID,
      tipo: 'publicado',
      mensaje: 'Post publicado en LinkedIn: Bootcamp Full Stack 2025',
      red: 'linkedin',
      creadoEn: daysAgo(2),
    },
    {
      usuarioId: DEMO_UID,
      tipo: 'programado',
      mensaje: 'Open Day virtual programado para dentro de 3 días',
      red: 'linkedin',
      creadoEn: daysAgo(1),
    },
    {
      usuarioId: DEMO_UID,
      tipo: 'borrador',
      mensaje: 'Borrador IA generado: IA y educación',
      red: 'linkedin',
      creadoEn: daysAgo(1),
    },
    {
      usuarioId: DEMO_UID,
      tipo: 'error',
      mensaje: 'Error al publicar: Ciberseguridad para empresas',
      red: 'linkedin',
      creadoEn: daysAgo(4),
    },
    {
      usuarioId: DEMO_UID,
      tipo: 'publicado',
      mensaje: 'Flujo n8n completado correctamente',
      red: 'linkedin',
      creadoEn: now,
    },
  ];

  for (const a of actividades) {
    await db.collection('actividad').add(a);
  }
  console.log('✓ actividad (' + actividades.length + ')');

  // ─── chats / mensajes (Asistente IA) ──────────────────────
  const mensajes = [
    { role: 'model', content: '¡Hola! Soy el asistente de CampusSocial. ¿Te ayudo con copy para LinkedIn?' },
    { role: 'user', content: 'Necesito un post sobre el bootcamp Full Stack' },
    {
      role: 'model',
      content:
        'Propuesta:\n\n🚀 Bootcamp Full Stack Campus Lands — de cero a empleo en 6 meses.\nProyectos reales, mentoría y red de empresas.\n\n¿Quieres tono más formal o más cercano?',
    },
  ];

  for (let i = 0; i < mensajes.length; i++) {
    await chatsRef.add({
      ...mensajes[i],
      orden: i,
      creadoEn: Timestamp.fromDate(new Date(Date.now() - (mensajes.length - i) * 60000)),
    });
  }
  console.log('✓ chats/mensajes');

  // tokens_redes: solo Admin SDK (demo vacío — Functions lo llenan en prod)
  await db.collection('tokens_redes').doc(DEMO_UID).set({
    linkedin: { accessToken: 'DEMO_NO_USAR_EN_PROD', expiresAt: daysAhead(60) },
    actualizadoEn: now,
    nota: 'Documento demo — en producción solo escribe Cloud Functions',
  });
  console.log('✓ tokens_redes (demo)');

  console.log('\n─── Listo ───');
  console.log('UID demo:', DEMO_UID);
  console.log('Login emulador:', DEMO_EMAIL, '/', DEMO_PASSWORD);
  console.log('UI emulador: http://127.0.0.1:4000/firestore');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
