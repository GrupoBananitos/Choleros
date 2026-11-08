// Conexión con Google Sheets mediante Google Apps Script.
// Sustituye la URL por la URL /exec de tu implementación.
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbz-3bjJTxuLsIC1fyHmsi-beL6h9YZ4JEMOuyNde9XQURorrg1aHM4brVDIaBKoYBdk/exec";

const ARCHIVOS_REGALOS = {
  "las-fijas": "assets/pdfs/las-fijas.pdf",
  "alimentacion-saludable": "assets/pdfs/alimentacion-saludable.pdf",
  "planeacion-fit": "assets/pdfs/planeacion-fit.pdf"
};

async function solicitarServidor(datos) {
  const response = await fetch(URL_APPS_SCRIPT, {
    method: "POST",
    redirect: "follow",
    // No agregar Content-Type application/json: puede provocar preflight CORS.
    body: JSON.stringify(datos)
  });

  const texto = await response.text();
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error("Google Apps Script no devolvió una respuesta JSON válida.");
  }
}

const modalAcceso = document.getElementById("subscribeModal");
const abrirAcceso = document.getElementById("openSubscribe");
const cerrarAcceso = document.getElementById("closeSubscribe");
const campoCorreo = document.getElementById("subscriberEmail");
const mensajeAcceso = document.getElementById("subscribeMessage");
const btnRegistro = document.getElementById("btnRegistro");
const btnLogin = document.getElementById("btnLogin");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

function mostrarAcceso() {
  if (!modalAcceso) return;
  modalAcceso.classList.add("active");
  modalAcceso.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => campoCorreo?.focus(), 150);
}

function ocultarAcceso() {
  if (!modalAcceso) return;
  modalAcceso.classList.remove("active");
  modalAcceso.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function obtenerUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem("choclitos_usuario") || "null");
  } catch {
    return null;
  }
}

function guardarUsuario(usuario) {
  sessionStorage.setItem("choclitos_usuario", JSON.stringify(usuario));
  actualizarEstadoBoton(Boolean(usuario && usuario.descarga === "Descargado"));
}

function actualizarEstadoBoton(descargado) {
  const boton = document.getElementById("btnDescargarRegalo");
  if (!boton) return;

  boton.disabled = descargado;
  boton.textContent = descargado ? "DESCARGA UTILIZADA" : "DESCARGAR REGALO";
}

function validarCorreo() {
  const correo = (campoCorreo?.value || "").trim().toLowerCase();
  if (!campoCorreo || !campoCorreo.checkValidity() || !correo) {
    campoCorreo?.reportValidity();
    return null;
  }
  return correo;
}

async function ejecutarAcceso(accion) {
  const correo = validarCorreo();
  if (!correo) return;

  const boton = accion === "registrar" ? btnRegistro : btnLogin;
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.textContent = "PROCESANDO...";
  mensajeAcceso.textContent = "";

  try {
    const resultado = await solicitarServidor({ accion, correo });

    if (resultado.resultado === "registrado") {
      guardarUsuario({ id: resultado.id, correo, descarga: "Pendiente" });
      mensajeAcceso.textContent = "Registro completado. Ya puedes utilizar tu regalo.";
      actualizarEstadoBoton(false);
    } else if (resultado.resultado === "duplicado") {
      mensajeAcceso.textContent = "Este correo ya está registrado. Inicia sesión.";
    } else if (resultado.resultado === "sesion_iniciada") {
      guardarUsuario({
        id: resultado.id,
        correo,
        descarga: resultado.descarga || "Pendiente"
      });
      mensajeAcceso.textContent = "Sesión iniciada correctamente.";
      actualizarEstadoBoton(resultado.descarga === "Descargado");
    } else if (resultado.resultado === "no_registrado") {
      mensajeAcceso.textContent = "Este correo no está registrado. Regístrate primero.";
    } else {
      mensajeAcceso.textContent = resultado.mensaje || "No se pudo completar la operación.";
    }
  } catch (error) {
    console.error(error);
    mensajeAcceso.textContent = "Error de conexión. Intenta nuevamente.";
  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
}

async function descargarRegalo(id) {
  const usuario = obtenerUsuario();

  if (!usuario) {
    mensajeAcceso.textContent = "Ingresa tu correo e inicia sesión para descargar.";
    mostrarAcceso();
    return;
  }

  const archivo = ARCHIVOS_REGALOS[id];
  if (!archivo) return;

  const boton = document.getElementById("btnDescargarRegalo");
  if (boton) {
    boton.disabled = true;
    boton.textContent = "PROCESANDO...";
  }

  try {
    const resultado = await solicitarServidor({
      accion: "descargar",
      correo: usuario.correo
    });

    if (resultado.resultado === "ya_descargado") {
      usuario.descarga = "Descargado";
      guardarUsuario(usuario);
      alert("Este correo ya utilizó su descarga.");
      return;
    }

    if (resultado.resultado !== "descargado") {
      if (boton) {
        boton.disabled = false;
        boton.textContent = "DESCARGAR REGALO";
      }
      alert(resultado.mensaje || "No se pudo autorizar la descarga.");
      return;
    }

    usuario.descarga = "Descargado";
    guardarUsuario(usuario);

    const enlace = document.createElement("a");
    enlace.href = archivo;
    enlace.download = archivo.split("/").pop();
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  } catch (error) {
    console.error(error);
    if (boton) {
      boton.disabled = false;
      boton.textContent = "DESCARGAR REGALO";
    }
    alert("Error de conexión. No se pudo procesar la descarga.");
  }
}

window.descargarRegalo = descargarRegalo;

abrirAcceso?.addEventListener("click", mostrarAcceso);
cerrarAcceso?.addEventListener("click", ocultarAcceso);
modalAcceso?.addEventListener("click", event => {
  if (event.target === modalAcceso) ocultarAcceso();
});
btnRegistro?.addEventListener("click", () => ejecutarAcceso("registrar"));
btnLogin?.addEventListener("click", () => ejecutarAcceso("login"));

btnCerrarSesion?.addEventListener("click", () => {
  sessionStorage.removeItem("choclitos_usuario");
  actualizarEstadoBoton(false);
  mensajeAcceso.textContent = "Sesión cerrada.";
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modalAcceso?.classList.contains("active")) {
    ocultarAcceso();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = obtenerUsuario();
  if (!usuario) {
    actualizarEstadoBoton(false);
    return;
  }

  // Consulta el estado actualizado del correo, no solo el valor guardado en el navegador.
  try {
    const resultado = await solicitarServidor({
      accion: "login",
      correo: usuario.correo
    });
    if (resultado.resultado === "sesion_iniciada") {
      usuario.descarga = resultado.descarga || "Pendiente";
      guardarUsuario(usuario);
    } else {
      sessionStorage.removeItem("choclitos_usuario");
      actualizarEstadoBoton(false);
    }
  } catch (error) {
    console.warn("No se pudo actualizar el estado de descarga.", error);
    actualizarEstadoBoton(usuario.descarga === "Descargado");
  }
});
