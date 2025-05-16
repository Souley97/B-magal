/**
 * Script principal pour le site Magal Touba 2025
 * Gère l'initialisation et les interactions utilisateur
 */

/**
 * Fonction pour changer la langue de l'interface
 * @param {string} lang - Code de la langue (fr ou wo)
 */
function changeLang(lang) {
  // Vérifier si la langue demandée existe dans nos traductions
  if (!translations[lang]) {
    console.error("Langue non disponible:", lang);
    return;
  }

  // Traduire tous les éléments avec l'attribut data-translate
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[lang][key]) {
      element.textContent = translations[lang][key];
    } else {
      console.warn(`Clé de traduction non trouvée: ${key} pour la langue ${lang}`);
    }
  });
  
  // Traduction des attributs placeholder
  const placeholderElements = document.querySelectorAll("[data-translate-placeholder]");
  placeholderElements.forEach((element) => {
    const key = element.getAttribute("data-translate-placeholder");
    if (translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });
  
  // Mettre à jour les classes active sur les boutons de langue
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  
  const langBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
  if (langBtn) {
    langBtn.classList.add("active");
  }
  
  // Sauvegarder la préférence de langue
  localStorage.setItem("preferredLanguage", lang);
  
  // Mettre à jour les labels du compte à rebours
  if (typeof updateCountdown === 'function') {
    updateCountdown();
  } else {
    console.error("La fonction updateCountdown n'est pas disponible");
  }
  
  console.log(`Langue changée en: ${lang}`);
}

