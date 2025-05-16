/**
 * Implémentation du protocole de mesure Google Analytics pour Magal Touba 2025
 * Permet d'envoyer des événements directement au serveur GA même lorsque gtag n'est pas disponible
 */

(function() {
  // Configuration GA4
  const measurementId = 'G-68SJHJYNJQ';
  const apiSecret = 'll3vvhPMST-OyMdtIiSzaA'; // Code secret du protocole de mesure
  const endpoint = 'https://www.google-analytics.com/mp/collect';
  
  /**
   * Génère un identifiant client unique et persistant
   * @returns {string} Identifiant client
   */
  function getClientId() {
    // Vérifier si un identifiant client existe déjà
    let clientId = localStorage.getItem('ga_client_id');
    
    // Si non, en créer un nouveau
    if (!clientId) {
      clientId = `${Date.now()}.${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('ga_client_id', clientId);
    }
    
    return clientId;
  }
  
  /**
   * Envoie un événement via le protocole de mesure
   * @param {string} name - Nom de l'événement
   * @param {Object} params - Paramètres additionnels
   */
  function sendEvent(name, params = {}) {
    const clientId = getClientId();
    const url = `${endpoint}?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    
    // Préparer les données de l'événement
    const data = {
      client_id: clientId,
      events: [{
        name: name,
        params: params
      }]
    };
    
    // Envoyer la requête
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        console.log(`Événement "${name}" envoyé avec succès via le protocole de mesure`);
      } else {
        console.error(`Erreur lors de l'envoi de l'événement "${name}"`, response.status);
      }
    })
    .catch(error => {
      console.error(`Échec de l'envoi de l'événement "${name}"`, error);
    });
  }
  
  /**
   * Enregistre une page vue avec des informations détaillées
   * @param {string} pagePath - Chemin de la page
   * @param {string} pageTitle - Titre de la page
   */
  function trackPageView(pagePath, pageTitle) {
    sendEvent('page_view', {
      page_location: window.location.href,
      page_path: pagePath || window.location.pathname,
      page_title: pageTitle || document.title,
      language: navigator.language || 'unknown',
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      user_agent: navigator.userAgent
    });
  }
  
  /**
   * Enregistre un événement de conversion
   * @param {string} action - Type d'action (inscription, téléchargement, etc.)
   * @param {string} category - Catégorie (par exemple: "engagement")
   * @param {string} label - Étiquette descriptive
   * @param {number} value - Valeur numérique (optionnelle)
   */
  function trackConversion(action, category, label, value) {
    sendEvent('conversion', {
      action: action,
      category: category,
      label: label,
      value: value || 0,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Enregistre une interaction d'utilisateur
   * @param {string} action - Type d'action (clic, soumission, etc.)
   * @param {string} element - Élément d'interface concerné
   * @param {Object} additionalParams - Paramètres additionnels
   */
  function trackUserInteraction(action, element, additionalParams = {}) {
    sendEvent('user_interaction', {
      action: action,
      element: element,
      ...additionalParams
    });
  }
  
  /**
   * Enregistre un événement de temps passé sur la page
   * @param {number} seconds - Nombre de secondes passées
   * @param {string} pagePath - Chemin de la page
   */
  function trackEngagementTime(seconds, pagePath) {
    sendEvent('engagement_time', {
      time_on_page: seconds,
      page_path: pagePath || window.location.pathname
    });
  }
  
  // Exportation des fonctions pour usage externe
  window.magalAnalytics = {
    sendEvent: sendEvent,
    trackPageView: trackPageView,
    trackConversion: trackConversion,
    trackUserInteraction: trackUserInteraction,
    trackEngagementTime: trackEngagementTime
  };
  
  // Enregistrer automatiquement la page vue au chargement
  document.addEventListener('DOMContentLoaded', function() {
    trackPageView();
    
    // Mesurer le temps passé sur la page
    let startTime = Date.now();
    let engagementInterval = setInterval(function() {
      const secondsOnPage = Math.floor((Date.now() - startTime) / 1000);
      // Envoyer un événement toutes les 30 secondes
      if (secondsOnPage % 30 === 0 && secondsOnPage > 0) {
        trackEngagementTime(secondsOnPage);
      }
    }, 1000);
    
    // Nettoyer l'intervalle lorsque l'utilisateur quitte la page
    window.addEventListener('beforeunload', function() {
      clearInterval(engagementInterval);
      const secondsOnPage = Math.floor((Date.now() - startTime) / 1000);
      trackEngagementTime(secondsOnPage);
    });
  });
})(); 