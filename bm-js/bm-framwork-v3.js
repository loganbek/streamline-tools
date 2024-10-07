// BigMachines JavaScript Framework v3
(function(context) {
    const setup = {
      pages: {
        homepage: { active: true },
        commerce: { active: true },
        commerce_line: { active: true },
        config: { active: true },
        sitewide: { active: false }
      }
    };
  
    const pubsub = {
      events: {},
      subscribe: function(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
      },
      publish: function(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
      }
    };
  
    function bootstrap(context) {
      const pages = setup.pages;
  
      function runPage(name) {
        console.log(`Running ${name} page`);
        // Here you would load and execute page-specific code
      }
  
      function detectPage() {
        const url = window.location.href;
        
        if (url.includes('display_company_profile.jsp') || document.querySelector('form[name="homePageForm"]')) {
          return 'homepage';
        }
        if (url.includes('/commerce/') && document.querySelector('form[name="bmDocForm"]')) {
          const docNumber = parseInt(document.querySelector('input[name="_document_number"]').value);
          return docNumber === 1 ? 'commerce' : 'commerce_line';
        }
        if (document.querySelector('form[name="configurationForm"]')) {
          return 'config';
        }
        return 'sitewide';
      }
  
      function init() {
        const currentPage = detectPage();
        if (pages[currentPage] && pages[currentPage].active) {
          runPage(currentPage);
        }
        if (pages.sitewide.active) {
          runPage('sitewide');
        }
      }
  
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    }
  
    function waitForHostCompany(callback) {
      const maxWaitTime = 5000;
      const startTime = Date.now();
  
      function checkHostCompany() {
        if (typeof _BM_HOST_COMPANY === 'string') {
          callback();
        } else if (Date.now() - startTime < maxWaitTime) {
          setTimeout(checkHostCompany, 50);
        } else {
          throw new Error("BigMachines Critical Framework Error: Timed out looking for _BM_HOST_COMPANY.");
        }
      }
  
      checkHostCompany();
    }
  
    // Initialize the framework
    waitForHostCompany(() => bootstrap(context));
  
    // Expose public API
    context.setup = setup;
    context.pubsub = pubsub;
  
  })(window['framework'] = window['framework'] || {});