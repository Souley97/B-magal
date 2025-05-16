/**
 * Système de compte à rebours pour Magal Touba 2025
 * Gère l'affichage du compte à rebours principal et celui du popup de bienvenue
 */

/**
 * Met à jour le compte à rebours principal
 */
function updateCountdown() {
  const eventDate = moment("2025-08-13T00:00:00");
  const now = moment();
  const diff = moment.preciseDiff(now, eventDate, true);

  // Obtenir la langue actuelle
  const currentLang = localStorage.getItem("preferredLanguage") || "fr";

  const intervals = ["months", "days", "hours", "minutes", "seconds"];
  const labels = intervals.map(
    (interval) => translations[currentLang][interval]
  );

  let html = "";

  for (let i = 0; i < intervals.length; i++) {
    let val = diff[intervals[i]];
    val = val < 10 ? "0" + val : val;
    html += `
      <div class="box">
          <div class="value">${val}</div>
          <div class="label">${labels[i]}</div>
      </div>
      `;
  }

  document.getElementById("output").innerHTML = html;

  // Update welcome popup countdown too
  if (document.getElementById("welcome-countdown")) {
    updateWelcomeCountdown(diff, currentLang);
  }
}

/**
 * Met à jour le compte à rebours circulaire dans le popup de bienvenue
 * @param {Object} diff - L'objet différence de moment.js
 * @param {string} currentLang - La langue actuelle
 */
function updateWelcomeCountdown(diff, currentLang) {
  const welcomeCountdown = document.getElementById("welcome-countdown");

  // Calculer le nombre total de jours (mois * 30 + jours)
  const totalDays = diff.months * 30 + diff.days;

  // Configuration des cercles avec le total de jours et les labels traduits
  const circleData = [
    {
      value: totalDays,
      label: translations[currentLang].days,
      class: "days-circle",
    },
    {
      value: diff.hours,
      label: translations[currentLang].hours,
      class: "hours-circle",
    },
    {
      value: diff.minutes,
      label: translations[currentLang].minutes,
      class: "minutes-circle",
    },
    {
      value: diff.seconds,
      label: translations[currentLang].seconds,
      class: "seconds-circle",
    },
  ];

  // Clear previous countdown
  welcomeCountdown.innerHTML = "";

  // Create circle elements
  circleData.forEach((item) => {
    const val = item.value < 10 ? "0" + item.value : item.value;
    const circle = document.createElement("div");
    circle.className = `circle-container ${item.class}`;

    circle.innerHTML = `
      <div class="circle-outer"></div>
      <div class="circle-value">${val}</div>
      <div class="circle-label">${item.label}</div>
    `;

    welcomeCountdown.appendChild(circle);
  });
}

// Mettre à jour le compte à rebours chaque seconde
setInterval(updateCountdown, 1000); 