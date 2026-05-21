/**
 * Documento de referencia en Firestore (colección _meta).
 * Ejecutar una vez contra emulador o nube:
 *   node scripts/init-colecciones-firestore.mjs
 *   node scripts/init-colecciones-firestore.mjs --production
 */
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(__dirname, '../Backend/package.json'));
const admin = require('firebase-admin');

const PROJECT_ID = 'campussocial-f56a0';
const useProduction = process.argv.includes('--production');

if (!useProduction) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.GCLOUD_PROJECT = PROJECT_ID;
}

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();

const ESQUEMA = {
  version: 1,
  proyecto: PROJECT_ID,
  colecciones: [
    'usuarios',
    'publicaciones',
    'borradores',
    'canales',
    'configuracion',
    'actividad',
    'ejecuciones_n8n',
    'chats/{uid}/mensajes',
    'tokens_redes',
  ],
  descripcion:
    'Motor CampusSocial. Cada usuario nuevo recibe usuarios, canales, configuracion y actividad al registrarse.',
  actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
};

async function main() {
  await db.collection('_meta').doc('esquema').set(ESQUEMA, { merge: true });
  console.log('✓ _meta/esquema — referencia de colecciones guardada');
  console.log('Colecciones:', ESQUEMA.colecciones.join(', '));
  if (!useProduction) {
    console.log('\n(Emulador) Abre http://127.0.0.1:4000/firestore');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
