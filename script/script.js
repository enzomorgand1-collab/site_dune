
    let etatLecteur;

      function lecteurPret(event) {
        // event.target = lecteur
        event.target.setVolume(50);
      }

      function changementLecteur(event) {
        // event.data = état du lecteur
        etatLecteur = event.data;
      }

      let lecteur;

      function onYouTubeIframeAPIReady() {
        lecteur = new YT.Player("video", {
          height: "390",
          width: "640",
          videoId: "8g18jFHCLXk",
          playerVars: {
            color: "white",
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0
          },
          events: {
            onReady: lecteurPret,
            onStateChange: changementLecteur
          }
        });
      }

      // Hauteur de la vidéo
      const hauteurVideo = $("#video").height();
      // Position Y de la vidéo
      const posYVideo = $("#video").offset().top;
      // Valeur declenchant la modification de l'affichage (choix "esthétique")
      const seuil = posYVideo + 0.75 * hauteurVideo;
      // Gestion du défilement
      console.log("Seuil : " + seuil);  
      $(".scroller").scroll(function () {
        // Récupération de la valeur du défilement vertical
        const scroll = $(".scroller").scrollTop();

        // Classe permettant l'exécution du CSS
        $("#video").toggleClass(
          "scroll",
          etatLecteur === YT.PlayerState.PLAYING && scroll > seuil
        );
      });


// Variable globale
// Variable d'index par carrousel (au lieu d'une seule variable globale)
let indexCharacters = 0;
let indexGallery = 0;

// Carrousel Characters
$('.characters-thumbnails span').click(function () {
  const indexN = $('.characters-thumbnails span').index(this);
  $('.characters-images img').eq(indexCharacters).fadeOut(1000)
    .end().eq(indexN).fadeIn(1000);
  indexCharacters = indexN;
});

// Carrousel Gallery
$('.gallery-thumbnails span').click(function () {
  const indexN = $('.gallery-thumbnails span').index(this);
  $('.gallery-images img').eq(indexGallery).fadeOut(1000)
    .end().eq(indexN).fadeIn(1000);
  indexGallery = indexN;
});
// Appelée si récupération des coordonnées réussie
function positionSucces(position) {
  // Injection du résultat dans du texte
  const lat = Math.round(1000 * position.coords.latitude) / 1000;
  const long = Math.round(1000 * position.coords.longitude) / 1000;
  $(".localisation").text(`Latitude: ${lat}°, Longitude: ${long}°`);
}

// Appelée si échec de récuparation des coordonnées
function positionErreur(erreurPosition) {
  // Cas d'usage du switch !
  let natureErreur;
  switch (erreurPosition.code) {
    case erreurPosition.TIMEOUT:
      // Attention, durée par défaut de récupération des coordonnées infini
      natureErreur = "La géolocalisation prends trop de temps...";
      break;
    case erreurPosition.PERMISSION_DENIED:
      natureErreur = "Vous n'avez pas autorisé la géolocalisation.";
      break;
    case erreurPosition.POSITION_UNAVAILABLE:
      natureErreur = "Votre position n'a pu être déterminée.";
      break;
    default:
      natureErreur = "Une erreur inattendue s'est produite.";
  }
  // Injection du texte
  $(".localisation").text(natureErreur);
}

// Récupération des coordonnées au clic sur le bouton
$("button").click(function () {
  // Support de la géolocalisation
  if ("geolocation" in navigator) {
    // Support = exécution du callback selon le résultat
    navigator.geolocation.getCurrentPosition(positionSucces, positionErreur, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 30000
    });
  } else {
    // Non support = injection de texte
    $(".localisation").text("La géolocalisation n'est pas supportée par votre navigateur");
  }
});

// Création de la carte, vide à ce stade
let carte = L.map('carte', {
  center: [47.2608333, 2.4188888888888886], // Centre de la France
  zoom: 5,
  minZoom: 4,
  maxZoom: 19,
});

// Ajout des tuiles (ici OpenStreetMap)
// https://wiki.openstreetmap.org/wiki/Tiles#Servers
L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
}).addTo(carte);

// Ajout de l'échelle
L.control.scale().addTo(carte);
L.control.scale().addTo(carte);

// ===== Cast and Crew (API TMDB) =====
// ===== Cast and Crew (API REST Wikipedia, sans clé) =====
const WIKI = "https://en.wikipedia.org/api/rest_v1/page/summary/";

const acteurs = [
  "Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Jason Momoa",
  "Stellan Skarsgård", "Stephen McKinley Henderson", "Josh Brolin",
  "Javier Bardem", "Sharon Duncan-Brewster", "Chang Chen",
  "Dave Bautista", "David Dastmalchian", "Zendaya",
  "Charlotte Rampling", "Babs Olusanmokun"
];

async function chargerActeur(nom) {
  const reponse = await fetch(WIKI + encodeURIComponent(nom.replace(/ /g, "_")));
  if (!reponse.ok) throw new Error(nom + " : erreur " + reponse.status);
  return reponse.json();
}

function afficherFiche(p) {
  $(".cast-photo").attr({ src: p.thumbnail ? p.thumbnail.source : "", alt: p.title });
  $(".cast-name").text(p.title);
  $(".cast-birthday").text(p.description || "");
  $(".cast-place").text("");
  $(".cast-bio").text(p.extract || "");
}

async function initCasting() {
  const resultats = await Promise.allSettled(acteurs.map(chargerActeur));
  const fiches = resultats
    .filter(r => r.status === "fulfilled" && r.value.thumbnail)
    .map(r => r.value);

  resultats
    .filter(r => r.status === "rejected")
    .forEach(r => console.error(r.reason));

  if (fiches.length === 0) {
    $(".cast-bio").text("Impossible de charger le casting.");
    return;
  }

  fiches.forEach(p => {
    $("<img>")
      .attr({ src: p.thumbnail.source, alt: p.title, title: p.title })
      .click(() => afficherFiche(p))
      .appendTo(".cast-grid");
  });
  afficherFiche(fiches[0]);
}
initCasting();