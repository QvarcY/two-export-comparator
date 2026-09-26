import { ComparisonService } from './comparison-service.js';

/**
 * Placeholder for the real browser-side engine.
 * Will be implemented during the technical phase — do not fill in yet.
 * @extends ComparisonService
 */
export class BrowserComparisonService extends ComparisonService {
  async inspectFile() {
    throw new Error('BrowserComparisonService is not implemented in the design phase.');
  }
  async suggestMappings() {
    throw new Error('BrowserComparisonService is not implemented in the design phase.');
  }
  async compare() {
    throw new Error('BrowserComparisonService is not implemented in the design phase.');
  }
  async createExport() {
    throw new Error('BrowserComparisonService is not implemented in the design phase.');
  }
  reset() {
    throw new Error('BrowserComparisonService is not implemented in the design phase.');
  }
}