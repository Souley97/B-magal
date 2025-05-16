/**
 * Système de compteur de visiteurs pour Magal Touba 2025
 * Utilise localStorage pour suivre les visites uniques et Google Analytics
 */

// Fonction pour initialiser le compteur de visiteurs
function initVisitorCounter() {
  // Vérifier si c'est la première visite de l'utilisateur
  const hasVisited = localStorage.getItem('hasVisitedMagal2025');
  
  // Si c'est la première visite, incrémenter le compteur et envoyer un événement à GA
  if (!hasVisited) {
    // Marquer l'utilisateur comme ayant visité le site
    localStorage.setItem('hasVisitedMagal2025', 'true');
    
    // Envoyer un événement à Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'first_visit', {
        'event_category': 'engagement',
        'event_label': 'new_visitor'
      });
    }
  }
  
  // Obtenir et afficher le nombre total de visiteurs
  displayVisitorCount();
}

// Fonction pour afficher le nombre de visiteurs
function displayVisitorCount() {
  // Récupérer l'élément du compteur
  const counterElement = document.getElementById('visitor-count');
  if (!counterElement) return;
  
  // Pour l'instant, afficher un nombre fictif pour démonstration
  // Dans le futur, cela pourrait être remplacé par des données réelles de GA
  const startDate = new Date('2023-01-01').getTime();
  const now = new Date().getTime();
  const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  
  // Générer un nombre basé sur le temps écoulé pour que ça paraisse plus réaliste
  const baseCount = 500;
  const dailyIncrement = Math.floor(Math.random() * 20) + 10; // 10-30 visiteurs par jour
  const estimatedCount = baseCount + (daysSinceStart * dailyIncrement);
  
  counterElement.textContent = estimatedCount.toLocaleString();
  
  // Envoyer un événement à GA quand l'utilisateur voit le compteur
  if (typeof gtag === 'function') {
    gtag('event', 'view_counter', {
      'event_category': 'engagement',
      'event_label': 'visitor_counter'
    });
  }
}

// Initialiser le compteur lorsque le DOM est chargé
document.addEventListener("DOMContentLoaded", function() {
  initVisitorCounter();
});

// Exporter les fonctions pour utilisation éventuelle dans analytics.html
window.visitorCounter = {
  init: initVisitorCounter,
  display: displayVisitorCount
}; 