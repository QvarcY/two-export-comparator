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
import { t } from './i18n/index.js';

/**
 * Bootstrap the application.
 * @param {{ comparisonService?: import('./services/comparison-service.js').ComparisonService }} [config]
 */
export function startApp(config = {}) {
  const service = config.comparisonService ?? new MockComparisonService();
  const store = new AppStore();
  const controller = new AppController(store, service);

  const root = document.getElementById('app');

  document.title = t('meta.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('meta.description'));

  const header = el('header', { class: 'app-header' }, [
    el('div', { class: 'app-header__brand' }, [
      el('div', { class: 'app-header__mark', text: '⇄' }),
      el('span', { text: t('app.brand') }),
    ]),
    el('div', { class: 'app-header__meta' }, [
      el('span', { class: 'app-header__tagline', text: t('app.tagline') }),
      LanguageSwitcher(),
      el('span', { class: 'privacy-badge', title: t('app.filesNeverLeave') }, [
        el('span', { class: 'privacy-badge__dot', 'aria-hidden': 'true' }),
        el('span', { text: t('app.localOnly') }),
      ]),
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

  const sync = () => {
    root.dataset.state = store.state;
    const showLanding = ['EMPTY', 'FILES_PARTIAL', 'FILES_READY'].includes(store.state);
    landingView.root.hidden = !showLanding;
  };
  store.addEventListener('state', sync);
  sync();

  if (import.meta.env?.DEV) {
    window.__app = { store, controller, service };
  }

  return { store, controller, service };
}

startApp();
