// Esperamos a que el navegador termine de cargar el HTML por seguridad
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Selección de elementos mediante sus IDs
    const boton = document.getElementById('botonSorpresa');
    const mensaje = document.getElementById('mensajeOculto');
    const formulario = document.getElementById('miFormulario');
    const mensajeExito = document.getElementById('mensajeExito');

    // 2. Evento para mostrar/ocultar el mensaje sorpresa
    boton.addEventListener('click', () => {
        if (mensaje.style.display === 'block') {
            mensaje.style.display = 'none';
            boton.textContent = '¡Haz clic aquí!';
        } else {
            mensaje.style.display = 'block';
            boton.textContent = 'Ocultar mensaje';
        }
    });

    // 3. Evento para capturar el envío del formulario
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault(); // Evita que la página intente recargarse
        
        mensajeExito.style.display = 'block'; // Mostramos el mensaje de éxito
        formulario.reset(); // Reseteamos los campos del formulario para limpiarlo

        // Ocultamos automáticamente la alerta de éxito tras 4 segundos
        setTimeout(() => {
            mensajeExito.style.display = 'none';
        }, 4000);
    });
    
});
