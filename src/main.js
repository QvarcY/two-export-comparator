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
import { el, replaceChildren } from './ui/renderers/dom.js';

/**
 * Bootstrap the application.
 * @param {{ comparisonService?: import('./services/comparison-service.js').ComparisonService }} [config]
 */
export function startApp(config = {}) {
  const service = config.comparisonService ?? new MockComparisonService();
  const store = new AppStore();
  const controller = new AppController(store, service);

  const root = document.getElementById('app');

  const header = el('header', { class: 'app-header' }, [
    el('div', { class: 'app-header__brand' }, [
      el('div', { class: 'app-header__mark', text: '⇄' }),
      el('span', { text: 'Two-Export Comparator' }),
    ]),
    el('div', { class: 'app-header__meta' }, [
      el('span', { class: 'app-header__tagline', text: 'Local processing · No uploads' }),
      el('span', { class: 'privacy-badge', title: 'Files never leave this browser' }, [
        el('span', { class: 'privacy-badge__dot', 'aria-hidden': 'true' }),
        el('span', { text: 'Local only' }),
      ]),
    ]),
  ]);

  const landingView = new LandingView(store);
  const mappingView = new MappingView(store, service);
  const comparingView = new ComparingView(store);
  const resultsView = new ResultsView(store);
  const toastHost = new ToastHost(store);

  replaceChildren(root, [
    SkipLink(),
    header,
    landingView.root,
    mappingView.root,
    comparingView.root,
    resultsView.root,
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