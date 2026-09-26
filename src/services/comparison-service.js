/**
 * @file ComparisonService — the single integration boundary.
 * All technical logic lives behind this contract.
 * During the GUI phase, MockComparisonService is used.
 * Later, BrowserComparisonService replaces it without UI redesign.
 */

/**
 * @interface
 */
export class ComparisonService {
  /**
   * Inspect a file and return metadata, columns and a safe preview.
   * @param {File} file
   * @param {Object} [options]
   * @returns {Promise<import('../models/contracts.js').FileInspection>}
   */
  async inspectFile(_file, _options = {}) {
    throw new Error('ComparisonService.inspectFile not implemented');
  }

  /**
   * Suggest column mappings. Proposals only — user must confirm.
   * @param {import('../models/contracts.js').FileInspection} fileA
   * @param {import('../models/contracts.js').FileInspection} fileB
   * @returns {Promise<Array<{ columnA: string, columnB: string, confidence: number }>>}
   */
  async suggestMappings(_fileA, _fileB) {
    throw new Error('ComparisonService.suggestMappings not implemented');
  }

  /**
   * Run the comparison.
   * @param {import('../models/contracts.js').ComparisonRequest} request
   * @param {{ onProgress?: (e: import('../models/contracts.js').ProgressEvent) => void }} [callbacks]
   * @returns {Promise<import('../models/contracts.js').ComparisonResult>}
   */
  async compare(_request, _callbacks = {}) {
    throw new Error('ComparisonService.compare not implemented');
  }

  /**
   * Produce a downloadable Blob for the given result.
   * @param {import('../models/contracts.js').ComparisonResult} result
   * @param {import('../models/contracts.js').ExportOptions} [options]
   * @returns {Promise<Blob>}
   */
  async createExport(_result, _options = {}) {
    throw new Error('ComparisonService.createExport not implemented');
  }

  /**
   * Clear in-memory file/parsed data and caches.
   */
  reset() {
    throw new Error('ComparisonService.reset not implemented');
  }
}