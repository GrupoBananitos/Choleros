"use strict";


const URL_APPS_SCRIPT =
  "https://script.google.com/macros/s/AKfycbz-3bjJTxuLsIC1fyHmsi-beL6h9YZ4JEMOuyNde9XQURorrg1aHM4brVDIaBKoYBdk/exec";

const ARCHIVOS_REGALOS = {
  "las-fijas": "assets/pdfs/las-fijas.pdf",
  "alimentacion-saludable": "assets/pdfs/alimentacion-saludable.pdf",
  "planeacion-fit": "assets/pdfs/planeacion-fit.pdf"
};

const CLAVE_SESION = "choclitos_usuario";

const modalAcceso = document.getElementById("subscribeModal");
const abrirAcceso = document.getElementById("openSubscribe");
const cerrarAcceso = document.getElementById("closeSubscribe");

const campoCorreo = document.getElementById("subscriberEmail");
const mensajeAcceso = document.getElementById("subscribeMessage");

const btnRegistro = document.getElementById("btnRegistro");
const btnLogin = document.getElementById("btnLogin");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

let campoCodigo = document.getElementById("verificationCode");
let btnVerificarCodigo = document.getElementById("btnVerificarCodigo");

let correoPendiente = null;
let solicitudEnCurso = false;

async function solicitarServidor(datos) {
  const response = await fetch(URL_APPS_SCRIPT, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify(datos)
  });

  const texto = await response.text();

  if (!response.ok) {
    throw new Error(
      "Error HTTP " + response.status
    );
  }

  let resultado;

  try {
    resultado = JSON.parse(texto);
  } catch (error) {
    console.error("RESPUESTA NO JSON:", texto);

    throw new Error(
      "Google Apps Script no devolvió JSON válido."
    );
  }

  console.log(
    "RESPUESTA DE GOOGLE APPS SCRIPT:",
    datos.accion,
    resultado
  );

  return resultado;
}

function mostrarMensaje(mensaje) {
  if (mensajeAcceso) {
    mensajeAcceso.textContent = mensaje;
  }
}

function normalizarResultado(resultado) {
  return String(resultado || "")
    .trim()
    .toLowerCase();
}

function obtenerUsuario() {
  try {
    return JSON.parse(
      sessionStorage.getItem(CLAVE_SESION) || "null"
    );
  } catch {
    return null;
  }
}

function guardarUsuario(usuario) {
  sessionStorage.setItem(
    CLAVE_SESION,
    JSON.stringify(usuario)
  );

  actualizarEstadoBoton(
    usuario.descarga === "Descargado"
  );
}

function cerrarSesionLocal() {
  sessionStorage.removeItem(CLAVE_SESION);
  actualizarEstadoBoton(false);
}


function actualizarEstadoBoton(descargado) {
  const boton = document.getElementById(
    "btnDescargarRegalo"
  );

  if (!boton) return;

  boton.disabled = Boolean(descargado);

  boton.textContent = descargado
    ? "DESCARGA UTILIZADA"
    : "DESCARGAR REGALO";
}

function validarCorreo() {
  if (!campoCorreo) {
    mostrarMensaje(
      "No se encontró el campo de correo electrónico."
    );
    return null;
  }

  const correo = campoCorreo.value
    .trim()
    .toLowerCase();

  if (!correo || !campoCorreo.checkValidity()) {
    campoCorreo.reportValidity();
    return null;
  }

  return correo;
}


function prepararVerificacion() {
  let contenedor = document.getElementById(
    "verificationContainer"
  );

  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "verificationContainer";
    contenedor.style.display = "none";
    contenedor.style.marginTop = "15px";

    if (mensajeAcceso?.parentElement) {
      mensajeAcceso.parentElement.insertBefore(
        contenedor,
        mensajeAcceso
      );
    } else if (modalAcceso) {
      modalAcceso.appendChild(contenedor);
    }
  }

  campoCodigo = document.getElementById(
    "verificationCode"
  );

  if (!campoCodigo) {
    campoCodigo = document.createElement("input");

    campoCodigo.type = "text";
    campoCodigo.id = "verificationCode";
    campoCodigo.placeholder = "Código de 6 dígitos";
    campoCodigo.maxLength = 6;
    campoCodigo.inputMode = "numeric";
    campoCodigo.autocomplete = "one-time-code";

    campoCodigo.style.width = "100%";
    campoCodigo.style.boxSizing = "border-box";

    contenedor.appendChild(campoCodigo);
  }

  btnVerificarCodigo = document.getElementById(
    "btnVerificarCodigo"
  );

  if (!btnVerificarCodigo) {
    btnVerificarCodigo = document.createElement("button");

    btnVerificarCodigo.type = "button";
    btnVerificarCodigo.id = "btnVerificarCodigo";
    btnVerificarCodigo.textContent = "VERIFICAR CÓDIGO";

    btnVerificarCodigo.style.marginTop = "10px";

    contenedor.appendChild(btnVerificarCodigo);
    btnVerificarCodigo.className = btnRegistro.className;
  }

  btnVerificarCodigo.onclick = verificarRegistro;
}

