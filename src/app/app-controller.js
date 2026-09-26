import { AppEvents } from './app-events.js';

export class AppController {
  constructor(store, service) {
    this.store = store;
    this.service = service;
    this._wireEvents();
  }

  _wireEvents() {
    window.addEventListener(AppEvents.FILE_A_SELECTED, (event) => {
      this.handleFileSelected('A', event.detail.file);
    });

    window.addEventListener(AppEvents.FILE_B_SELECTED, (event) => {
      this.handleFileSelected('B', event.detail.file);
    });

    window.addEventListener(AppEvents.FILE_A_REMOVED, () => this.handleFileRemoved('A'));
    window.addEventListener(AppEvents.FILE_B_REMOVED, () => this.handleFileRemoved('B'));
    window.addEventListener(AppEvents.COMPARE_REQUESTED, (event) => {
      this.handleCompare(event.detail.mapping);
    });
    window.addEventListener(AppEvents.EXPORT_REQUESTED, (event) => {
      this.handleExport(event.detail);
    });
    window.addEventListener(AppEvents.RESET_REQUESTED, () => this.handleReset());
    window.addEventListener(AppEvents.EXPERT_MAPPING_REQUESTED, () => this.handleExpertMapping());
  }

  async handleFileSelected(slot, file) {
    const loadingKey = slot === 'A' ? 'fileLoadingA' : 'fileLoadingB';
    this.store.patch({ [loadingKey]: true });

    try {
      const inspection = await this.service.inspectFile(file, { slot });
      const filePatch = slot === 'A'
        ? { fileA: inspection }
        : { fileB: inspection };

      this.store.patch({
        ...filePatch,
        [loadingKey]: false,
      });

      const ready = this._recomputeState();
      if (ready) {
        await this.handleAutoCompare();
      }
    } catch (error) {
      this.store.patch({ [loadingKey]: false });

      this.store.pushToast({
        severity: 'error',
        titleKey: 'toast.readErrorTitle',
        messageKey: 'toast.readErrorMessage',
      });

      console.error('[AppController] inspectFile failed:', error);
    }
  }

  handleFileRemoved(slot) {
    this.store.patch(
      slot === 'A'
        ? { fileA: null, fileLoadingA: false }
        : { fileB: null, fileLoadingB: false }
    );

    this._recomputeState();
  }

  async handleCompare(mapping) {
    const { fileA, fileB } = this.store;
    if (!fileA || !fileB) return;

    this.store.patch({
      mapping,
      progress: null,
      result: null,
    });

    this.store.setState('COMPARING');

    try {
      const result = await this.service.compare(
        {
          fileAId: fileA.id,
          fileBId: fileB.id,
          mapping,
        },
        {
          onProgress: (progress) => {
            this.store.patch({ progress });
            window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_PROGRESS, {
              detail: progress,
            }));
          },
        }
      );

      this.store.patch({
        result,
        progress: null,
      });

      this.store.setState('RESULTS');

      window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_SUCCEEDED, {
        detail: result,
      }));
    } catch (error) {
      this.store.patch({ progress: null });
      this.store.setState(this.store.mappingValid ? 'READY_TO_COMPARE' : 'MAPPING');

      this.store.pushToast({
        severity: 'error',
        titleKey: 'toast.compareFailedTitle',
        messageKey: 'toast.compareFailedMessage',
      });

      window.dispatchEvent(new CustomEvent(AppEvents.COMPARE_FAILED, {
        detail: error,
      }));

      console.error('[AppController] compare failed:', error);
    }
  }

  async handleExport(options = {}) {
    if (!this.store.result) return;

    try {
      const blob = await this.service.createExport(this.store.result, options);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = 'comparison-' + (this.store.result.runId ?? 'export') + '.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      this.store.pushToast({
        severity: 'info',
        titleKey: 'toast.exportReadyTitle',
        messageKey: 'toast.exportReadyMessage',
      });
    } catch (error) {
      this.store.pushToast({
        severity: 'error',
        titleKey: 'toast.exportFailedTitle',
      });

      console.error('[AppController] export failed:', error);
    }
  }

  async handleAutoCompare() {
    const { fileA, fileB } = this.store;
    if (!fileA || !fileB) return;

    try {
      const suggestions = await this.service.suggestMappings(fileA, fileB);

      if (!suggestions?.length) {
        this.store.patch({ mapping: null, mappingValid: false });
        this.store.setState('MAPPING');
        return;
      }

      const [keySuggestion, ...comparisonSuggestions] = suggestions;
      const mapping = {
        keys: [{
          columnA: keySuggestion.columnA,
          columnB: keySuggestion.columnB,
          type: 'text',
        }],
        comparisons: comparisonSuggestions.map((suggestion) => ({
          columnA: suggestion.columnA,
          columnB: suggestion.columnB,
          type: this._guessMappingType(fileA, fileB, suggestion.columnA, suggestion.columnB),
          tolerance: { mode: 'absolute', value: 0.01 },
        })),
        displayOnly: { fileA: [], fileB: [] },
        normalization: {
          trimText: true,
          caseInsensitive: true,
          collapseWhitespace: true,
          numberLocale: 'auto',
          dateFormatA: null,
          dateFormatB: null,
        },
      };

      this.store.patch({ mapping, mappingValid: true });
      await this.handleCompare(mapping);
    } catch (error) {
      this.store.patch({ mapping: null, mappingValid: false });
      this.store.setState('MAPPING');
      console.error('[AppController] automatic comparison setup failed:', error);
    }
  }

  _guessMappingType(fileA, fileB, columnA, columnB) {
    const typeA = fileA.columns.find((column) => column.id === columnA)?.inferredType;
    const typeB = fileB.columns.find((column) => column.id === columnB)?.inferredType;

    if (typeA === 'number' || typeB === 'number') return 'number';
    if (typeA === 'date' || typeB === 'date') return 'date';
    return 'text';
  }

  handleExpertMapping() {
    if (!this.store.fileA || !this.store.fileB) return;
    this.store.setState(this.store.mappingValid ? 'READY_TO_COMPARE' : 'MAPPING');
  }

  handleReset() {
    this.service.reset();

    this.store.patch({
      fileA: null,
      fileB: null,
      fileLoadingA: false,
      fileLoadingB: false,
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
      return false;
    }

    if (fileA && fileB) {
      this.store.setState('FILES_READY');
      return true;
    }

    this.store.setState('FILES_PARTIAL');
    return false;
  }
}
