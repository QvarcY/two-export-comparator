import './styles/tokens.css';
import './styles/base.css';
import './styles/utilities.css';
import './styles/components.css';

import { AppStore } from './app/app-store.js';
import { AppController } from './app/app-controller.js';
import { MockComparisonService } from './services/mock-comparison-service.js';
import { LandingView } from './ui/views/landing-view.js';
import { MappingView } from './ui/views/mapping-view.js';
import { ComparingView } from './ui/views/comparing-view.js';
import { ResultsView } from './ui/views/results-view.js';
import { ToastHost } from './ui/components/toast-host.js';
import { SkipLink } from './ui/components/skip-link.js';
import { LanguageSwitcher } from './ui/components/language-switcher.js';
import { el, replaceChildren } from './ui/renderers/dom.js';
import { LOCALE_CHANGE_EVENT, t } from './i18n/index.js';

export function startApp(config = {}) {
  const service = config.comparisonService ?? new MockComparisonService();
  const store = new AppStore();
  const controller = new AppController(store, service);
  const root = document.getElementById('app');

  const brandText = el('span');
  const tagline = el('span', { class: 'app-header__tagline' });
  const privacyText = el('span');
  const privacyBadge = el('span', { class: 'privacy-badge' }, [
    el('span', { class: 'privacy-badge__dot', 'aria-hidden': 'true' }),
    privacyText,
  ]);

  const header = el('header', { class: 'app-header' }, [
    el('div', { class: 'app-header__brand' }, [
      el('div', { class: 'app-header__mark', text: '⇄' }),
      brandText,
    ]),
    el('div', { class: 'app-header__meta' }, [
      tagline,
      LanguageSwitcher(),
      privacyBadge,
    ]),
  ]);

  const landingView = new LandingView(store);
  const mappingView = new MappingView(store, service);
  const comparingView = new ComparingView(store);
  const resultsView = new ResultsView(store);
  const toastHost = new ToastHost(store);

  const main = el('main', { id: 'main', class: 'app-content' }, [
    landingView.root,
    mappingView.root,
    comparingView.root,
    resultsView.root,
  ]);

  replaceChildren(root, [
    SkipLink(),
    header,
    main,
    toastHost.root,
  ]);

  const syncLanguage = () => {
    document.title = t('meta.title');
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', t('meta.description'));

    brandText.textContent = t('app.brand');
    tagline.textContent = t('app.tagline');
    privacyText.textContent = t('app.localOnly');
    privacyBadge.title = t('app.filesNeverLeave');
  };

  const syncState = () => {
    root.dataset.state = store.state;
    landingView.root.hidden = !['EMPTY', 'FILES_PARTIAL', 'FILES_READY'].includes(store.state);
  };

  window.addEventListener(LOCALE_CHANGE_EVENT, syncLanguage);
  store.addEventListener('state', syncState);

  syncLanguage();
  syncState();

  if (import.meta.env?.DEV) {
    window.__app = { store, controller, service };
  }

  return { store, controller, service };
}

startApp();
