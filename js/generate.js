document.addEventListener('DOMContentLoaded', () => {
    console.log("generate.js: DOM completamente cargado. Inicializando lógica de generación de certificados.");

    // Define una URL base para los assets dentro del certificado generado.
    // Esto usará 'http://localhost:XXXX' si estás en un servidor local, o 'file:///' si abres el archivo directamente.
    // Para despliegue real, asegúrate de que tus assets sean accesibles desde esta URL base.
    const BASE_URL = window.location.origin; 
    console.log("generate.js: BASE_URL detectada:", BASE_URL);

    // === Referencias a elementos del DOM ===
    const form = document.getElementById('certificateGeneratorForm');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const generatedContent = document.getElementById('generatedContent');
    const downloadPdfLink = document.getElementById('downloadPdfLink');
    const viewCertificateLink = document.getElementById('viewCertificateLink');
    const downloadHtmlLink = document.getElementById('download-html');

    // === Función para escapar caracteres HTML y prevenir XSS ===
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // === Función para generar el HTML completo del certificado ===
    function generateCertificateHtml(companyName, option, registrationDate, companySignature) {
        let starsHtml = '';
        let starCount = 0;
        let optionText = '';
        let validityMonths = 0;

        switch (option) {
            case 'A':
                starCount = 3;
                starsHtml = '<span class="star">&#9733;</span><span class="star">&#9733;</span><span class="star">&#9733;</span><span class="star empty">&#9734;</span><span class="star empty">&#9734;</span>';
                optionText = 'Opción A';
                validityMonths = 9;
                break;
            case 'B':
                starCount = 2;
                starsHtml = '<span class="star">&#9733;</span><span class="star">&#9733;</span><span class="star empty">&#9734;</span><span class="star empty">&#9734;</span><span class="star empty">&#9734;</span>';
                optionText = 'Opción B';
                validityMonths = 5;
                break;
            case 'C':
                starCount = 1;
                starsHtml = '<span class="star">&#9733;</span><span class="star empty">&#9734;</span><span class="star empty">&#9734;</span><span class="star empty">&#9734;</span><span class="star empty">&#9734;</span>';
                optionText = 'Opción C';
                validityMonths = 2;
                break;
        }

        const regDate = new Date(registrationDate);
        const expirationDate = new Date(regDate);
        expirationDate.setMonth(expirationDate.getMonth() + validityMonths);
        // Ajuste para evitar que el día se desborde al mes siguiente
        if (expirationDate.getDate() !== regDate.getDate()) {
            expirationDate.setDate(0); 
        }

        const formattedRegDate = regDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const formattedExpDate = expirationDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

        const validationPageSlug = escapeHtml(companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
        const qr = qrcode(0, 'L');
        const validationUrl = `${BASE_URL}/certificados/${validationPageSlug}.html`; // URL de ejemplo para el QR
        qr.addData(validationUrl);
        qr.make();
        const qrCodeDataURL = qr.createDataURL(6); // Escala 6, devuelve como Data URL

        // NOTA: Para las rutas de los assets, usamos ${BASE_URL} para que funcionen tanto localmente (con un servidor) como en despliegue.
        // Asegúrate de que los archivos 'estiloglobales.css', 'certificate-styles.css', 'logo.png', 'firma-placeholder.png', 'sello-placeholder.png', 'certificate-logic.js'
        // estén en sus respectivas carpetas 'assets/' o 'js/' y sean accesibles desde la BASE_URL.

        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validación de ${escapeHtml(companyName)} - ConfiAbleEmpress</title>
  <!-- Enlace a la hoja de estilos principal (globales) -->
  <link rel="stylesheet" href="${BASE_URL}/assets/estiloglobales.css">
  <!-- Enlace a la hoja de estilos específica para certificados -->
  <link rel="stylesheet" href="${BASE_URL}/assets/certificate-styles.css">
  <!-- Icono de la página (favicon) -->
  <link rel="icon" href="${BASE_URL}/assets/logo.png" type="image/png">
  <!-- Enlace a Font Awesome para iconos -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <!-- La Política de Seguridad de Contenido (CSP) se ha eliminado de aquí para simplificar y alinear con la generación de HTML. -->
</head>
<body>
    <header>
        <div class="header-content">
            <a href="${BASE_URL}/index.html" class="logo">
                <img src="${BASE_URL}/assets/logo.png" alt="Logo de ConfiAbleEmpress" class="logo-img">
                <h1>ConfiAbleEmpress</h1>
            </a>
        </div>
    </header>

    <main>
        <section class="validation-page-container">
            <div class="validation-header">
                <h1>Validación de Confiabilidad <span class="verification-seal">&#10003;</span></h1>
                <p>ConfiAbleEmpress se enorgullece en presentar este certificado, el cual valida y confirma el compromiso inquebrantable de la empresa con la transparencia, la excelencia y la confianza en su sector. Representa un testimonio de su dedicación a la calidad y la satisfacción del cliente.</p>
            </div>

            <div class="company-details" data-star-count="${starCount}">
                <h2>${escapeHtml(companyName)}</h2>
                <div class="star-rating-large">
                    ${starsHtml}
                </div>
                <p class="star-explanation">
                    Esta calificación de ${starCount} estrellas refleja un alto nivel de confianza, alcanzado gracias a la retroalimentación positiva de numerosos clientes satisfechos y el cumplimiento de nuestros rigurosos estándares de validación.
                </p>
            </div>

            <div class="certificate-display-area">
                <div class="certificate-background-image"></div>
                <div class="certificate-text-overlay">
                    <p style="font-size: 1.1rem; color: var(--primary-color); margin-bottom: 20px; text-align: center;">
                        Este documento oficial certifica con la máxima distinción que <strong>${escapeHtml(companyName)}</strong> ha sido rigurosamente verificada por <strong>ConfiAbleEmpress</strong>.
                        Su compromiso con la excelencia y la integridad ha sido reconocido bajo la <strong>${optionText}</strong>, otorgándole una prestigiosa calificación de <strong>${starCount} estrellas</strong>.
                        Esta validación se basa en la adhesión a nuestros estrictos estándares de confiabilidad y la positiva retroalimentación de su valiosa clientela.
                    </p>
                    <p class="validation-info" style="margin-bottom: 30px;">
                        <small><strong>Fecha de Validación:</strong> ${formattedRegDate}</small><br>
                        <small><strong>Válido Hasta:</strong> ${formattedExpDate} (${validityMonths} meses)</small>
                    </p>

                    <div style="text-align: center; margin: 20px 0;">
                        <img src="${BASE_URL}/assets/firma-placeholder.png" alt="Firma Oficial" style="height: 60px; margin-right: 20px;">
                        <img src="${BASE_URL}/assets/sello-placeholder.png" alt="Sello Oficial" style="height: 80px;">
                    </div>

                    <div id="qrcode" style="text-align: center; margin-top: 20px;">
                        <img src="${qrCodeDataURL}" alt="Código QR de Verificación" style="width: 120px; height: 120px; border: 1px solid #eee; padding: 5px; border-radius: 5px;">
                    </div>
                </div>
            </div>

            <div class="trust-bar-container">
                <div class="trust-bar" style="width: ${(starCount / 5) * 100}%;"></div>
                <div class="trust-segment segment-1" data-stars="1" data-comment="Nivel de confianza muy bajo."></div>
                <div class="trust-segment segment-2" data-stars="2" data-comment="Nivel de confianza bajo."></div>
                <div class="trust-segment segment-3" data-stars="3" data-comment="Nivel de confianza medio."></div>
                <div class="trust-segment segment-4" data-stars="4" data-comment="Nivel de confianza alto."></div>
                <div class="trust-segment segment-5" data-stars="5" data-comment="¡Máxima confianza! Empresa verificada con excelencia."></div>

                <div class="trust-marker" style="left: ${(starCount / 5) * 100}%;"></div>
                <span class="trust-percentage-text" style="left: ${(starCount / 5) * 100}%;">${(starCount / 5) * 100}%</span>

                <div class="trust-tooltip">
                    <span class="tooltip-stars"></span>
                    <span class="tooltip-comment"></span>
                </div>

                <span class="trust-level-label low">Bajo</span>
                <span class="trust-level-label medium">Medio</span>
                <span class="trust-level-label high">Alto</span>
            </div>
            <p style="font-size: 0.9rem; color: #777;">El nivel de confianza se basa en la validación de ConfiAbleEmpress.</p>

            <section class="community-section-wrapper">
                <div class="comments-and-info-container">
                    <div class="comments-section">
                        <h3>Comentarios de Clientes</h3>
                        <p class="explanation">Se muestran los 3 comentarios más destacados.</p>
                        <div id="simulated-comments">
                            <!-- Comentarios se cargarán aquí dinámicamente desde certificate-logic.js -->
                        </div>
                        <button id="viewAllCommentsBtn" class="dialog-close-btn" style="margin-top: 15px;">Ver Todos los Comentarios</button>

                        <div class="fake-comment-form">
                            <h4>Deja tu Comentario</h4>
                            <p style="font-size: 0.85rem; color: #777; margin-bottom: 15px;">
                                Para mantener la privacidad, solo necesitamos tu nombre. No guardamos ningún dato personal.
                            </p>
                            <div class="name-input-group">
                                <input type="text" id="fakeCommentName" placeholder="Tu Nombre" required>
                            </div>
                            <div class="avatar-selection-container">
                                <img src="https://placehold.co/50x50/FF6347/FFFFFF?text=A" class="selectable-avatar selected" data-avatar-id="0" alt="Avatar 1">
                                <img src="https://placehold.co/50x50/4682B4/FFFFFF?text=B" class="selectable-avatar" data-avatar-id="1" alt="Avatar 2">
                                <img src="https://placehold.co/50x50/32CD32/FFFFFF?text=C" class="selectable-avatar" data-avatar-id="2" alt="Avatar 3">
                                <img src="https://placehold.co/50x50/DA70D6/FFFFFF?text=D" class="selectable-avatar" data-avatar-id="3" alt="Avatar 4">
                                <img src="https://placehold.co/50x50/FFD700/000000?text=E" class="selectable-avatar" data-avatar-id="4" alt="Avatar 5">
                            </div>
                            <textarea id="fakeCommentText" placeholder="Escribe tu comentario aquí"></textarea>
                            <button id="submitFakeComment">Enviar Comentario</button>
                            <p id="fakeMessage" class="fake-message" style="display: none;"></p>
                        </div>
                    </div>

                    <div class="comments-info-sidebar">
                        <h4>¡Valoramos tu Opinión!</h4>
                        <p>En ConfiAbleEmpress, cada comentario es un pilar fundamental para construir una comunidad sólida y transparente. Agradecemos enormemente tu participación, ya que nos ayuda a mantener un estándar de excelencia y a asegurar que solo las empresas más confiables destaquen en nuestra plataforma.</p>
                        <p>Tu experiencia es invaluable. Al compartirla, no solo contribuyes a la mejora continua de las empresas validadas, sino que también guías a otros clientes en sus decisiones de compra, fomentando un entorno de confianza mutua.</p>
                        <p>¡Gracias por ser parte de ConfiAbleEmpress! Juntos, construimos un futuro donde la confianza es el sello de cada negocio.</p>
                    </div>
                </div>
            </section>

            <a href="${BASE_URL}/index.html" class="back-to-home">Volver a la Página Principal</a>

            <div class="validation-footer">
                <img src="${BASE_URL}/assets/sello-placeholder.png" alt="Sello ConfiAbleEmpress" style="height: 60px; opacity: 0.7; margin-bottom: 10px;">
                <p>&copy; 2025 ConfiAbleEmpress. Todos los derechos reservados.</p>
                <p class="legal-notice-p">Aviso Legal: La validación mostrada es para ayudar en la confianza de empresas nuevas y generada con base en los datos proporcionados por el mismo interesado. ConfiAbleEmpress no se hace responsable por los servicios prestados por las empresas listadas. Se recomienda a los usuarios ejercer su propio juicio.</p>
            </div>
        </section>
    </main>

    <!-- Diálogo de privacidad para la imagen de perfil -->
    <div id="privacyDialog" class="dialog-overlay">
        <div class="dialog-content">
            <h4>Privacidad de la Imagen de Perfil</h4>
            <p>Para proteger tu privacidad, ConfiAbleEmpress no guarda ninguna imagen de perfil personal. Al seleccionar un avatar, se utilizará una imagen genérica que no está asociada a tu identidad.</p>
            <button class="dialog-close-btn">Entendido</button>
        </div>
    </div>

    <!-- Diálogo para pedir el nombre antes de dar like -->
    <div id="nameRequiredDialog" class="dialog-overlay">
        <div class="dialog-content">
            <h4>¡Atención!</h4>
            <p>Para interactuar con los comentarios (dar "Me gusta" o enviar uno), por favor, ingresa tu nombre en el campo correspondiente.</p>
            <button class="dialog-close-btn">Entendido</button>
        </div>
    </div>

    <!-- Modal para ver todos los comentarios -->
    <div id="allCommentsModal" class="dialog-overlay">
        <div class="dialog-content">
            <h4>Todos los Comentarios de Clientes</h4>
            <div id="modal-comments-container">
                <!-- Comentarios se cargarán aquí -->
            </div>
            <button class="dialog-close-btn" id="closeAllCommentsModal">Cerrar</button>
        </div>
    </div>

    <!-- Script JavaScript específico para certificados (debe estar en el mismo lugar que el certificate-logic.js) -->
    <script src="${BASE_URL}/js/certificate-logic.js"></script>
</body>
</html>
`;
    }

    // === Funciones de Utilidad para la Interfaz de Usuario ===
    function showMessage(message, type) {
        messageText.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'flex';
    }

    // === Manejo del Envío del Formulario ===
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("generate.js: Formulario enviado. Iniciando generación.");

        loadingIndicator.style.display = 'flex';
        messageBox.style.display = 'none';
        generatedContent.style.display = 'none';

        const companyName = document.getElementById('companyName').value;
        const option = document.getElementById('option').value;
        const registrationDate = document.getElementById('registrationDate').value;
        const companySignature = document.getElementById('companySignature').value;

        if (!companyName || !option || !registrationDate) {
            showMessage('Por favor, completa todos los campos obligatorios.', 'error');
            loadingIndicator.style.display = 'none';
            return;
        }

        try {
            console.log("generate.js: Generando HTML del certificado...");
            const certificateHtml = generateCertificateHtml(companyName, option, registrationDate, companySignature);
            console.log("generate.js: HTML del certificado generado.");

            const validationPageSlug = escapeHtml(companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));

            const htmlBlob = new Blob([certificateHtml], { type: 'text/html' });
            const htmlUrl = URL.createObjectURL(htmlBlob);
            console.log("generate.js: Blob HTML creado y URL obtenida.");

            viewCertificateLink.href = htmlUrl;
            downloadHtmlLink.href = htmlUrl;
            downloadHtmlLink.download = `certificado_${validationPageSlug}.html`;

            // Para la generación de PDF, se necesita renderizar el HTML en el DOM temporalmente.
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '1200px'; // Un ancho generoso para la captura.
            tempDiv.style.height = 'auto'; // Altura automática
            tempDiv.innerHTML = certificateHtml;
            document.body.appendChild(tempDiv);
            console.log("generate.js: Elemento temporal añadido al DOM para html2canvas.");

            // Espera a que los enlaces de estilos y scripts dentro de tempDiv se carguen
            console.log("generate.js: Esperando la carga de CSS y JS en el elemento temporal...");
            const linkPromises = Array.from(tempDiv.querySelectorAll('link[rel="stylesheet"]'))
                .map(link => new Promise(resolve => {
                    link.onload = resolve;
                    link.onerror = (e) => {
                        console.error(`Error al cargar CSS: ${link.href}`, e);
                        resolve(); // Resolver para no bloquear si hay un error
                    };
                }));
            const scriptPromises = Array.from(tempDiv.querySelectorAll('script'))
                .map(script => new Promise(resolve => {
                    if (!script.src) {
                        resolve();
                        return;
                    }
                    script.onload = resolve;
                    script.onerror = (e) => {
                        console.error(`Error al cargar JS: ${script.src}`, e);
                        resolve(); // Resolver para no bloquear si hay un error
                    };
                }));

            // Espera por todas las cargas (CSS y JS) y un pequeño tiempo adicional.
            await Promise.all([...linkPromises, ...scriptPromises]);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera un poco más para asegurar el renderizado
            console.log("generate.js: CSS y JS del certificado cargados y renderizado inicial esperado.");

            // Utiliza html2canvas para capturar el contenido del div temporal como una imagen.
            console.log("generate.js: Iniciando captura con html2canvas...");
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                ignoreElements: (element) => {
                    return (element.id === 'privacyDialog' || element.id === 'nameRequiredDialog' || element.id === 'allCommentsModal');
                }
            });
            console.log("generate.js: html2canvas completado. Canvas generado.");

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // Ancho A4 en mm.
            const pageHeight = 297; // Alto A4 en mm.
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            downloadPdfLink.href = pdf.output('datauristring');
            downloadPdfLink.download = `certificado_${validationPageSlug}.pdf`;
            console.log("generate.js: PDF generado y enlace de descarga actualizado.");

            document.body.removeChild(tempDiv);
            console.log("generate.js: Elemento temporal eliminado del DOM.");

            showMessage('Certificado generado con éxito. Puedes descargarlo o verlo.', 'success');
            generatedContent.style.display = 'block';
            console.log("generate.js: Proceso de generación finalizado con éxito.");

        } catch (error) {
            console.error('generate.js: Error crítico al generar el certificado:', error);
            showMessage('Ocurrió un error inesperado al generar el certificado. Consulta la consola para más detalles.', 'error');
            // Asegura que el elemento temporal sea eliminado si existe y se produce un error.
            if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
            }
        } finally {
            loadingIndicator.style.display = 'none';
            console.log("generate.js: Indicador de carga oculto.");
        }
    });
});
