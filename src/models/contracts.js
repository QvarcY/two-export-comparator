/**
 * @file Data Transfer Object contracts for Two-Export Comparator.
 * The UI depends only on these shapes — never on parser internals.
 */

/**
 * @typedef {'text' | 'number' | 'date' | 'unknown'} InferredType
 */

/**
 * @typedef {Object} ColumnInfo
 * @property {string} id
 * @property {string} label
 * @property {InferredType} inferredType
 */

/**
 * @typedef {Object} FileWarning
 * @property {string} code
 * @property {'info' | 'warning' | 'error'} severity
 * @property {string} title
 * @property {string} [message]
 * @property {boolean} [recoverable]
 * @property {string[]} [actions]
 */

/**
 * @typedef {Object} FileInspection
 * @property {string} id
 * @property {string} name
 * @property {number} sizeBytes
 * @property {number | null} rowCount
 * @property {string | null} delimiter
 * @property {string | null} encoding
 * @property {ColumnInfo[]} columns
 * @property {Record<string, string>[]} previewRows
 * @property {FileWarning[]} warnings
 */

/**
 * @typedef {'text' | 'number' | 'date'} MappingFieldType
 */

/**
 * @typedef {Object} Tolerance
 * @property {'absolute' | 'percentage'} mode
 * @property {number} value
 */

/**
 * @typedef {Object} KeyMapping
 * @property {string} columnA
 * @property {string} columnB
 * @property {MappingFieldType} type
 */

/**
 * @typedef {Object} CompareMapping
 * @property {string} columnA
 * @property {string} columnB
 * @property {MappingFieldType} type
 * @property {Tolerance} [tolerance]
 */

/**
 * @typedef {Object} NormalizationConfig
 * @property {boolean} trimText
 * @property {boolean} caseInsensitive
 * @property {boolean} collapseWhitespace
 * @property {string} numberLocale
 * @property {string | null} dateFormatA
 * @property {string | null} dateFormatB
 */

/**
 * @typedef {Object} MappingConfig
 * @property {KeyMapping[]} keys
 * @property {CompareMapping[]} comparisons
 * @property {{ fileA: string[], fileB: string[] }} displayOnly
 * @property {NormalizationConfig} normalization
 */

/**
 * @typedef {Object} ComparisonRequest
 * @property {string} fileAId
 * @property {string} fileBId
 * @property {MappingConfig} mapping
 */

/**
 * @typedef {'MATCHED' | 'ONLY_A' | 'ONLY_B' | 'MISMATCH' | 'DUPLICATE' | 'AMBIGUOUS'} ResultStatus
 */

/**
 * @typedef {Object} FieldDifference
 * @property {string} field
 * @property {unknown} valueA
 * @property {unknown} valueB
 * @property {number} [delta]
 */

/**
 * @typedef {Object} ResultRecord
 * @property {string} id
 * @property {ResultStatus} status
 * @property {string} keyLabel
 * @property {{ rowA: number | null, rowB: number | null }} source
 * @property {Record<string, string>} [displayA]
 * @property {Record<string, string>} [displayB]
 * @property {FieldDifference[]} [differences]
 */

/**
 * @typedef {Object} ComparisonSummary
 * @property {number} totalA
 * @property {number} totalB
 * @property {number} matched
 * @property {number} onlyA
 * @property {number} onlyB
 * @property {number} mismatched
 * @property {number} duplicates
 * @property {number} ambiguous
 */

/**
 * @typedef {Object} ComparisonResult
 * @property {string} runId
 * @property {string} createdAt
 * @property {ComparisonSummary} summary
 * @property {ResultRecord[]} records
 * @property {FileWarning[]} warnings
 */

/**
 * @typedef {Object} ProgressEvent
 * @property {'parse-a' | 'parse-b' | 'index' | 'compare' | 'finalize'} phase
 * @property {string} message
 * @property {number} [completed]
 * @property {number} [total]
 */

/**
 * @typedef {Object} ExportOptions
 * @property {ResultStatus[]} [includeStatuses]
 * @property {'csv'} [format]
 */

export {};