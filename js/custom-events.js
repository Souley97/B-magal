/**
 * Suivi d'événements personnalisés pour Magal Touba 2025
 * Permet de suivre des interactions spécifiques au site
 */

(function() {
  // Attendre que le DOM soit chargé
  document.addEventListener('DOMContentLoaded', function() {
    // Suivre les clics sur les Khasidas (récitations audio)
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    
    if (playBtn && audioPlayer) {
      playBtn.addEventListener('click', function() {
        const isPlaying = !audioPlayer.paused;
        const eventName = isPlaying ? 'khasida_pause' : 'khasida_play';
        
        // Envoyer l'événement via Google Analytics standard
        if (typeof gtag === 'function') {
          gtag('event', eventName, {
            'event_category': 'media',
            'event_label': audioPlayer.src.split('/').pop() || 'khasida.mp3'
          });
        }
        
        // Envoyer via le protocole de mesure
        if (window.magalAnalytics) {
          window.magalAnalytics.trackUserInteraction(
            isPlaying ? 'pause' : 'play',
            'audio_player',
            {
              file_name: audioPlayer.src.split('/').pop() || 'khasida.mp3',
              current_time: Math.floor(audioPlayer.currentTime),
              total_duration: Math.floor(audioPlayer.duration) || 0
            }
          );
        }
      });
    }
    
    // Suivre les interactions avec le slider des Khalifes
    const sliderDots = document.querySelectorAll('.dot');
    const sliderPrev = document.getElementById('prev-btn');
    const sliderNext = document.getElementById('next-btn');
    
    // Suivi des clics sur les dots du slider
    sliderDots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        // Envoyer via Google Analytics standard
        if (typeof gtag === 'function') {
          gtag('event', 'khalife_view', {
            'event_category': 'content',
            'event_label': `khalife_${index + 1}`
          });
        }
        
        // Envoyer via le protocole de mesure
        if (window.magalAnalytics) {
          window.magalAnalytics.sendEvent('khalife_view', {
            khalife_index: index + 1,
            navigation_method: 'dot_click'
          });
        }
      });
    });
    
    // Suivi des clics sur les boutons de navigation
    if (sliderPrev) {
      sliderPrev.addEventListener('click', function() {
        if (window.magalAnalytics) {
          window.magalAnalytics.sendEvent('slider_navigation', {
            action: 'previous',
            slider_type: 'khalifes'
          });
        }
      });
    }
    
    if (sliderNext) {
      sliderNext.addEventListener('click', function() {
        if (window.magalAnalytics) {
          window.magalAnalytics.sendEvent('slider_navigation', {
            action: 'next',
            slider_type: 'khalifes'
          });
        }
      });
    }
    
    // Suivre les partages WhatsApp
    const shareBtn = document.getElementById('share-btn');
    
    if (shareBtn) {
      shareBtn.addEventListener('click', function() {
        // Envoyer via Google Analytics standard
        if (typeof gtag === 'function') {
          gtag('event', 'share', {
            'event_category': 'engagement',
            'event_label': 'whatsapp_share'
          });
        }
        
        // Envoyer via le protocole de mesure
        if (window.magalAnalytics) {
          window.magalAnalytics.trackConversion('share', 'social', 'whatsapp', 1);
        }
      });
    }
    
    // Suivre les changements de langue
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');
        
        // Envoyer via Google Analytics standard
        if (typeof gtag === 'function') {
          gtag('event', 'language_change', {
            'event_category': 'settings',
            'event_label': lang
          });
        }
        
        // Envoyer via le protocole de mesure
        if (window.magalAnalytics) {
          window.magalAnalytics.sendEvent('language_change', {
            language: lang,
            previous_language: localStorage.getItem('preferredLanguage') || 'fr'
          });
        }
      });
    });
    
    // Suivre les abonnements à la newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
      const subscribeBtn = newsletterForm.querySelector('button');
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      
      if (subscribeBtn && emailInput) {
        subscribeBtn.addEventListener('click', function(e) {
          e.preventDefault(); // Empêche la soumission du formulaire pour cette démo
          
          const email = emailInput.value.trim();
          if (email && email.includes('@')) {
            // Envoyer via Google Analytics standard
            if (typeof gtag === 'function') {
              gtag('event', 'newsletter_signup', {
                'event_category': 'conversion',
                'event_label': 'email_subscription'
              });
            }
            
            // Envoyer via le protocole de mesure - sans envoyer l'email complet pour des raisons de confidentialité
            if (window.magalAnalytics) {
              const emailDomain = email.split('@')[1];
              window.magalAnalytics.trackConversion('signup', 'newsletter', emailDomain, 10);
            }
            
            // Afficher un message de confirmation (à des fins de démonstration)
            alert('Merci pour votre inscription à la newsletter!');
            emailInput.value = '';
          }
        });
      }
    }
    
    // Suivre le temps passé dans les sections importantes
    trackVisibleSections();
    
    // Vérifier si nous avons l'API Google Analytics disponible
    if (window.GoogleAnalyticsAPI) {
      // Initialiser l'analyse d'engagement du contenu
      initContentEngagementTracking();
    }
  });
  
  /**
   * Suit le temps passé à visualiser des sections importantes
   */
  function trackVisibleSections() {
    // Définition des sections importantes à suivre
    const importantSections = [
      { id: 'output', name: 'countdown' },
      { id: 'image-slider', name: 'khalifes_slider' },
      { id: 'audio-player', name: 'khasida_player' }
    ];
    
    // Vérifier si l'API IntersectionObserver est disponible
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const sectionName = entry.target.getAttribute('data-section-name');
          
          if (entry.isIntersecting) {
            // La section est visible, commencer à compter
            entry.target.setAttribute('data-view-start', Date.now());
          } else {
            // La section n'est plus visible, calculer le temps passé
            const startTime = parseInt(entry.target.getAttribute('data-view-start') || '0');
            if (startTime > 0) {
              const viewDuration = Math.floor((Date.now() - startTime) / 1000);
              
              // N'envoyer que si l'utilisateur a passé au moins 2 secondes
              if (viewDuration >= 2) {
                if (window.magalAnalytics) {
                  window.magalAnalytics.sendEvent('section_view', {
                    section_name: sectionName,
                    view_duration_seconds: viewDuration
                  });
                }
              }
              
              // Réinitialiser le compteur
              entry.target.removeAttribute('data-view-start');
            }
          }
        });
      }, { threshold: 0.5 }); // L'élément est considéré visible lorsqu'au moins 50% est dans le viewport
      
      // Observer chaque section importante
      importantSections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          element.setAttribute('data-section-name', section.name);
          sectionObserver.observe(element);
        }
      });
    }
  }
  
  /**
   * Initialise le suivi d'engagement du contenu basé sur les données de Google Analytics
   */
  async function initContentEngagementTracking() {
    try {
      // Attendre un peu pour permettre le chargement complet de la page
      setTimeout(async () => {
        // Récupérer les données de base
        const basicStats = await GoogleAnalyticsAPI.getBasicStats();
        
        // Créer une section d'engagement si elle n'existe pas déjà
        if (!document.getElementById('content-engagement')) {
          const engagementHtml = `
            <div class="section-title">
              <h3 data-translate="popular-content">Contenu populaire</h3>
              <p data-translate="popular-content-subtitle">Basé sur ${basicStats.totalVisitors.toLocaleString('fr-FR')} visiteurs</p>
            </div>
            <div class="interactive-tiles">
              <div class="tile" id="popular-khalife">
                <i class="fas fa-star"></i>
                <h4 data-translate="popular-khalife">Khalife le plus consulté</h4>
                <p>Serigne Mountakha Bassirou Mbacké</p>
              </div>
              <div class="tile" id="popular-country">
                <i class="fas fa-globe"></i>
                <h4 data-translate="visitor-origins">Origines des visiteurs</h4>
                <p>${basicStats.countries} pays différents</p>
              </div>
              <div class="tile" id="real-time-visitors">
                <i class="fas fa-user-clock"></i>
                <h4 data-translate="real-time">En temps réel</h4>
                <p data-translate="real-time-stat"><span id="active-users-count">6</span> utilisateurs actifs</p>
              </div>
            </div>
          `;
          
          // Ajouter la section au contenu
          const contentSection = document.querySelector('.content');
          if (contentSection) {
            const engagementSection = document.createElement('div');
            engagementSection.id = 'content-engagement';
            engagementSection.className = 'interactive-section engagement-section';
            engagementSection.innerHTML = engagementHtml;
            contentSection.appendChild(engagementSection);
            
            // Mettre à jour les utilisateurs actifs en temps réel périodiquement
            updateRealTimeUsers();
            setInterval(updateRealTimeUsers, 60000); // Mise à jour toutes les minutes
          }
        }
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du suivi d\'engagement:', error);
    }
  }
  
  /**
   * Met à jour les données d'utilisateurs actifs en temps réel
   */
  async function updateRealTimeUsers() {
    try {
      const realTimeElement = document.getElementById('active-users-count');
      if (realTimeElement && window.GoogleAnalyticsAPI) {
        const realTimeData = await GoogleAnalyticsAPI.getRealTimeData();
        realTimeElement.textContent = realTimeData.activeUsers;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données en temps réel:', error);
    }
  }
})(); 