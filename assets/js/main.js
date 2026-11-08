
document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");

  if (menuToggle && navigation) {
    const currentPage = document.body.classList.contains("home-page")
      ? "home"
      : document.body.classList.contains("crew-page")
        ? "crew"
        : document.body.classList.contains("technology-page")
          ? "technology"
          : "destination";

    navigation.querySelectorAll("a[data-page]").forEach(link => {
      const isCurrent = link.dataset.page === currentPage;
      link.classList.toggle("active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const destinations = {
    moon: {
      name: "Futbol",
      image: "assets/images/deporte-futbol.jpg",
      description: "Ofrecemos entrenamientos, actividades recreativas, alquiler de canchas y programas de formación deportiva, buscando fomentar un estilo de vida saludable y convertir la pasión por el deporte en una experiencia divertida y enriquecedora para todos. (incluye arbitro e implementos)",
      distance: "s/1500",
      time: "1 DIA"
    },

    mars: {
      name: "Tenis",
      image: "assets/images/deporte-tenis.jpg",
      description: "Ofrecemos clases de tenis para principiantes y avanzados, alquiler de canchas y entrenamiento personalizado para mejorar la técnica, coordinación y resistencia física.",
      distance: "s/80",
      time: "1 HORA"
    },

    europa: {
      name: "Basquet",
      image: "assets/images/deporte-basquet.jpg",
      description: "Ofrecemos clases de básquet para niños, jóvenes y adultos, con entrenamientos enfocados en mejorar la técnica, velocidad, coordinación y trabajo en equipo.",
      distance: "s/120",
      time: "2 HORA"
    },

    titan: {
      name: "Natación",
      image: "assets/images/deporte-natacion.jpg",
      description: "Ofrecemos clases de natación para niños, jóvenes y adultos, desde nivel principiante hasta avanzado, enfocadas en mejorar la técnica, resistencia y seguridad en el agua.",
      distance: "s/ 200",
      time: "1 HORA"
    }
  };

  const planetImage = document.getElementById("planetImage");

  if (planetImage) {
    const planetName = document.getElementById("planetName");
    const planetDescription = document.getElementById("planetDescription");
    const planetDistance = document.getElementById("planetDistance");
    const planetTime = document.getElementById("planetTime");
    const tabs = document.querySelectorAll(".tab");

    function changeDestination(destination) {
      const selected = destinations[destination];

      if (!selected) return;

      tabs.forEach(tab => {
        const active = tab.dataset.planet === destination;

        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", active);
      });

      planetImage.style.opacity = "0";

      setTimeout(() => {
        planetImage.src = selected.image;
        planetImage.alt = selected.name;

        planetName.textContent = selected.name;
        planetDescription.textContent = selected.description;
        planetDistance.textContent = selected.distance;
        planetTime.textContent = selected.time;

        planetImage.style.opacity = "1";
      }, 200);

      history.replaceState(null, "", `#destination/${destination}`);
    }

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        changeDestination(tab.dataset.planet);
      });
    });

    const initial = location.hash.split("/")[1];

    if (destinations[initial]) {
      changeDestination(initial);
    }

    tabs.forEach(tab => {
      if (tab.dataset.planet === "moon") {
        tab.setAttribute("aria-pressed", "true");
      } else {
        tab.setAttribute("aria-pressed", "false");
      }
    });
  }

  const crewImage = document.getElementById("crewImage");

  if (crewImage) {

    const crew = [
      {
        role: "Salud y bienestar",
        name: "Tu salud es nuestro mayor objetivo",
        image: "assets/images/beneficio-salud.png",
        description: "En CHOCLITOS SPORT nos preocupamos por tu bienestar integral. Ofrecemos servicios de evaluación física, rutinas personalizadas, monitoreo del progreso, asesoría nutricional y recuperación muscular, con el objetivo de mejorar tu condición física, prevenir lesiones y fomentar un estilo de vida saludable."
      },

      {
        role: "Formación deportiva",
        name: "Encuentra tu desecriplina ideal",
        image: "assets/images/beneficio-deporte.png",
        description: "Promovemos el desarrollo de habilidades deportivas mediante programas de entrenamiento en diferentes disciplinas como fútbol, tenis, básquet y natación. Contamos con espacios equipados, instructores capacitados y actividades para todas las edades, fomentando el trabajo en equipo, la disciplina y la pasión por el deporte."
      },

      {
        role: " Promociones y beneficios",
        name: "Más deporte, más diversión y mejores precios",
        image: "assets/images/beneficio-promociones.png",
        description: "Queremos que todos disfruten del deporte, por eso ofrecemos promociones especiales, descuentos en alquiler de canchas, paquetes deportivos y planes familiares. Aprovecha nuestras ofertas exclusivas y disfruta de nuestras instalaciones mientras cuidas tu salud y compartes momentos inolvidables."
      },

      {
        role: "Guías y recursos gratuitos",
        name: " «Entrena y mejora desde cualquier lugar».",
        image: "assets/images/imagen-suscripcion.png",
        description: "queremos acompañarte dentro y fuera de nuestras instalaciones. Por eso ofrecemos recursos digitales gratuitos en formato PDF, diseñados para ayudarte a mejorar tu rendimiento deportivo, aprender nuevas técnicas y adoptar hábitos saludables. Descarga nuestras guías y disfruta de consejos prácticos para alcanzar tus objetivos."
      }
    ];

    const crewRole = document.getElementById("crewRole");
    const crewName = document.getElementById("crewName");
    const crewDescription = document.getElementById("crewDescription");
    const crewDots = document.querySelectorAll(".crew-dot");

    function changeCrew(index) {
      const member = crew[index];

      if (!member) return;

      crewDots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-pressed", i === index);
      });

      crewImage.style.opacity = "0";

      setTimeout(() => {
        crewImage.src = member.image;
        crewImage.alt = member.name;

        crewRole.textContent = member.role;
        crewName.textContent = member.name;
        crewDescription.textContent = member.description;

        crewImage.style.opacity = "1";
      }, 200);
    }

    crewDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        changeCrew(index);
      });
    });

    changeCrew(0);
  }

  const technologyImage = document.getElementById("technologyImage");

  if (technologyImage) {

   const technologies = [
    {
        id: "las-fijas",
        name: "Las fijas",
        image: "assets/images/regalo-las-fijas.png",
        description: "Predicciones para la Champions League"
    },
    {
        id: "alimentacion-saludable",
        name: "Alimentación Saludable",
        image: "assets/images/regalo-alimentacion-saludable.png",
        description: "Guía de alimentación saludable"
    },
    {
        id: "planeacion-fit",
        name: "Planeación Fit",
        image: "assets/images/regalo-planeacion-fit.png",
        description: "Guía fitness para un buen proceso desde casa"
    }
];

    const technologyName = document.getElementById("technologyName");
    const technologyDescription = document.getElementById("technologyDescription");
    const technologyTabs = document.querySelectorAll(".technology-tab");
    const botonDescarga = document.getElementById("btnDescargarRegalo");

    function changeTechnology(index) {
      const technology = technologies[index];

      if (!technology) return;

      technologyTabs.forEach((tab, i) => {
        tab.classList.toggle("active", i === index);
        tab.setAttribute("aria-pressed", i === index);
      });

      technologyImage.style.opacity = "0";

      setTimeout(() => {
        technologyImage.src = technology.image;
        technologyImage.alt = technology.name;

        technologyName.textContent = technology.name;
        technologyDescription.textContent = technology.description;

        if (botonDescarga) {
          botonDescarga.dataset.regalo = technology.id;
          botonDescarga.disabled = false;
          botonDescarga.textContent = "DESCARGAR REGALO";
        }

        technologyImage.style.opacity = "1";
      }, 200);
    }

    technologyTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        changeTechnology(index);
      });
    });

    changeTechnology(0);
  }

  


});

