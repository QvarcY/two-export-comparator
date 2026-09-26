import { AppEvents } from './app-events.js';

/**
 * AppController — coordinates user actions and service calls.
 * Contains NO CSV parsing and NO matching algorithms.
 */
export class AppController {
  /**
   * @param {import('./app-store.js').AppStore} store
   * @param {import('../services/comparison-service.js').ComparisonService} service
   */
  constructor(store, service) {
    this.store = store;
    this.service = service;
    this._wireEvents();
  }

  _wireEvents() {
    window.addEventListener(AppEvents.FILE_A_SELECTED, (e) => this.handleFileSelected('A', e.detail.file));
    window.addEventListener(AppEvents.FILE_B_SELECTED, (e) => this.handleFileSelected('B', e.detail.file));
    window.addEventListener(AppEvents.FILE_A_REMOVED, () => this.handleFileRemoved('A'));
    window.addEventListener(AppEvents.FILE_B_REMOVED, () => this.handleFileRemoved('B'));
    window.addEventListener(AppEvents.COMPARE_REQUESTED, (e) => this.handleCompare(e.detail.mapping));
    window.addEventListener(AppEvents.EXPORT_REQUESTED, (e) => this.handleExport(e.detail));
    window.addEventListener(AppEvents.RESET_REQUESTED, () => this.handleReset());
  }

  /**
   * @param {'A' | 'B'} slot
   * @param {File} file
   */
  async handleFileSelected(slot, file) {
    try {
      const inspection = await this.service.inspectFile(file);
      const patch = slot === 'A' ? { fileA: inspection } : { fileB: inspection };
      this.store.patch(patch);
      this._recomputeState();
    } catch (err) {
      this.store.pushToast({
        severity: 'error',
        title: "We couldn't read that file",
        message: 'Try a different CSV or TSV export.',
      });
      // eslint-disable-next-line no-console
      console.error('[AppController] inspectFile failed:', err);
    }
  }

  /**
   * @param {'A' | 'B'} slot
   */
  handleFileRemoved(slot) {
    const patch = slot === 'A' ? { fileA: null } : { fileB: null };
    this.store.patch(patch);
    this._recomputeState();
  }

  /**
   * @param {import('../models/contracts.js').MappingConfig} mapping
   */
  async handleCompare(mapping) {
    const { fileA, fileB } = this.store;
    if (!fileA || !fileB) return;

    this.store.patch({ mapping, progress: null, result: null });
    this.store.setState('COMPARING');

    try {
      const result = await this.service.compare(
        { fileAId: fileA.id, fileBId: fileB.id, mapping },
        {
          onProgress: (progress) => {
            this.store.patch({ progress });
            window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_PROGRESS, { detail: progress }));
          },
        }
      );
      this.store.patch({ result, progress: null });
      this.store.setState('RESULTS');
      window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_SUCCEEDED, { detail: result }));
    } catch (err) {
      this.store.patch({ progress: null });
      this.store.setState('ERROR');
      this.store.pushToast({
        severity: 'error',
        title: 'Comparison failed',
        message: 'Try adjusting the mapping or the files.',
      });
      window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_FAILED, { detail: err }));
      // eslint-disable-next-line no-console
      console.error('[AppController] compare failed:', err);
    }
  }

  /**
   * @param {import('../models/contracts.js').ExportOptions} options
   */
  async handleExport(options = {}) {
    if (!this.store.result) return;
    try {
      const blob = await this.service.createExport(this.store.result, options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparison-${this.store.result.runId ?? 'export'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.store.pushToast({ severity: 'info', title: 'Export ready', message: 'Your download has started.' });
    } catch (err) {
      this.store.pushToast({ severity: 'error', title: 'Export failed' });
      // eslint-disable-next-line no-console
      console.error('[AppController] export failed:', err);
    }
  }

  handleReset() {
    this.service.reset();
    this.store.patch({
      fileA: null,
      fileB: null,
      mapping: null,
      mappingValid: false,
      progress: null,
      result: null,
      resultFilter: 'ALL',
      openRecordId: null,
    });
    this.store.setState('EMPTY');
  }

  _recomputeState() {
    const { fileA, fileB } = this.store;
    if (!fileA && !fileB) {
      this.store.setState('EMPTY');
    } else if (fileA && fileB) {
      this.store.setState('MAPPING');
    } else {
      this.store.setState('FILES_PARTIAL');
    }
  }
}