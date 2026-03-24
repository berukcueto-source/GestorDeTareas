

// ALMACEN DE DATOS 
var listaTareas = [];

//  A LA HORA DE ABRIR LA WEB 
// Esta función se ejecuta sola en cuanto el navegador termina de leer el HTML.
window.onload = function() {
    var datosGuardados = localStorage.getItem('mis_tareas');
    
    if (datosGuardados != null) {
        listaTareas = JSON.parse(datosGuardados);
        
        // Llamamos a las funciones para que esos datos aparezcan en la pantalla.
        actualizarPantalla(listaTareas);
        contarTareas();
    }
};

// FORMULARIO AÑADIR TAREA
var form = document.getElementById('tarea-form');

form.addEventListener('submit', function(e) {
    // Evitamos que la página se recargue automáticamente, para que JS no pierda los datos.
    e.preventDefault();

    // recogemos lo que el usuario ha escrito en cada una de las casillas.
    var titulo = document.getElementById('titulo').value;
    var prioridad = document.getElementById('prioridad').value;
    var email = document.getElementById('email').value;
    var fecha = document.getElementById('fecha').value;

    // Comprobamos que no haya textos vacíos
    if (titulo.trim() == "" || prioridad == "" || email == "" || fecha == "") {
        alert("Tienes que completar todos los campos.");
        return; // El return hace que la función se detenga aquí y no guarde nada.
    }

    // recogemos toda la informacion para una sola variable.
    var objetoTarea = {
        id: Date.now(),             // Un número único basado en la fecha y hora actual para identificar cada tarea.
        titulo: titulo,
        prioridad: parseInt(prioridad),   // Convertimos el texto de la prioridad en un número real.
        email: email,
        fecha: fecha,
        terminada: false            // Por defecto, una tarea nueva no está terminada.
    };

    // Añadimos nuestro nuevo objeto a la lista general.
    listaTareas.push(objetoTarea);
    
    // Guardamos la lista actualizada en el disco y refrescamos la vista.
    guardarYRefrescar();
    
    // Limpiamos los cuadros de texto para que el usuario pueda escribir la siguiente.
    form.reset();
});

// FUNCIÓN PARA GUARDAR (JSON + LOCALSTORAGE) 
function guardarYRefrescar() {
    // Convertimos la lista de objetos a una cadena de texto JSON para poder guardarla en el navegador.
    var textoJSON = JSON.stringify(listaTareas);
    
    // Guardamos ese texto en la memoria del navegador.
    localStorage.setItem('mis_tareas', textoJSON);
    
    // Actualizamos lo que ve el usuario y los números del resumen.
    actualizarPantalla(listaTareas);
    contarTareas();
}

// --- 5. DIBUJAR EN EL HTML (MANIPULACIÓN DEL DOM) ---
function actualizarPantalla(tareas) {
    var listaDiv = document.getElementById('contenedor-tareas');
    
    // Borramos el contenido actual del listado para que no se dupliquen las tareas al redibujar.
    listaDiv.innerHTML = "";

    for (var i = 0; i < tareas.length; i++) {
        var t = tareas[i]; 

        // Creamos un nuevo elemento 'div' (un nodo) que será la tarjeta de la tarea.
        var caja = document.createElement('div');
        caja.className = "tarea-card";
        
        // Si la tarea está marcada como terminada, le añadimos una clase CSS para tacharla.
        if (t.terminada) {
            caja.classList.add('completada');
        }

        // Metemos el contenido dentro de la tarjeta usando etiquetas HTML.
        caja.innerHTML = "<div>" +
            "<strong>" + t.titulo + "</strong> (" + t.fecha + ")<br>" +
            "<small>Prioridad: " + t.prioridad + " | " + t.email + "</small>" +
            "</div>";

        // Creamos un pequeño contenedor para los botones de acción.
        var botones = document.createElement('div');
        
        // Botón para cambiar el estado (terminada o pendiente).
        var bEstado = document.createElement('button');
        bEstado.innerText = "✓";
        bEstado.className = "btn-estado";
        bEstado.onclick = crearEstadoFunc(t.id); // Le pasamos el ID para saber cuál editar.

        // Botón para eliminar la tarea para siempre.
        var bBorrar = document.createElement('button');
        bBorrar.innerText = "x";
        bBorrar.className = "btn-borrar";
        bBorrar.onclick = crearBorrarFunc(t.id); // Le pasamos el ID para saber cuál borrar.

        // Añadimos los botones a su contenedor, y la tarjeta a la lista principal de la web.
        botones.appendChild(bEstado);
        botones.appendChild(bBorrar);
        caja.appendChild(botones);
        listaDiv.appendChild(caja);
    }
}

// BORRAR Y EDITAR

function crearBorrarFunc(id) {
    return function() {
        if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
            // Creamos una lista nueva donde metemos todas las tareas menos la que queremos borrar.
            var nuevaLista = [];
            for (var i = 0; i < listaTareas.length; i++) {
                if (listaTareas[i].id !== id) {
                    nuevaLista.push(listaTareas[i]);
                }
            }
            // Sustituimos la lista vieja por la nueva y guardamos.
            listaTareas = nuevaLista;
            guardarYRefrescar();
        }
    }
}

function crearEstadoFunc(id) {
    return function() {
        // Buscamos la tarea por su ID y le damos la vuelta a su estado (si era false, pasa a true).
        for (var i = 0; i < listaTareas.length; i++) {
            if (listaTareas[i].id === id) {
                listaTareas[i].terminada = !listaTareas[i].terminada;
            }
        }
        guardarYRefrescar();
    }
}

// BUSCADOR 
document.getElementById('input-busqueda').addEventListener('input', function(e) {

    var filtro = e.target.value.toLowerCase();
    var resultado = [];

    // Recorremos la lista y si el título contiene las letras buscadas, lo añadimos al resultado.
    for (var i = 0; i < listaTareas.length; i++) {
        if (listaTareas[i].titulo.toLowerCase().indexOf(filtro) !== -1) {
            resultado.push(listaTareas[i]);
        }
    }
    // Solo dibujamos en pantalla los que han coincidido con la búsqueda.
    actualizarPantalla(resultado);
});

// APARTADO  RESUMEN) ---
function contarTareas() {
    // El total es simplemente el tamaño de la lista (length).
    document.getElementById('total-tareas').innerText = listaTareas.length;
    
    // Recorremos la lista para contar cuántas tienen prioridad de 4 o 5.
    var alta = 0;
    for (var i = 0; i < listaTareas.length; i++) {
        if (listaTareas[i].prioridad >= 4) {
            alta++;
        }
    }
    document.getElementById('total-alta').innerText = alta;
}

// RESETEAR 
document.getElementById('btn-reset').onclick = function() {
    if (confirm("¿Deseas borrar todas las tareas guardadas?")) {
        localStorage.clear(); // Vacía la memoria del navegador.
        listaTareas = [];    // Vacía nuestra lista en el código.
        guardarYRefrescar(); // Actualiza la pantalla (quedará vacía).
    }
}