(() => {
    const cursor = document.getElementById("football-cursor");
    const particles = document.getElementById("football-particles");

    if (!cursor || !particles ||
        !window.matchMedia("(pointer: fine)").matches) return;

    let x = 0;
    let y = 0;
    let targetRotation = 0;
    let lastX = 0;
    let lastY = 0;
    let lastParticle = 0;

    document.addEventListener("mousemove", (e) => {
        const dx = e.clientX - x;
        const dy = e.clientY - y;

        targetRotation += dx * 1.5;

        x = e.clientX;
        y = e.clientY;

        cursor.style.transform =
            `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${targetRotation}deg)`;

        const distance = Math.hypot(x - lastX, y - lastY);
        const now = performance.now();

        if (distance > 5 && now - lastParticle > 25) {
            createParticle(x, y);
            lastX = x;
            lastY = y;
            lastParticle = now;
        }
    });

    function createParticle(x, y) {
        const particle = document.createElement("span");

        particle.className = "football-particle";

        const size = Math.random() * 6 + 3;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 35 + 15;

        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.left = x + "px";
        particle.style.top = y + "px";

        particle.style.background =
            Math.random() > 0.5 ? "#16a34a" : "#ffffff";

        particle.style.setProperty(
            "--move-x",
            Math.cos(angle) * distance + "px"
        );

        particle.style.setProperty(
            "--move-y",
            Math.sin(angle) * distance + "px"
        );

        particles.appendChild(particle);

        particle.addEventListener("animationend", () => {
            particle.remove();
        });
    }
})();