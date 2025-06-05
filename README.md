ConfiAbleEmpress
Descripción del Proyecto
ConfiAbleEmpress es una plataforma web estática diseñada para proporcionar un servicio de validación visual a negocios. Su objetivo principal es realzar la credibilidad y visibilidad de empresas que demuestran un compromiso con la transparencia, ofreciéndoles un "sello de verificación" y un certificado digital. El sitio incluye una página de inicio informativa, un generador de certificados protegido por contraseña, y páginas dedicadas a la política de privacidad, términos de uso, política de cookies y un desglose de las medidas de seguridad implementadas.

Este proyecto es una herramienta de marketing que permite a los negocios destacar su confiabilidad a través de una validación visual simple y accesible, sin la necesidad de una gestión de datos compleja del usuario.

Características
Página de Inicio: Presenta la misión de ConfiAbleEmpress, cómo funciona el servicio de validación y elementos clave de confianza.

Generador de Certificados: Una herramienta para administradores protegida por contraseña que permite generar certificados de validación para empresas.

Páginas de Políticas:

Términos de Uso y Política de Validación: Detalla la naturaleza del servicio, las limitaciones de responsabilidad y la relación con las empresas.

Política de Privacidad: Explica que el sitio web es estático y no recopila datos personales, enfocándose en la privacidad del usuario.

Política de Cookies: Describe el uso de cookies y cómo los usuarios pueden gestionarlas.

Seguridad Total: Una página que detalla las medidas de seguridad implementadas en el sitio web para proteger a los usuarios.

Diseño Responsivo: Adaptado para una visualización óptima en dispositivos de diferentes tamaños (móviles, tabletas, ordenadores).

CSS Modularizado: Estilos organizados en archivos separados para mejorar la mantenibilidad y la eficiencia.

Content Security Policy (CSP): Implementación de una política de seguridad de contenido para mitigar ataques comunes como XSS.

Animaciones sutiles: Mejoras visuales en la página de inicio para una experiencia de usuario más dinámica.

Pie de Página Consistente: Un footer uniforme en todas las páginas con enlaces a las políticas y aviso legal.

Tecnologías Utilizadas
HTML5: Estructura de las páginas web.

CSS3: Estilos y diseño responsivo.

Google Fonts: Para fuentes personalizadas (Inter, Playfair Display).

Font Awesome: Para iconos escalables.

JavaScript (Vainilla): Para la lógica del generador de certificados y las simulaciones en la página de validación (generate.js, qrcode.js).

jspdf: Librería JavaScript para generar PDFs (utilizada en generate.js).

html2canvas: Librería JavaScript para tomar capturas de pantalla de elementos HTML y convertirlos en imágenes (utilizada en generate.js).

qrcode-generator: Librería JavaScript para generar códigos QR.

Configuración y Ejecución
Para configurar y ejecutar este proyecto localmente, sigue estos pasos:

Clona el Repositorio (si aplica):

git clone <URL_DEL_REPOSITORIO>
cd confiablempress

(Si no hay un repositorio, simplemente descarga los archivos del proyecto).

Estructura de Archivos: Asegúrate de que tus archivos estén organizados de la siguiente manera:

confiablempress/
├── index.html
├── admin-generador.html
├── form.html
├── TÉRMINOS DE USO Y POLÍTICA.html
├── politica-privacidad.html
├── politica-de-cookies.html
├── seguridad-total.html
├── certificados/
│   └── empresa123.html
├── assets/
│   ├── logo.png
│   ├── estiloglobales.css
│   ├── homeindex.css
│   ├── admin.css
│   ├── politicas.css
│   ├── seguridad.css
│   └── certificadofinal.css
└── js/
    ├── generate.js
    └── qrcode.js (si lo gestionas localmente, aunque el CDN es preferible)

Abrir en el Navegador: Simplemente abre el archivo index.html en tu navegador web. Al ser un sitio estático, no necesitas un servidor web.

# En la terminal, navega a la carpeta raíz del proyecto y luego:
open index.html # En macOS
start index.html # En Windows
xdg-open index.html # En Linux (puede variar)

Uso
Para Usuarios Finales
Simplemente navega por el sitio web para conocer el servicio de ConfiAbleEmpress y ver los certificados de las empresas listadas (por ejemplo, certificados/empresa123.html).

Para Administradores (Generador de Certificados)
Accede a admin-generador.html.

Introduce la contraseña de administrador (la contraseña por defecto en el código es Chino262. Es altamente recomendable cambiar esta contraseña por una más segura en admin-generador.html antes de cualquier despliegue).

Una vez dentro, podrás rellenar los datos de la empresa y generar un certificado HTML que se puede guardar o visualizar. Este certificado se puede compartir para validación visual.

Estructura del Proyecto
index.html: Página principal del sitio.

admin-generador.html: Página para el generador de certificados (acceso restringido).

form.html: Página para la generación de certificados.

TÉRMINOS DE USO Y POLÍTICA.html: Términos legales del servicio.

politica-privacidad.html: Política de privacidad.

politica-de-cookies.html: Política de cookies.

seguridad-total.html: Página dedicada a las medidas de seguridad del sitio.

certificados/: Carpeta que contiene los certificados de ejemplo generados (ej. empresa123.html).

assets/: Contiene recursos como imágenes (logo.png) y archivos CSS.

estiloglobales.css: Estilos CSS aplicables a todo el sitio (variables, reseteo, estilos base).

homeindex.css: Estilos específicos para la página index.html.

admin.css: Estilos específicos para la página admin-generador.html.

politicas.css: Estilos comunes para las páginas de políticas (TÉRMINOS DE USO Y POLÍTICA.html, politica-privacidad.html, politica-de-cookies.html).

seguridad.css: Estilos específicos para la página seguridad-total.html.

certificadofinal.css: Estilos específicos para las páginas de certificados generados (ej. empresa123.html).

js/: Contiene archivos JavaScript.

generate.js: Lógica principal para la generación de certificados (QR, PDF, HTML).

qrcode.js: Librería QR (puede ser reemplazada por CDN).

Contribución
Dado que este es un proyecto de demostración, no se esperan contribuciones directas en este momento. Sin embargo, si encuentras errores o tienes sugerencias de mejora, puedes contactar al desarrollador.

Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE (si existe) para más detalles.

Contacto
Para cualquier pregunta o comentario, puedes contactar al desarrollador a través de:

chinooficial262@gmail.com