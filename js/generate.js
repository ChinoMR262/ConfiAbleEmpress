document.addEventListener('DOMContentLoaded', () => {
    console.log("generate.js: DOM completamente cargado. Inicializando lógica de generación de certificados.");

    // Define una URL base para los assets dentro del certificado generado.
    // Esto es crucial para que las rutas relativas (CSS, imágenes, scripts) funcionen correctamente
    // tanto si el proyecto está alojado en un servidor local (como localhost) como si lo subes a GitHub Pages
    // (donde la URL incluirá el nombre del repositorio).
    // IMPORTANTE: Cambia '/ConfiAbleEmpress' por el nombre exacto de tu repositorio de GitHub si es diferente.
    const REPO_NAME = '/ConfiAbleEmpress'; 
    const BASE_URL = window.location.origin + (window.location.pathname.includes(REPO_NAME) ? REPO_NAME : '');

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

        // Determine star count, option text, and validity based on selected option
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

        // Calculate registration and expiration dates
        const regDate = new Date(registrationDate);
        const expirationDate = new Date(regDate);
        expirationDate.setMonth(expirationDate.getMonth() + validityMonths);
        // Adjust for month-end issues (e.g., Jan 31 + 1 month = Feb 28/29, not Mar 3)
        if (expirationDate.getDate() !== regDate.getDate()) {
            expirationDate.setDate(0); 
        }

        const formattedRegDate = regDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const formattedExpDate = expirationDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

        // Generate a URL-friendly slug for the company name
        const validationPageSlug = escapeHtml(companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
        
        // Generate QR code
        const qr = qrcode(0, 'L');
        // The validation URL points to the generated HTML page for this certificate
        const validationUrl = `${BASE_URL}/certificados/${validationPageSlug}.html`; 
        qr.addData(validationUrl);
        qr.make();
        const qrCodeDataURL = qr.createDataURL(6); // Scale 6, returns as Data URL

        // Construct the full HTML for the certificate page
        // All asset paths now use BASE_URL for correct loading in all environments.
        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validación de ${escapeHtml(companyName)} - ConfiAbleEmpress</title>
  <!-- Link to global styles -->
  <link rel="stylesheet" href="${BASE_URL}/assets/estiloglobales.css">
  <!-- Link to certificate-specific styles -->
  <link rel="stylesheet" href="${BASE_URL}/assets/certificate-styles.css">
  <!-- Page favicon -->
  <link rel="icon" href="${BASE_URL}/assets/logo.png" type="image/png">
  <!-- Link to Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
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
                            <!-- Comments will be loaded here dynamically from certificate-logic.js -->
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
                                <!-- Avatar images should be replaced with local paths in certificate-logic.js as well -->
                                <img src="${BASE_URL}/assets/avatars/avatar-a.png" class="selectable-avatar selected" data-avatar-id="0" alt="Avatar 1">
                                <img src="${BASE_URL}/assets/avatars/avatar-b.png" class="selectable-avatar" data-avatar-id="1" alt="Avatar 2">
                                <img src="${BASE_URL}/assets/avatars/avatar-c.png" class="selectable-avatar" data-avatar-id="2" alt="Avatar 3">
                                <img src="${BASE_URL}/assets/avatars/avatar-d.png" class="selectable-avatar" data-avatar-id="3" alt="Avatar 4">
                                <img src="${BASE_URL}/assets/avatars/avatar-e.png" class="selectable-avatar" data-avatar-id="4" alt="Avatar 5">
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

    <!-- Privacy dialog for profile image -->
    <div id="privacyDialog" class="dialog-overlay">
        <div class="dialog-content">
            <h4>Privacidad de la Imagen de Perfil</h4>
            <p>Para proteger tu privacidad, ConfiAbleEmpress no guarda ninguna imagen de perfil personal. Al seleccionar un avatar, se utilizará una imagen genérica que no está asociada a tu identidad.</p>
            <button class="dialog-close-btn">Entendido</button>
        </div>
    </div>

    <!-- Dialog to ask for name before liking -->
    <div id="nameRequiredDialog" class="dialog-overlay">
        <div class="dialog-content">
            <h4>¡Atención!</h4>
            <p>Para interactuar con los comentarios (dar "Me gusta" o enviar uno), por favor, ingresa tu nombre en el campo correspondiente.</p>
            <button class="dialog-close-btn">Entendido</button>
        </div>
    </div>

    <!-- Modal to view all comments -->
    <div id="allCommentsModal" class="dialog-overlay">
        <div class="dialog-content">
            <h4>Todos los Comentarios de Clientes</h4>
            <div id="modal-comments-container">
                <!-- Comments will be loaded here -->
            </div>
            <button class="dialog-close-btn" id="closeAllCommentsModal">Cerrar</button>
        </div>
    </div>

    <!-- Certificate-specific JavaScript (should be in the same location as certificate-logic.js) -->
    <script src="${BASE_URL}/js/certificate-logic.js"></script>
</body>
</html>
`;
    }

    // === Utility Functions for User Interface ===
    function showMessage(message, type) {
        messageText.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'flex';
    }

    // === Handle Form Submission ===
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

            // For PDF generation, the HTML needs to be rendered in the DOM temporarily.
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px'; // Position off-screen
            tempDiv.style.width = '1200px'; // A generous width for capture.
            tempDiv.style.height = 'auto'; // Automatic height
            tempDiv.innerHTML = certificateHtml;
            document.body.appendChild(tempDiv);
            console.log("generate.js: Elemento temporal añadido al DOM para html2canvas.");

            // Wait for styles and scripts within tempDiv to load
            console.log("generate.js: Esperando la carga de CSS y JS en el elemento temporal...");
            const linkPromises = Array.from(tempDiv.querySelectorAll('link[rel="stylesheet"]'))
                .map(link => new Promise(resolve => {
                    link.onload = resolve;
                    link.onerror = (e) => {
                        console.error(`Error al cargar CSS: ${link.href}`, e);
                        resolve(); // Resolve to avoid blocking if there's an error
                    };
                }));
            const scriptPromises = Array.from(tempDiv.querySelectorAll('script'))
                .map(script => new Promise(resolve => {
                    if (!script.src) { // Skip inline scripts
                        resolve();
                        return;
                    }
                    script.onload = resolve;
                    script.onerror = (e) => {
                        console.error(`Error al cargar JS: ${script.src}`, e);
                        resolve(); // Resolve to avoid blocking if there's an error
                    };
                }));

            // Wait for all loads (CSS and JS) and a small additional time for rendering.
            await Promise.all([...linkPromises, ...scriptPromises]);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit longer to ensure rendering
            console.log("generate.js: CSS y JS del certificado cargados y renderizado inicial esperado.");

            // Use html2canvas to capture the content of the temporary div as an image.
            console.log("generate.js: Iniciando captura con html2canvas...");
            const canvas = await html2canvas(tempDiv, {
                scale: 2, // Increase scale for better quality PDF
                useCORS: true, // Enable CORS support for images
                allowTaint: true, // Allow tainting the canvas if images are from different origins (use with caution)
                ignoreElements: (element) => { // Ignore modal elements to avoid capturing them in the PDF
                    return (element.id === 'privacyDialog' || element.id === 'nameRequiredDialog' || element.id === 'allCommentsModal');
                }
            });
            console.log("generate.js: html2canvas completado. Canvas generado.");

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm.
            const pageHeight = 297; // A4 height in mm.
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add new pages if content overflows
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Update PDF download link
            downloadPdfLink.href = pdf.output('datauristring');
            downloadPdfLink.download = `certificado_${validationPageSlug}.pdf`;
            console.log("generate.js: PDF generado y enlace de descarga actualizado.");

            // Remove the temporary div from the DOM
            document.body.removeChild(tempDiv);
            console.log("generate.js: Elemento temporal eliminado del DOM.");

            // Show success message and reveal generated content links
            showMessage('Certificado generado con éxito. Puedes descargarlo o verlo.', 'success');
            generatedContent.style.display = 'block';
            console.log("generate.js: Proceso de generación finalizado con éxito.");

        } catch (error) {
            console.error('generate.js: Error crítico al generar el certificado:', error);
            showMessage('Ocurrió un error inesperado al generar el certificado. Consulta la consola para más detalles.', 'error');
            // Ensure the temporary element is removed if it exists and an error occurs.
            if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
            }
        } finally {
            // Hide loading indicator regardless of success or failure
            loadingIndicator.style.display = 'none';
            console.log("generate.js: Indicador de carga oculto.");
        }
    });
});
