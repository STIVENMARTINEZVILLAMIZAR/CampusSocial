import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { CampusSocialLogo } from '../components/CampusSocialLogo';

const CONTACT_EMAIL = 'stivenmartinezvillamizar@gmail.com';
const LAST_UPDATED = '28 de mayo de 2026';

/**
 * Política de privacidad pública (requerida por LinkedIn Developers y Meta for Developers).
 * URL recomendada: https://campussocial-f56a0.web.app/privacidad
 */
export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <CampusSocialLogo size="sm" textClassName="!text-foreground !bg-none" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#667eea] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 prose prose-slate prose-headings:text-slate-900">
        <h1 className="text-3xl font-bold mb-2">Política de privacidad</h1>
        <p className="text-sm text-slate-500 not-prose mb-8">Última actualización: {LAST_UPDATED}</p>

        <section className="space-y-4 text-[15px] leading-relaxed">
          <p>
            Esta política describe cómo <strong>CampusSocial</strong> (producto de{' '}
            <strong>Campuslands — Educación Tecnológica</strong>, Colombia) recopila, usa y protege
            los datos personales cuando utilizas nuestra plataforma de automatización de publicaciones
            en redes sociales.
          </p>

          <h2 className="text-xl font-semibold mt-8">1. Responsable del tratamiento</h2>
          <p>
            Campuslands / CampusSocial
            <br />
            Contacto:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#667eea]">
              {CONTACT_EMAIL}
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-8">2. Datos que recopilamos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Cuenta:</strong> correo electrónico, nombre y identificador de usuario (Firebase
              Authentication).
            </li>
            <li>
              <strong>Contenido:</strong> textos, imágenes y borradores de publicaciones que creas o
              programas en la aplicación.
            </li>
            <li>
              <strong>Redes sociales (con tu consentimiento):</strong> tokens de acceso OAuth,
              identificador de perfil, nombre visible y permisos necesarios para publicar en LinkedIn,
              Meta (Facebook/Instagram) u otras redes que conectes.
            </li>
            <li>
              <strong>Técnico:</strong> registros de uso, identificadores de sesión y metadatos de
              ejecución de automatizaciones (webhooks n8n/Make).
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">3. Finalidad del tratamiento</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Autenticarte y mantener tu sesión segura.</li>
            <li>Generar y editar contenido con asistentes de inteligencia artificial.</li>
            <li>Programar y publicar en las redes que autorices.</li>
            <li>Verificar el estado de conexión de tus canales.</li>
            <li>Mejorar el servicio y resolver incidencias técnicas.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">4. Base legal</h2>
          <p>
            El tratamiento se basa en la ejecución del contrato de uso del servicio, tu consentimiento
            explícito al conectar una red social (OAuth) y, cuando aplique, el interés legítimo en
            seguridad y mejora del producto.
          </p>

          <h2 className="text-xl font-semibold mt-8">5. Servicios de terceros</h2>
          <p>Podemos compartir datos limitados con proveedores que nos ayudan a operar CampusSocial:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Google Firebase</strong> (autenticación, base de datos, almacenamiento, funciones
              en la nube).
            </li>
            <li>
              <strong>Google Gemini</strong> (generación de texto e imágenes, solo el contenido que
              envías al asistente).
            </li>
            <li>
              <strong>LinkedIn</strong> y <strong>Meta</strong> (cuando conectas esas cuentas para
              publicar).
            </li>
            <li>
              <strong>n8n / Make / Postiz</strong> (orquestación opcional de publicaciones, si las
              configuras).
            </li>
          </ul>
          <p>
            Estos proveedores procesan datos según sus propias políticas. Los tokens de redes sociales se
            almacenan en Firestore con acceso restringido exclusivamente a nuestro backend (Cloud
            Functions); la aplicación cliente no puede leerlos.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Conservación</h2>
          <p>
            Conservamos tus datos mientras mantengas una cuenta activa. Los tokens OAuth se eliminan o
            invalidan cuando desconectas un canal o revocas el acceso en LinkedIn/Meta. Puedes solicitar
            la eliminación de tu cuenta y datos asociados contactándonos.
          </p>

          <h2 className="text-xl font-semibold mt-8">7. Tus derechos</h2>
          <p>De acuerdo con la normativa aplicable en Colombia, puedes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acceder, rectificar o suprimir tus datos personales.</li>
            <li>Revocar el consentimiento de una red social desde la app (Canales → Desconectar) o desde la configuración de LinkedIn/Meta.</li>
            <li>Oponerte a tratamientos no esenciales o solicitar limitación del tratamiento.</li>
          </ul>
          <p>
            Para ejercer estos derechos, escribe a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#667eea]">
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8">8. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas razonables: HTTPS, reglas de seguridad en
            Firestore, secretos en servidor y principio de mínimo privilegio en tokens de API.
          </p>

          <h2 className="text-xl font-semibold mt-8">9. Menores de edad</h2>
          <p>
            CampusSocial está dirigido a organizaciones y profesionales. No recopilamos datos de menores
            de 18 años de forma intencionada.
          </p>

          <h2 className="text-xl font-semibold mt-8">10. Cambios</h2>
          <p>
            Podemos actualizar esta política. Publicaremos la versión vigente en esta misma URL con la
            fecha de revisión.
          </p>
        </section>
      </main>

      <footer className="border-t bg-white mt-12">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-slate-500">
          © 2026 Campuslands — Educación Tecnológica Colombia · CampusSocial
        </div>
      </footer>
    </div>
  );
}