// Au chargement du document
document.addEventListener("DOMContentLoaded", function () {
  // Initialiser le compte à rebours
  if (typeof updateCountdown === 'function') {
    updateCountdown();
  }

  // ==========================================================
  // Gestion du popup de bienvenue
  // ==========================================================
  const welcomePopup = document.getElementById("welcome-popup");
  const welcomeClose = document.getElementById("welcome-close");

  // ==========================================================
  // Gestion du lecteur audio
  // ==========================================================
  const audioPlayer = document.getElementById("audio-player");
  const playBtn = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");
  const muteBtn = document.getElementById("mute-btn");
  const volumeIcon = document.getElementById("volume-icon");
  const loopBtn = document.getElementById("loop-btn");
  const progressBar = document.getElementById("progress-bar");
  const progress = document.getElementById("progress");
  const currentTimeDisplay = document.getElementById("current-time");
  const durationDisplay = document.getElementById("duration");
  const volumeBar = document.getElementById("volume-bar");
  const volumeLevel = document.getElementById("volume-level");
  const autoplayMessage = document.getElementById("autoplay-message");
  const startAudioBtn = document.getElementById("start-audio");

  // Initialisation du lecteur audio
  let isPlaying = false;
  let isMuted = false;
  let isLooping = true;
  loopBtn.classList.add("active");
  audioPlayer.loop = true;

  // ==========================================================
  // ÉVÉNEMENTS
  // ==========================================================

  // Fermeture du popup de bienvenue
  if (welcomeClose) {
    welcomeClose.addEventListener("click", function () {
      welcomePopup.classList.add("fade-out");
      setTimeout(() => {
        welcomePopup.style.display = "none";

        // Lancement de l'audio lors de la fermeture du popup
        audioPlayer
          .play()
          .then(() => {
            isPlaying = true;
            playIcon.className = "fas fa-pause";
            autoplayMessage.style.display = "none";
          })
          .catch(() => {
            // Si l'autoplay est bloqué, afficher le message
            autoplayMessage.style.display = "flex";
          });
      }, 500);
    });
  }

  // Bouton pour démarrer l'audio (quand l'autoplay est bloqué)
  if (startAudioBtn) {
    startAudioBtn.addEventListener("click", function () {
      audioPlayer.play().then(() => {
        isPlaying = true;
        playIcon.className = "fas fa-pause";
        autoplayMessage.style.display = "none";
      });
    });
  }

  // Lecture/Pause
  if (playBtn) {
    playBtn.addEventListener("click", function () {
      if (isPlaying) {
        audioPlayer.pause();
        playIcon.className = "fas fa-play";
      } else {
        audioPlayer.play();
        playIcon.className = "fas fa-pause";
      }
      isPlaying = !isPlaying;
    });
  }

  // Muet/Son
  if (muteBtn) {
    muteBtn.addEventListener("click", function () {
      audioPlayer.muted = !audioPlayer.muted;
      isMuted = audioPlayer.muted;
      if (isMuted) {
        volumeIcon.className = "fas fa-volume-mute";
        volumeLevel.style.width = "0%";
      } else {
        volumeIcon.className = "fas fa-volume-up";
        volumeLevel.style.width = `${audioPlayer.volume * 100}%`;
      }
    });
  }

  // Boucle activée/désactivée
  if (loopBtn) {
    loopBtn.addEventListener("click", function () {
      isLooping = !isLooping;
      audioPlayer.loop = isLooping;
      loopBtn.classList.toggle("active", isLooping);
    });
  }

  // Clic sur la barre de progression pour changer la position
  if (progressBar) {
    progressBar.addEventListener("click", function (e) {
      const percent = e.offsetX / this.offsetWidth;
      audioPlayer.currentTime = percent * audioPlayer.duration;
      updateProgress();
    });
  }

  // Clic sur la barre de volume pour changer le volume
  if (volumeBar) {
    volumeBar.addEventListener("click", function (e) {
      const percent = e.offsetX / this.offsetWidth;
      audioPlayer.volume = percent;
      volumeLevel.style.width = `${percent * 100}%`;

      if (percent === 0) {
        volumeIcon.className = "fas fa-volume-mute";
        audioPlayer.muted = true;
        isMuted = true;
      } else {
        volumeIcon.className = "fas fa-volume-up";
        audioPlayer.muted = false;
        isMuted = false;
      }
    });
  }

  // Mise à jour de la barre de progression pendant la lecture
  if (audioPlayer) {
    audioPlayer.addEventListener("timeupdate", updateProgress);

    // Fin de l'audio
    audioPlayer.addEventListener("ended", function () {
      if (!isLooping) {
        isPlaying = false;
        playIcon.className = "fas fa-play";
      }
    });
  }

  // ==========================================================
  // Fenêtre modale d'information
  // ==========================================================
  const infoBtn = document.getElementById("info-btn");
  const infoModal = document.getElementById("info-modal");
  const closeModal = document.querySelector(".close-modal");

  // Afficher la modal
  if (infoBtn && infoModal) {
    infoBtn.addEventListener("click", function () {
      infoModal.style.display = "flex";
      setTimeout(() => {
        infoModal.classList.add("show");
      }, 10);
    });
  }

  // Fermer la modal
  if (closeModal && infoModal) {
    closeModal.addEventListener("click", function () {
      infoModal.classList.remove("show");
      setTimeout(() => {
        infoModal.style.display = "none";
      }, 300);
    });
  }

  // ==========================================================
  // Fonctionnalité "Lire la suite"
  // ==========================================================
  const readMoreBtn = document.getElementById("read-more-btn");
  const moreText = document.getElementById("more-text");

  if (readMoreBtn && moreText) {
    readMoreBtn.addEventListener("click", function () {
      moreText.classList.toggle("show");
      const currentLang = localStorage.getItem("preferredLanguage") || "fr";

      if (moreText.classList.contains("show")) {
        const readLessText = translations[currentLang]["read-less"];
        readMoreBtn.innerHTML = `${readLessText} <i class="fas fa-angle-up"></i>`;
      } else {
        const readMoreText = translations[currentLang]["read-more"];
        readMoreBtn.innerHTML = `${readMoreText} <i class="fas fa-angle-down"></i>`;
      }
    });
  }

  // ==========================================================
  // Gestion du slider d'images
  // ==========================================================
  initializeSlider();

  // ==========================================================
  // Gestion des notifications et du partage
  // ==========================================================
  if (document.getElementById("notify-btn")) {
    document.getElementById("notify-btn").addEventListener("click", function () {
      const currentLang = localStorage.getItem("preferredLanguage") || "fr";
      const message =
        currentLang === "fr"
          ? "Vous serez notifié avant le Magal 2025!"
          : "Dina ñu la yégal balaa Magal 2025 bi!";
      alert(message);
    });
  }

  // Partage WhatsApp
  if (document.getElementById("share-btn")) {
    document.getElementById("share-btn").addEventListener("click", function () {
      const currentLang = localStorage.getItem("preferredLanguage") || "fr";
      const shareMessage =
        currentLang === "fr"
          ? "Je partage avec vous le compte à rebours du Magal Touba 2025! Visitez : "
          : "Séddé naa ak yaw waxtaanu Magal Touba 2025 bi! Xoolal : ";

      const message = encodeURIComponent(shareMessage + window.location.href);
      // Utiliser une URL WhatsApp directe sans numéro spécifique
      const whatsappURL = `https://api.whatsapp.com/send?text=${message}`;
      window.open(whatsappURL, "_blank");
    });
  }

  // Animation des infos des khalifes
  const khalifeInfos = document.querySelectorAll(".khalife-info");
  khalifeInfos.forEach((info) => {
    info.addEventListener("click", function () {
      this.style.transform = "scale(1.02)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 300);
    });
  });

  // ==========================================================
  // Initialisation de la langue
  // ==========================================================
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "fr";
  changeLang(preferredLanguage);

  // Gestion des boutons de langue
  const langButtons = document.querySelectorAll(".lang-btn");
  console.log("Boutons de langue trouvés:", langButtons.length);
  
  langButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const lang = this.getAttribute("data-lang");
      console.log("Bouton de langue cliqué:", lang);
      changeLang(lang);
    });
  });

  // Volume initial
  if (audioPlayer && volumeLevel) {
    audioPlayer.volume = 0.7;
    volumeLevel.style.width = "70%";
  }
});

