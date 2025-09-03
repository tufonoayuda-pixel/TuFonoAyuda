
export default function TermsPage() {
    return (
      <div className="space-y-6">
        <h1>Términos y Condiciones de Uso</h1>
  
        <p>
          <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
  
        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al registrarse y utilizar la plataforma TuFonoAyuda (en adelante, "la Plataforma"), usted (en adelante, "el Usuario") acepta y se compromete a cumplir con los presentes Términos y Condiciones de Uso, así como con nuestra Política de Privacidad. Si no está de acuerdo con alguno de estos términos, no deberá utilizar la Plataforma.
        </p>
  
        <h2>2. Descripción del Servicio</h2>
        <p>
          TuFonoAyuda es una herramienta de software como servicio (SaaS) diseñada para profesionales de la fonoaudiología, que ofrece funcionalidades para la gestión de pacientes, planificación de sesiones, generación de actividades con inteligencia artificial y análisis de voz, entre otras.
        </p>
  
        <h2>3. Uso de la Cuenta</h2>
        <ul>
          <li>El Usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran en su cuenta.</li>
          <li>El Usuario se compromete a notificar inmediatamente a TuFonoAyuda sobre cualquier uso no autorizado de su cuenta.</li>
          <li>Cada cuenta es personal e intransferible. El acceso está restringido al profesional fonoaudiólogo que se registra.</li>
        </ul>
  
        <h2>4. Propiedad y Privacidad de los Datos</h2>
        <ul>
          <li>
            <strong>Exclusividad de los Datos:</strong> Todos los datos, informes, notas y archivos que el Usuario suba o genere en la Plataforma son de su exclusiva propiedad y responsabilidad. TuFonoAyuda no reclama ningún derecho de propiedad sobre la información de sus pacientes.
          </li>
          <li>
            <strong>Aislamiento de Datos (Data Tenancy):</strong> La arquitectura de la Plataforma está diseñada para garantizar un estricto aislamiento de los datos entre los diferentes usuarios. La información de un profesional no es accesible para ningún otro bajo ninguna circustancia.
          </li>
          <li>
            <strong>Confidencialidad:</strong> TuFonoAyuda se compromete a no acceder, compartir ni utilizar los datos de los pacientes para ningún fin que no sea el estricto funcionamiento, mantenimiento y mejora de la Plataforma, siempre de forma anonimizada y agregada cuando sea posible.
          </li>
        </ul>
  
        <h2>5. Uso de Funciones de Inteligencia Artificial</h2>
        <p>
          La Plataforma utiliza modelos de inteligencia artificial (IA) para generar contenido, como planes de actividades o resúmenes de informes. El Usuario entiende y acepta que:
        </p>
        <ul>
          <li>
            La IA es una herramienta de apoyo y no reemplaza el juicio clínico profesional.
          </li>
          <li>
            El Usuario es el único responsable de revisar, validar y adaptar cualquier contenido generado por la IA antes de utilizarlo en su práctica clínica.
          </li>
          <li>
            TuFonoAyuda no se hace responsable de la precisión o idoneidad clínica del contenido generado por la IA.
          </li>
        </ul>
  
        <h2>6. Limitación de Responsabilidad</h2>
        <p>
          El Usuario utiliza la Plataforma bajo su propio riesgo. TuFonoAyuda no será responsable por daños directos o indirectos, incluyendo, pero no limitándose a, pérdida de datos, interrupción del negocio o cualquier otro perjuicio derivado del uso o la incapacidad de usar la Plataforma.
        </p>
  
        <h2>7. Modificaciones de los Términos</h2>
        <p>
          TuFonoAyuda se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Se notificará a los usuarios sobre cambios significativos. El uso continuado de la Plataforma después de dichas modificaciones constituirá la aceptación de los nuevos términos.
        </p>
      </div>
    );
  }
  