function mostrarCampoVerificacion(mostrar) {
  const contenedor = document.getElementById(
    "verificationContainer"
  );

  if (contenedor) {
    contenedor.style.display = mostrar
      ? "block"
      : "none";
  }

  if (campoCodigo) {
    campoCodigo.value = "";
  }
}


function mostrarAcceso() {
  if (!modalAcceso) return;

  modalAcceso.classList.add("active");
  modalAcceso.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  setTimeout(() => {
    campoCorreo?.focus();
  }, 150);
}

function ocultarAcceso() {
  if (!modalAcceso) return;

  modalAcceso.classList.remove("active");
  modalAcceso.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

async function registrarUsuario() {
  if (solicitudEnCurso) return;

  const correo = validarCorreo();

  if (!correo) return;

  solicitudEnCurso = true;

  const textoOriginal = btnRegistro?.textContent;

  if (btnRegistro) {
    btnRegistro.disabled = true;
    btnRegistro.textContent = "ENVIANDO CÓDIGO...";
  }

  mostrarMensaje("");

  try {
    const resultado = await solicitarServidor({
      accion: "sendCode",
      correo: correo
    });

    const estado = normalizarResultado(
      resultado.resultado
    );

    if (
      [
        "codigo_enviado",
        "enviado",
        "ok",
        "success"
      ].includes(estado)
    ) {
      correoPendiente = correo;

      mostrarCampoVerificacion(true);

      mostrarMensaje(
        "Código enviado correctamente. Revisa tu correo e ingresa los 6 dígitos."
      );

      campoCorreo.disabled = true;

      campoCodigo?.focus();

    } else if (
      estado === "duplicado" ||
      estado === "ya_registrado"
    ) {
      mostrarMensaje(
        "Este correo ya está registrado. Inicia sesión."
      );

    } else {
      console.error(
        "RESPUESTA INESPERADA AL ENVIAR CÓDIGO:",
        resultado
      );

      mostrarMensaje(
        resultado.mensaje ||
        "El servidor respondió: " +
        JSON.stringify(resultado)
      );
    }

  } catch (error) {
    console.error(
      "ERROR AL ENVIAR CÓDIGO:",
      error
    );

    mostrarMensaje(
      "Error de comunicación: " + error.message
    );

  } finally {
    solicitudEnCurso = false;

    if (btnRegistro) {
      btnRegistro.disabled = false;
      btnRegistro.textContent =
        textoOriginal || "Registrarme";
    }
  }
}


async function verificarRegistro() {
  if (solicitudEnCurso) return;

  if (!correoPendiente) {
    mostrarMensaje(
      "Primero solicita un código de verificación."
    );
    return;
  }

  const codigo = (
    campoCodigo?.value || ""
  ).trim();

  if (!/^\d{6}$/.test(codigo)) {
    mostrarMensaje(
      "Ingresa un código válido de 6 dígitos."
    );

    campoCodigo?.focus();
    return;
  }

  solicitudEnCurso = true;

  const textoOriginal =
    btnVerificarCodigo.textContent;

  btnVerificarCodigo.disabled = true;
  btnVerificarCodigo.textContent = "VERIFICANDO...";

  mostrarMensaje("");

  try {
    const resultado = await solicitarServidor({
      accion: "verifyCode",
      correo: correoPendiente,
      codigo: codigo
    });

    const estado = normalizarResultado(
      resultado.resultado
    );

    if (
      [
        "registrado",
        "verificado",
        "verificado_correctamente"
      ].includes(estado)
    ) {
      guardarUsuario({
        id: resultado.id || "",
        correo: correoPendiente,
        descarga: "Pendiente"
      });

      correoPendiente = null;

      campoCorreo.disabled = false;

      mostrarCampoVerificacion(false);

      mostrarMensaje(
        "¡Registro completado! Ya puedes utilizar tu regalo."
      );

    } else {
      mostrarMensaje(
        resultado.mensaje ||
        "El código es incorrecto o ha expirado."
      );
    }

  } catch (error) {
    console.error(
      "ERROR AL VERIFICAR CÓDIGO:",
      error
    );

    mostrarMensaje(
      "Error de comunicación: " + error.message
    );

  } finally {
    solicitudEnCurso = false;

    btnVerificarCodigo.disabled = false;
    btnVerificarCodigo.textContent =
      textoOriginal || "VERIFICAR CÓDIGO";
  }
}


async function iniciarSesion() {
  if (solicitudEnCurso) return;

  const correo = validarCorreo();

  if (!correo) return;

  solicitudEnCurso = true;

  const textoOriginal = btnLogin?.textContent;

  if (btnLogin) {
    btnLogin.disabled = true;
    btnLogin.textContent = "INGRESANDO...";
  }

  mostrarMensaje("");

  try {
    const resultado = await solicitarServidor({
      accion: "login",
      correo: correo
    });

    const estado = normalizarResultado(
      resultado.resultado
    );

    if (estado === "sesion_iniciada") {
      guardarUsuario({
        id: resultado.id || "",
        correo: correo,
        descarga: resultado.descarga || "Pendiente"
      });

      mostrarCampoVerificacion(false);

      mostrarMensaje(
        "Sesión iniciada correctamente."
      );

    } else if (estado === "no_registrado") {
      mostrarMensaje(
        "Este correo no está registrado. Regístrate primero."
      );

    } else {
      mostrarMensaje(
        resultado.mensaje ||
        "No se pudo iniciar sesión."
      );
    }

  } catch (error) {
    console.error(
      "ERROR AL INICIAR SESIÓN:",
      error
    );

    mostrarMensaje(
      "Error de comunicación: " + error.message
    );

  } finally {
    solicitudEnCurso = false;

    if (btnLogin) {
      btnLogin.disabled = false;
      btnLogin.textContent =
        textoOriginal || "Iniciar sesión";
    }
  }
}


async function descargarRegalo(id) {
  if (solicitudEnCurso) return;

  const usuario = obtenerUsuario();

  if (!usuario) {
    mostrarMensaje(
      "Ingresa tu correo e inicia sesión para descargar."
    );

    mostrarAcceso();
    return;
  }

  const archivo = ARCHIVOS_REGALOS[id];

  if (!archivo) {
    alert("No se encontró el archivo del regalo.");
    return;
  }

  if (usuario.descarga === "Descargado") {
    actualizarEstadoBoton(true);

    alert(
      "Este correo ya utilizó su única descarga."
    );

    return;
  }

  solicitudEnCurso = true;

  const boton = document.getElementById(
    "btnDescargarRegalo"
  );

  if (boton) {
    boton.disabled = true;
    boton.textContent = "PROCESANDO...";
  }

  try {
    const resultado = await solicitarServidor({
      accion: "descargar",
      correo: usuario.correo
    });

    const estado = normalizarResultado(
      resultado.resultado
    );

    if (estado === "ya_descargado") {
      usuario.descarga = "Descargado";
      guardarUsuario(usuario);

      alert(
        "Este correo ya utilizó su única descarga."
      );

      return;
    }

    if (estado !== "descargado") {
      actualizarEstadoBoton(false);

      alert(
        resultado.mensaje ||
        "El servidor no autorizó la descarga."
      );

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
    console.error(
      "ERROR AL DESCARGAR REGALO:",
      error
    );

    alert(
      "No se pudo confirmar la descarga. Comprueba tu conexión y vuelve a iniciar sesión para actualizar el estado."
    );

    await actualizarSesion();

  } finally {
    solicitudEnCurso = false;
  }
}

window.descargarRegalo = descargarRegalo;


async function actualizarSesion() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    actualizarEstadoBoton(false);
    return;
  }

  try {
    const resultado = await solicitarServidor({
      accion: "login",
      correo: usuario.correo
    });

    const estado = normalizarResultado(
      resultado.resultado
    );

    if (estado === "sesion_iniciada") {
      usuario.descarga =
        resultado.descarga || "Pendiente";

      guardarUsuario(usuario);

    } else if (estado === "no_registrado") {
      cerrarSesionLocal();
    }

  } catch (error) {
    console.warn(
      "No se pudo actualizar la sesión:",
      error
    );

    actualizarEstadoBoton(
      usuario.descarga === "Descargado"
    );
  }
}

