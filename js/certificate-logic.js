document.addEventListener('DOMContentLoaded', () => {
    // === Lógica compartida para las páginas de certificado ===
    // Este script se ejecutará en cada página de certificado generada.

    // Define una URL base para los assets dentro del certificado generado.
    // Esto es crucial para que las imágenes y CSS se carguen correctamente
    // tanto localmente (con un servidor) como en GitHub Pages.
    // Asegúrate de que 'ConfiAbleEmpress' coincida con el nombre de tu repositorio.
    const REPO_NAME = '/ConfiAbleEmpress'; 
    const BASE_URL = window.location.origin + (window.location.pathname.includes(REPO_NAME) ? REPO_NAME : '');

    console.log("certificate-logic.js: BASE_URL detectada:", BASE_URL);

    // Función para escapar caracteres HTML y prevenir XSS.
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

    // Array de URLs de avatares genéricos no personales (ahora rutas locales).
    // Asegúrate de que estas imágenes existan en tu carpeta 'assets/avatars/'.
    const avatarImages = [
        `${BASE_URL}/assets/avatars/avatar-a.png`, 
        `${BASE_URL}/assets/avatars/avatar-b.png`, 
        `${BASE_URL}/assets/avatars/avatar-c.png`, 
        `${BASE_URL}/assets/avatars/avatar-d.png`, 
        `${BASE_URL}/assets/avatars/avatar-e.png`, 
        `${BASE_URL}/assets/avatars/avatar-f.png`, 
        `${BASE_URL}/assets/avatars/avatar-g.png`, 
        `${BASE_URL}/assets/avatars/avatar-h.png`, 
        `${BASE_URL}/assets/avatars/avatar-i.png`, 
        `${BASE_URL}/assets/avatars/avatar-j.png`, 
        `${BASE_URL}/assets/avatars/avatar-k.png`, 
        `${BASE_URL}/assets/avatars/avatar-l.png`, 
        `${BASE_URL}/assets/avatars/avatar-m.png`, 
        `${BASE_URL}/assets/avatars/avatar-n.png`, 
        `${BASE_URL}/assets/avatars/avatar-o.png`
    ];

    // Carga el avatar guardado del usuario o el primero por defecto.
    // Si no hay avatar guardado, usa el primero de la lista.
    let selectedAvatarUrl = localStorage.getItem('userAvatar') || avatarImages[0];

    /**
     * Función para generar una URL de avatar aleatoria desde el array predefinido.
     * @returns {string} URL de la imagen del avatar.
     */
    function getRandomAvatarUrl() {
        const randomIndex = Math.floor(Math.random() * avatarImages.length);
        return avatarImages[randomIndex];
    }

    // Función para generar el HTML de estrellas de calificación.
    function generateStarsHtml(numStars) {
        let starsHtml = '';
        for (let i = 0; i < numStars; i++) {
            starsHtml += '<span class="star">&#9733;</span>'; // Estrella llena.
        }
        for (let i = numStars; i < 5; i++) { // Asumiendo un máximo de 5 estrellas.
            starsHtml += '<span class="star empty">&#9734;</span>'; // Estrella vacía.
        }
        return starsHtml;
    }

    // Array global para almacenar todos los comentarios, incluyendo los agregados dinámicamente.
    // Carga los comentarios desde localStorage, o usa un conjunto por defecto.
    let allComments = JSON.parse(localStorage.getItem('allComments')) || [
        { id: 'c0', author: 'Ana G.', text: 'Al principio no estaba segura de esta empresa, pero el certificado de ConfiAbleEmpress me dio la confianza necesaria. ¡Producto excelente!', likes: 25, avatar: null },
        { id: 'c1', author: 'Carlos R.', text: 'Dudé un poco, pero la validación de ConfiAbleEmpress y los comentarios me animaron. ¡Empresa123 S.A. es muy recomendable, servicio top!', likes: 20, avatar: null },
        { id: 'c2', author: 'Sofía M.', text: 'Gracias a ConfiAbleEmpress, encontré a Empresa123 S.A. y su servicio fue impecable. ¡Confianza total, el producto es justo lo que necesitaba!', likes: 18, avatar: null },
        { id: 'c3', author: 'Pedro L.', text: 'La verificación de ConfiAbleEmpress realmente marca la diferencia. Empresa123 S.A. cumplió con todo lo prometido, un producto de alta calidad.', likes: 15, avatar: null },
        { id: 'c4', author: 'Laura S.', text: 'Es genial ver una plataforma como ConfiAbleEmpress que ayuda a destacar empresas confiables. Empresa123 S.A. merece sus 3 estrellas, ¡muy buen producto!', likes: 12, avatar: null },
        { id: 'c5', author: 'Miguel P.', text: 'Necesitaba un servicio urgente y la validación de ConfiAbleEmpress me ayudó a elegir rápido. Muy contento con Empresa123 S.A. y su producto.', likes: 10, avatar: null },
        { id: 'c6', author: 'Elena F.', text: 'Recomiendo a Empresa123 S.A. y a ConfiAbleEmpress por hacer más fácil encontrar negocios de confianza. ¡Mi compra fue un éxito!', likes: 8, avatar: null },
        { id: 'c7', author: 'Diego V.', text: 'La transparencia que ofrece ConfiAbleEmpress es clave. Gracias a ello, me sentí seguro al comprar en Empresa123 S.A. y el resultado fue excelente.', likes: 7, avatar: null },
        { id: 'c8', author: 'Isabel J.', text: 'Una experiencia de compra muy fluida. El certificado de ConfiAbleEmpress me dio la tranquilidad que buscaba. ¡Totalmente satisfecha con el producto!', likes: 6, avatar: null },
        { id: 'c9', author: 'Fernando Q.', text: 'Impresionado con la seriedad de Empresa123 S.A. y el respaldo de ConfiAbleEmpress. Mi producto llegó en perfectas condiciones y a tiempo.', likes: 5, avatar: null },
        { id: 'c10', author: 'Gabriela V.', text: 'ConfiAbleEmpress me ayudó a verificar esta empresa. La atención al cliente de Empresa123 S.A. fue excepcional.', likes: 9, avatar: null },
        { id: 'c11', author: 'Ricardo B.', text: 'Un sistema de validación muy útil. Gracias a ConfiAbleEmpress pude confiar en Empresa123 S.A. para mi proyecto.', likes: 11, avatar: null },
        { id: 'c12', author: 'Patricia N.', text: 'Me encantó la facilidad para encontrar empresas confiables. Empresa123 S.A. superó mis expectativas con su producto.', likes: 13, avatar: null },
        { id: 'c13', author: 'Javier M.', text: 'La validación de ConfiAbleEmpress me dio la seguridad que necesitaba. Empresa123 S.A. es un claro ejemplo de profesionalismo.', likes: 14, avatar: null },
        { id: 'c14', author: 'Verónica C.', text: 'Siempre busco empresas con sellos de confianza. ConfiAbleEmpress y Empresa123 S.A. son una combinación perfecta.', likes: 16, avatar: null },
        { id: 'c15', author: 'Andrés D.', text: 'El proceso de validación es muy claro. Me siento más seguro al elegir empresas con este certificado.', likes: 7, avatar: null },
        { id: 'c16', author: 'Mariana P.', text: 'Una excelente herramienta para consumidores. Empresa123 S.A. demostró ser muy seria y cumplida.', likes: 10, avatar: null },
        { id: 'c17', author: 'Roberto F.', text: 'ConfiAbleEmpress me ahorró tiempo y preocupaciones. ¡Empresa123 S.A. es un acierto!', likes: 15, avatar: null },
        { id: 'c18', author: 'Lucía H.', text: 'La información proporcionada es muy útil. Gracias a ConfiAbleEmpress, mi experiencia de compra fue fantástica.', likes: 8, avatar: null },
        { id: 'c19', author: 'Sergio T.', text: 'Recomiendo a todos usar ConfiAbleEmpress antes de cualquier contratación. Empresa123 S.A. es un ejemplo de confianza.', likes: 12, avatar: null },
        { id: 'c20', author: 'Valeria R.', text: 'La plataforma es muy intuitiva, me ayudó a encontrar un servicio de calidad rápidamente.', likes: 18, avatar: null },
        { id: 'c21', author: 'Juan C.', text: 'Un gran recurso para la comunidad. La validación es un plus que valoro mucho.', likes: 22, avatar: null },
        { id: 'c22', author: 'Natalia B.', text: 'Me dio mucha tranquilidad ver que Empresa123 S.A. estaba validada por ConfiAbleEmpress. ¡Excelente!', likes: 19, avatar: null },
        { id: 'c23', author: 'Felipe G.', text: 'El certificado es una prueba tangible de la seriedad de la empresa. Muy satisfecho.', likes: 17, avatar: null },
        { id: 'c24', author: 'Carolina L.', text: 'Una idea innovadora para generar confianza en el mercado. ConfiAbleEmpress es un referente.', likes: 21, avatar: null }
    ];

    // Asigna avatares iniciales a los comentarios que no los tienen.
    allComments.forEach(comment => {
        if (!comment.avatar) {
            comment.avatar = getRandomAvatarUrl();
        }
    });

    // Para comentarios agregados dinámicamente, asegura que los IDs únicos comiencen
    // desde el ID más alto existente + 1.
    let nextCommentId = allComments.length > 0 ? Math.max(...allComments.map(c => parseInt(c.id.substring(1)))) + 1 : 0;

    // Carga los comentarios a los que el usuario ha dado "Me gusta" desde localStorage.
    let likedCommentsSet = new Set(JSON.parse(localStorage.getItem('likedComments') || '[]'));

    /**
     * Guarda el estado actual de todos los comentarios en localStorage.
     */
    function saveComments() {
        localStorage.setItem('allComments', JSON.stringify(allComments));
    }

    /**
     * Renderiza los N comentarios principales basados en el número de "Me gusta".
     * @param {number} numToDisplay - El número de comentarios principales a mostrar.
     * @param {HTMLElement} container - El elemento DOM donde se renderizarán los comentarios.
     */
    function renderComments(numToDisplay, container) {
        if (!container) return;

        container.innerHTML = '';

        // Ordena todos los comentarios por el número de "Me gusta" en orden descendente.
        let sortedComments = [...allComments].sort((a, b) => b.likes - a.likes);

        // Selecciona solo los comentarios que se deben mostrar.
        let commentsToRender = sortedComments.slice(0, numToDisplay);

        commentsToRender.forEach(comment => {
            const commentCard = document.createElement('div');
            commentCard.className = 'comment-card';
            const isLiked = likedCommentsSet.has(comment.id);
            const likedClass = isLiked ? 'liked' : '';

            // Usa BASE_URL para la imagen del avatar, y un fallback si no se carga.
            commentCard.innerHTML = `
                <div class="comment-avatar">
                    <img src="${escapeHtml(comment.avatar)}" alt="Avatar de ${escapeHtml(comment.author)}" onerror="this.onerror=null;this.src='${BASE_URL}/assets/avatars/default-user.png';">
                </div>
                <div class="comment-content">
                    <p class="comment-author">${escapeHtml(comment.author)}</p>
                    <p class="comment-text">${escapeHtml(comment.text)}</p>
                    <div class="comment-actions">
                        <i class="fas fa-thumbs-up like-button ${likedClass}" data-comment-id="${escapeHtml(comment.id)}"></i> <span class="likes-count">${comment.likes}</span>
                    </div>
                </div>
            `;
            container.appendChild(commentCard);

            // Añade un event listener para el botón de "Me gusta".
            commentCard.querySelector('.like-button').addEventListener('click', function() {
                const fakeCommentNameInput = document.getElementById('fakeCommentName');
                const nameRequiredDialog = document.getElementById('nameRequiredDialog');

                if (fakeCommentNameInput && fakeCommentNameInput.value.trim() === '') {
                    nameRequiredDialog.classList.add('show');
                    return;
                }

                const commentId = this.dataset.commentId;
                const commentObj = allComments.find(c => c.id === commentId);

                if (commentObj) {
                    if (likedCommentsSet.has(commentId)) {
                        commentObj.likes--;
                        likedCommentsSet.delete(commentId);
                        this.classList.remove('liked');
                    } else {
                        commentObj.likes++;
                        likedCommentsSet.add(commentId);
                        this.classList.add('liked');
                    }
                    localStorage.setItem('likedComments', JSON.stringify(Array.from(likedCommentsSet)));
                    saveComments();
                    this.nextElementSibling.textContent = commentObj.likes;

                    renderComments(3, document.getElementById('simulated-comments'));
                    const allCommentsModal = document.getElementById('allCommentsModal');
                    if (allCommentsModal && allCommentsModal.classList.contains('show')) {
                        renderComments(allComments.length, document.getElementById('modal-comments-container'));
                    }
                }
            });
        });
    }

    // === Lógica para Simular Comentarios en la Página de Validación ===
    function simulateComments() {
        const submitFakeCommentBtn = document.getElementById('submitFakeComment');
        const fakeCommentNameInput = document.getElementById('fakeCommentName');
        const fakeCommentTextInput = document.getElementById('fakeCommentText');
        const fakeMessage = document.getElementById('fakeMessage');
        const selectableAvatars = document.querySelectorAll('.selectable-avatar');
        const privacyDialog = document.getElementById('privacyDialog');
        const nameRequiredDialog = document.getElementById('nameRequiredDialog');
        const viewAllCommentsBtn = document.getElementById('viewAllCommentsBtn');
        const allCommentsModal = document.getElementById('allCommentsModal');
        const closeAllCommentsModal = document.getElementById('closeAllCommentsModal');
        const modalCommentsContainer = document.getElementById('modal-comments-container');

        // Event listeners para diálogos.
        if (privacyDialog && privacyDialog.querySelector('.dialog-close-btn')) {
            privacyDialog.querySelector('.dialog-close-btn').addEventListener('click', () => {
                privacyDialog.classList.remove('show');
            });
        }
        if (nameRequiredDialog && nameRequiredDialog.querySelector('.dialog-close-btn')) {
            nameRequiredDialog.querySelector('.dialog-close-btn').addEventListener('click', () => {
                nameRequiredDialog.classList.remove('show');
            });
        }

        // Abre el modal para ver todos los comentarios.
        if (viewAllCommentsBtn) {
            viewAllCommentsBtn.addEventListener('click', () => {
                if (modalCommentsContainer) {
                    renderComments(allComments.length, modalCommentsContainer);
                }
                if (allCommentsModal) {
                    allCommentsModal.classList.add('show');
                }
            });
        }

        // Cierra el modal para ver todos los comentarios.
        if (closeAllCommentsModal) {
            closeAllCommentsModal.addEventListener('click', () => {
                if (allCommentsModal) {
                    allCommentsModal.classList.remove('show');
                }
            });
        }

        // Cierra el modal para ver todos los comentarios al hacer clic fuera de su contenido.
        if (allCommentsModal) {
            allCommentsModal.addEventListener('click', (event) => {
                if (event.target === allCommentsModal) {
                    allCommentsModal.classList.remove('show');
                }
            });
        }

        // Inicializa el campo de nombre del formulario de comentarios con el nombre guardado en localStorage.
        if (fakeCommentNameInput) {
            const storedName = localStorage.getItem('userName');
            if (storedName) {
                fakeCommentNameInput.value = storedName;
            }

            // Guarda el nombre en localStorage cada vez que el usuario escribe.
            fakeCommentNameInput.addEventListener('input', () => {
                localStorage.setItem('userName', fakeCommentNameInput.value.trim());
            });
        }

        // Marca el avatar seleccionado al cargar la página.
        selectableAvatars.forEach(avatar => {
            // Asegura que la URL base del avatar sea correcta para la comparación.
            const avatarSrcWithoutBase = avatar.src.replace(BASE_URL, '');
            const selectedAvatarUrlWithoutBase = selectedAvatarUrl.replace(BASE_URL, '');

            if (avatarSrcWithoutBase === selectedAvatarUrlWithoutBase) {
                avatar.classList.add('selected');
            } else {
                avatar.classList.remove('selected');
            }
        });

        // Event listeners para la selección de avatares.
        selectableAvatars.forEach(avatar => {
            avatar.addEventListener('click', function() {
                selectableAvatars.forEach(av => av.classList.remove('selected'));
                this.classList.add('selected');
                selectedAvatarUrl = this.src; // Guarda la URL completa del avatar.
                localStorage.setItem('userAvatar', selectedAvatarUrl);
                if (privacyDialog) {
                    privacyDialog.classList.add('show');
                }
            });
        });

        // Maneja el envío del formulario de comentarios simulados.
        if (submitFakeCommentBtn) {
            submitFakeCommentBtn.addEventListener('click', () => {
                const name = fakeCommentNameInput.value.trim();
                const text = fakeCommentTextInput.value.trim();

                if (!name) {
                    if (fakeMessage) {
                        fakeMessage.textContent = 'Por favor, ingresa tu nombre para dejar un comentario.';
                        fakeMessage.style.display = 'block';
                        fakeMessage.style.color = 'var(--error-color)';
                        setTimeout(() => {
                            fakeMessage.style.display = 'none';
                        }, 3000);
                    }
                    return;
                }

                if (text === '') {
                    if (fakeMessage) {
                        fakeMessage.textContent = 'Por favor, escribe un comentario.';
                        fakeMessage.style.display = 'block';
                        fakeMessage.style.color = 'var(--error-color)';
                        setTimeout(() => {
                            fakeMessage.style.display = 'none';
                        }, 3000);
                    }
                    return;
                }

                if (name && text) {
                    const newComment = {
                        id: `c${nextCommentId++}`,
                        author: name,
                        text: text,
                        likes: 0,
                        avatar: selectedAvatarUrl // Usa la URL completa del avatar seleccionado
                    };
                    allComments.push(newComment);
                    saveComments();

                    renderComments(3, document.getElementById('simulated-comments'));

                    if (fakeMessage) {
                        fakeMessage.textContent = `¡Gracias por tu comentario, ${name}! Tu opinión ha sido registrada y es muy valiosa para nosotros.`;
                        fakeMessage.style.display = 'block';
                        fakeMessage.style.color = 'var(--primary-color)';
                    }
                    fakeCommentTextInput.value = '';
                    setTimeout(() => {
                        if (fakeMessage) {
                            fakeMessage.style.display = 'none';
                        }
                    }, 5000);
                }
            });
        }
    }

    // Función para agregar un comentario automáticamente.
    function addRandomCommentAutomatically() {
        const autoCommentsPool = [
            { text: 'Me parece una iniciativa excelente para generar confianza. ¡Gracias por validar!', likes: 1 },
            { text: 'La verdad es que el certificado me ayudó a decidirme. Muy buen trabajo de ConfiAbleEmpress.', likes: 2 },
            { text: 'Interesante cómo se valida la confianza. Esto es muy útil para el consumidor.', likes: 1 },
            { text: '¡Mi experiencia fue genial! El sello de confianza realmente funciona.', likes: 3 },
            { text: 'Buena página para verificar. Me da más seguridad al buscar servicios.', likes: 2 },
            { text: 'Un concepto brillante. ConfiAbleEmpress está cambiando la forma de confiar en línea.', likes: 4 },
            { text: 'Siempre verifico antes de comprar, y esta plataforma lo hace muy fácil. ¡Excelente!', likes: 5 },
            { text: 'Como empresario, valoro la transparencia. ConfiAbleEmpress es una herramienta esencial.', likes: 6 },
            { text: 'Encontré lo que buscaba gracias a este certificado. ¡Altamente recomendado!', likes: 3 },
            { text: 'El sistema de validación es robusto y fiable. Un gran avance para la confianza del cliente.', likes: 7 },
            { text: 'La plataforma es muy intuitiva, me ayudó a encontrar un servicio de calidad rápidamente.', likes: 18 },
            { text: 'Un gran recurso para la comunidad. La validación es un plus que valoro mucho.', likes: 22 },
            { text: 'Me dio mucha tranquilidad ver que Empresa123 S.A. estaba validada por ConfiAbleEmpress. ¡Excelente!', likes: 19 },
            { text: 'El certificado es una prueba tangible de la seriedad de la empresa. Muy satisfecho.', likes: 17 },
            { text: 'Una idea innovadora para generar confianza en el mercado. ConfiAbleEmpress es un referente.', likes: 21 },
            { text: 'La validación de ConfiAbleEmpress es un diferenciador clave. ¡Gran trabajo!', likes: 10 },
            { text: 'Me encanta cómo esta página simplifica la búsqueda de servicios confiables.', likes: 14 },
            { text: 'Un concepto muy necesario en la era digital. ConfiAbleEmpress es un aliado.', likes: 16 },
            { text: 'Empresa123 S.A. es un ejemplo de lo que se puede lograr con la confianza de ConfiAbleEmpress.', likes: 20 },
            { text: 'Gracias a esta plataforma, pude tomar una decisión informada. ¡Totalmente recomendable!', likes: 13 }
        ];

        const randomNames = [
            'UsuarioX', 'Anónimo123', 'Visitante', 'ClienteFiel', 'Invitado',
            'Comprador', 'Curioso', 'Explorador', 'NuevoUsuario', 'Amigo',
            'Lector', 'Comentador', 'Internauta', 'Fan', 'Seguidor'
        ];
        const randomAuthor = randomNames[Math.floor(Math.random() * randomNames.length)];

        const randomCommentData = autoCommentsPool[Math.floor(Math.random() * autoCommentsPool.length)];
        const newComment = {
            id: `c${nextCommentId++}`,
            author: randomAuthor,
            text: randomCommentData.text,
            likes: Math.floor(Math.random() * (25 - 5 + 1)) + 5,
            avatar: getRandomAvatarUrl()
        };

        allComments.push(newComment);
        saveComments();
        renderComments(3, document.getElementById('simulated-comments'));
    }

    // === Lógica para la interactividad de la barra de confianza ===
    function setupTrustBarInteractivity() {
        const trustSegments = document.querySelectorAll('.trust-segment');
        const trustTooltip = document.querySelector('.trust-tooltip');
        const tooltipStars = trustTooltip.querySelector('.tooltip-stars');
        const tooltipComment = trustTooltip.querySelector('.tooltip-comment');
        const trustBarContainer = document.querySelector('.trust-bar-container');
        const trustMarker = document.querySelector('.trust-marker');
        const trustPercentageText = document.querySelector('.trust-percentage-text');

        // Obtiene el starCount directamente del atributo data de un elemento,
        // asumiendo que el HTML del certificado ya tiene el valor de estrellas definido.
        // Esto es crucial para que este script funcione de forma independiente en la página generada.
        const companyDetails = document.querySelector('.company-details');
        // Asegúrate de que 'companyDetails' no sea null antes de intentar acceder a 'dataset'.
        const starCount = companyDetails ? parseInt(companyDetails.dataset.starCount) : 0; 
        const initialPercentage = (starCount / 5) * 100;

        if (trustMarker) {
            trustMarker.style.left = `${initialPercentage}%`;
        } else {
            console.error('Error: trustMarker element not found for trust bar interactivity.');
        }
        if (trustPercentageText) {
            trustPercentageText.style.left = `${initialPercentage}%`;
            trustPercentageText.textContent = `${initialPercentage}%`;
        } else {
            console.error('Error: trustPercentageText element not found for trust bar interactivity.');
        }

        trustSegments.forEach(segment => {
            segment.addEventListener('mouseover', (event) => {
                const stars = parseInt(segment.dataset.stars);
                const comment = segment.dataset.comment;

                if (tooltipStars) tooltipStars.innerHTML = generateStarsHtml(stars);
                if (tooltipComment) tooltipComment.textContent = comment;

                const segmentRect = segment.getBoundingClientRect();
                const containerRect = trustBarContainer.getBoundingClientRect();

                const tooltipLeft = (segmentRect.left - containerRect.left) + (segmentRect.width / 2);
                if (trustTooltip) trustTooltip.style.left = `${tooltipLeft}px`;

                if (trustTooltip) trustTooltip.classList.add('show');
            });

            segment.addEventListener('mouseout', () => {
                if (trustTooltip) trustTooltip.classList.remove('show');
            });
        });
    }

    // === Inicialización al cargar el DOM ===
    // Ya que el script se carga con defer o al final del body, DOMContentLoaded ya se habrá disparado
    // o se disparará una vez que este script se evalúe.
    const simulatedCommentsContainer = document.getElementById('simulated-comments');
    if (simulatedCommentsContainer) {
        renderComments(3, simulatedCommentsContainer);
    }
    simulateComments();
    setupTrustBarInteractivity();

    // Configura la adición automática de comentarios cada 5 minutos.
    setInterval(addRandomCommentAutomatically, 300000); // 5 minutos.
});