/**
 * Mise à jour de la barre de progression et de l'affichage du temps
 */
function updateProgress() {
  const audioPlayer = document.getElementById("audio-player");
  const progress = document.getElementById("progress");
  const currentTimeDisplay = document.getElementById("current-time");
  const durationDisplay = document.getElementById("duration");

  if (!audioPlayer || !progress || !currentTimeDisplay || !durationDisplay) {
    return;
  }

  const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progress.style.width = `${percent}%`;
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);

  // Si l'audio est chargé, afficher la durée
  if (!isNaN(audioPlayer.duration)) {
    durationDisplay.textContent = formatTime(audioPlayer.duration);
  }
}

/**
 * Formater le temps en MM:SS
 * @param {number} seconds - Le temps en secondes
 * @return {string} - Le temps formaté
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${
    minutes < 10 ? "0" : ""
  }${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

/**
 * Initialiser le slider d'images
 */
function initializeSlider() {
  const slider = document.getElementById("image-slider");
  if (!slider) {
    console.warn("Slider non trouvé");
    return;
  }
  
  const slides = slider.querySelectorAll(".slide");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const dotsContainer = document.getElementById("slider-dots");

  if (!slides.length || !prevBtn || !nextBtn || !dotsContainer) {
    console.warn("Éléments du slider manquants");
    return;
  }

  let currentSlide = 0;
  let slideInterval;
  const autoPlayDelay = 5000; // 5 seconds

  // Créer les points indicateurs basés sur le nombre de slides
  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      clearInterval(slideInterval);
      goToSlide(index);
      startAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });

  function goToSlide(n) {
    slides[currentSlide].classList.remove("active");
    document
      .querySelectorAll(".dot")
      [currentSlide].classList.remove("active");

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    document
      .querySelectorAll(".dot")
      [currentSlide].classList.add("active");
  }

  function startAutoPlay() {
    slideInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, autoPlayDelay);
  }

  // Contrôles du slider
  prevBtn.addEventListener("click", () => {
    clearInterval(slideInterval);
    goToSlide(currentSlide - 1);
    startAutoPlay();
  });

  nextBtn.addEventListener("click", () => {
    clearInterval(slideInterval);
    goToSlide(currentSlide + 1);
    startAutoPlay();
  });

  // Pause de l'autoplay au survol
  slider.addEventListener("mouseenter", () => {
    clearInterval(slideInterval);
  });

  slider.addEventListener("mouseleave", () => {
    startAutoPlay();
  });

  // Événements tactiles pour mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      clearInterval(slideInterval);
    },
    false
  );

  slider.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoPlay();
    },
    false
  );

  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      // Swipe vers la gauche, aller à la slide suivante
      goToSlide(currentSlide + 1);
    } else if (touchEndX > touchStartX + 50) {
      // Swipe vers la droite, aller à la slide précédente
      goToSlide(currentSlide - 1);
    }
  }

  // Démarrer l'autoplay au chargement
  startAutoPlay();
} 