function cerrarSesion() {
  cerrarSesionLocal();

  correoPendiente = null;

  if (campoCorreo) {
    campoCorreo.disabled = false;
    campoCorreo.value = "";
  }

  mostrarCampoVerificacion(false);

  mostrarMensaje("Sesión cerrada correctamente.");
}


function inicializarUsuarios() {
  prepararVerificacion();
  btnVerificarCodigo.style.display = "block";
btnVerificarCodigo.style.margin = "10px auto 0";

  abrirAcceso?.addEventListener(
    "click",
    mostrarAcceso
  );

  cerrarAcceso?.addEventListener(
    "click",
    ocultarAcceso
  );

  modalAcceso?.addEventListener(
    "click",
    event => {
      if (event.target === modalAcceso) {
        ocultarAcceso();
      }
    }
  );

  btnRegistro?.addEventListener(
    "click",
    registrarUsuario
  );

  btnLogin?.addEventListener(
    "click",
    iniciarSesion
  );

  btnCerrarSesion?.addEventListener(
    "click",
    cerrarSesion
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        modalAcceso?.classList.contains("active")
      ) {
        ocultarAcceso();
      }
    }
  );

  actualizarSesion();
}


if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    inicializarUsuarios
  );
} else {
  inicializarUsuarios();
}
