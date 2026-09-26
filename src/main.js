import './styles/tokens.css';
import './styles/base.css';
import './styles/utilities.css';
import './styles/components.css';

import { AppStore } from './app/app-store.js';
import { AppController } from './app/app-controller.js';
import { BrowserComparisonService } from './services/browser-comparison-service.js';
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
  const service = config.comparisonService ?? new BrowserComparisonService();
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

  const creatorLabel = el('span', { class: 'creator-strip__label' });
  const creatorName = el('a', {
    class: 'creator-strip__author',
    href: 'https://github.com/QvarcY',
    target: '_blank',
    rel: 'noopener noreferrer',
    text: 'Ingars Neija',
  });
  const creatorBrand = el('a', {
    class: 'creator-strip__brand',
    href: 'https://www.craftin.lv',
    target: '_blank',
    rel: 'noopener noreferrer',
    text: 'CraftIN',
  });
  const creatorSupportText = el('span');
  const creatorSupport = el('a', {
    class: 'creator-strip__support',
    href: 'https://buymeacoffee.com/craftin',
    target: '_blank',
    rel: 'noopener noreferrer',
  }, [
    el('span', { class: 'creator-strip__support-icon', text: '☕', 'aria-hidden': 'true' }),
    creatorSupportText,
  ]);

  const creatorStrip = el('aside', {
    class: 'creator-strip',
    'aria-label': 'Creator and project support',
  }, [
    el('div', { class: 'creator-strip__inner' }, [
      el('div', { class: 'creator-strip__identity' }, [
        creatorLabel,
        creatorName,
        el('span', { class: 'creator-strip__separator', text: '·', 'aria-hidden': 'true' }),
        creatorBrand,
      ]),
      creatorSupport,
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

  const supportEyebrow = el('span', { class: 'app-support__eyebrow' });
  const supportTitle = el('strong', { class: 'app-support__title' });
  const supportText = el('span', { class: 'app-support__text' });
  const supportLinkText = el('span');
  const supportLink = el('a', {
    class: 'app-support__link',
    href: 'https://buymeacoffee.com/craftin',
    target: '_blank',
    rel: 'noopener noreferrer',
  }, [
    el('span', { class: 'app-support__icon', text: '☕', 'aria-hidden': 'true' }),
    supportLinkText,
  ]);

  const footerAuthor = el('span', { class: 'app-support__author-name', text: 'Ingars Neija' });
  const footerAlias = el('span', { class: 'app-support__alias', text: 'QvarcY' });
  const footerBrand = el('a', {
    class: 'app-support__brand',
    href: 'https://www.craftin.lv',
    target: '_blank',
    rel: 'noopener noreferrer',
    text: 'CraftIN',
  });

  const support = el('footer', { class: 'app-support' }, [
    el('div', { class: 'app-support__inner' }, [
      el('div', { class: 'app-support__copy' }, [
        supportEyebrow,
        supportTitle,
        el('div', { class: 'app-support__author-line' }, [
          footerAuthor,
          el('span', { text: '·' }),
          footerAlias,
          el('span', { text: '·' }),
          footerBrand,
        ]),
        supportText,
      ]),
      supportLink,
    ]),
  ]);

  replaceChildren(root, [
    SkipLink(),
    header,
    creatorStrip,
    main,
    support,
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
    creatorLabel.textContent = t('creator.label');
    creatorSupportText.textContent = t('support.link');
    creatorSupport.setAttribute('aria-label', t('support.aria'));
    creatorStrip.setAttribute('aria-label', t('creator.aria'));

    supportEyebrow.textContent = t('creator.footerEyebrow');
    supportTitle.textContent = t('creator.footerTitle');
    supportText.textContent = t('support.message');
    supportLinkText.textContent = t('support.link');
    supportLink.setAttribute('aria-label', t('support.aria'));
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
