// js/admin-password.js
// Contiene la lógica para la protección con contraseña de admin-generador.html

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado. Inicializando lógica de contraseña desde admin-password.js.");

    const correctPassword = 'Chino262'; // Contraseña de acceso
    const passwordOverlay = document.getElementById('passwordOverlay');
    const passwordInput = document.getElementById('passwordInput');
    const accessButton = document.getElementById('accessButton');
    const errorMessage = document.getElementById('errorMessage');
    const generatorContent = document.getElementById('generatorContent');
    const closeMessageBoxButton = document.getElementById('closeMessageBoxButton'); // Referencia al botón de cerrar mensaje

    // Asegura que la capa de contraseña se muestre con un ligero retraso para las animaciones CSS.
    setTimeout(() => {
        if (passwordOverlay) {
            passwordOverlay.style.opacity = '1';
            passwordOverlay.style.visibility = 'visible';
            console.log("Capa de contraseña visible.");
        } else {
            console.error("Error: El elemento 'passwordOverlay' no se encontró en el DOM.");
        }
    }, 100);

    // Manejador de evento para el clic del botón de acceso.
    if (accessButton) {
        accessButton.addEventListener('click', () => {
            console.log("Botón 'Acceder' clicado.");
            if (passwordInput) {
                const enteredPassword = passwordInput.value.trim();
                console.log("Contraseña ingresada (recortada):", enteredPassword);
                console.log("Contraseña correcta:", correctPassword);

                if (enteredPassword === correctPassword) {
                    if (passwordOverlay) passwordOverlay.style.display = 'none';
                    if (generatorContent) generatorContent.style.display = 'block';
                    if (errorMessage) errorMessage.style.display = 'none';
                    passwordInput.value = '';
                    console.log("Acceso concedido. Contenido del generador visible.");
                } else {
                    if (errorMessage) errorMessage.style.display = 'block';
                    if (passwordInput) passwordInput.value = '';
                    console.log("Acceso denegado. Contraseña incorrecta.");
                }
            } else {
                console.error("Error: El elemento 'passwordInput' no se encontró en el DOM al hacer clic.");
            }
        });
    } else {
        console.error("Error: El elemento 'accessButton' no se encontró en el DOM.");
    }

    // Permite presionar Enter en el campo de contraseña para intentar acceder.
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            console.log("Tecla presionada en el campo de contraseña:", e.key);
            if (e.key === 'Enter') {
                if (accessButton) {
                    accessButton.click();
                    console.log("Tecla 'Enter' presionada. Simulando clic en el botón.");
                } else {
                    console.error("Error: El elemento 'accessButton' no se encontró para el evento 'keypress'.");
                }
            }
        });
    } else {
        console.error("Error: El elemento 'passwordInput' no se encontró en el DOM.");
    }

    // Manejador de evento para el botón de cerrar mensaje (si existe).
    // Nota: messageBox se usa aquí, así que también necesitamos una referencia a él.
    const messageBox = document.getElementById('messageBox'); 
    if (closeMessageBoxButton) {
        closeMessageBoxButton.addEventListener('click', () => {
            if (messageBox) {
                messageBox.style.display = 'none';
                console.log("Mensaje de box cerrado.");
            }
        });
    } else {
        console.error("Error: El elemento 'closeMessageBoxButton' no se encontró en el DOM.");
    }
});
