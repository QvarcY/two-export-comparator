export function suggestColumnMappings(fileA, fileB, dataA, dataB) {
  const columnsA = fileA.columns ?? [];
  const columnsB = fileB.columns ?? [];

  if (!columnsA.length || !columnsB.length) return [];

  const keyCandidate = bestKeyPair(columnsA, columnsB, dataA.rows, dataB.rows);
  if (!keyCandidate) return [];

  const suggestions = [{
    columnA: keyCandidate.a.id,
    columnB: keyCandidate.b.id,
    confidence: round(keyCandidate.score),
  }];

  const usedB = new Set([keyCandidate.b.id]);

  for (const columnA of columnsA) {
    if (columnA.id === keyCandidate.a.id) continue;

    let best = null;

    for (const columnB of columnsB) {
      if (usedB.has(columnB.id)) continue;
      if (!compatibleTypes(columnA.inferredType, columnB.inferredType)) continue;

      const score = comparePairScore(columnA, columnB, dataA.rows, dataB.rows);
      if (!best || score > best.score) best = { a: columnA, b: columnB, score };
    }

    if (best && best.score >= 0.48) {
      suggestions.push({
        columnA: best.a.id,
        columnB: best.b.id,
        confidence: round(best.score),
      });
      usedB.add(best.b.id);
    }
  }

  return suggestions;
}

function bestKeyPair(columnsA, columnsB, rowsA, rowsB) {
  let best = null;

  for (const a of columnsA) {
    for (const b of columnsB) {
      if (!compatibleTypes(a.inferredType, b.inferredType)) continue;

      const valuesA = nonEmpty(rowsA.map((row) => row[a.id]));
      const valuesB = nonEmpty(rowsB.map((row) => row[b.id]));
      if (!valuesA.length || !valuesB.length) continue;

      const overlap = overlapRatio(valuesA, valuesB);
      const uniqueness = Math.min(uniqueRatio(valuesA), uniqueRatio(valuesB));
      const semantic = semanticSimilarity(a.label, b.label);

      const score = overlap * 0.62 + uniqueness * 0.25 + semantic * 0.13;

      if (!best || score > best.score) best = { a, b, score };
    }
  }

  return best && best.score >= 0.35 ? best : null;
}

function comparePairScore(a, b, rowsA, rowsB) {
  const valuesA = nonEmpty(rowsA.map((row) => row[a.id]));
  const valuesB = nonEmpty(rowsB.map((row) => row[b.id]));

  const semantic = semanticSimilarity(a.label, b.label);
  const overlap = overlapRatio(valuesA, valuesB);
  const type = compatibleTypes(a.inferredType, b.inferredType) ? 1 : 0;

  return semantic * 0.5 + overlap * 0.35 + type * 0.15;
}

function compatibleTypes(a, b) {
  if (a === 'unknown' || b === 'unknown') return true;
  return a === b;
}

function semanticSimilarity(a, b) {
  const groupA = semanticGroup(a);
  const groupB = semanticGroup(b);

  if (groupA && groupA === groupB) return 1;

  const tokensA = tokenSet(a);
  const tokensB = tokenSet(b);
  if (!tokensA.size || !tokensB.size) return 0;

  let intersection = 0;
  for (const token of tokensA) if (tokensB.has(token)) intersection += 1;

  return intersection / Math.max(tokensA.size, tokensB.size);
}

function semanticGroup(label) {
  const value = String(label ?? '').toLowerCase();

  if (/\b(ref|reference|invoice|inv|order|payment.?ref|transaction.?id|id|number|no)\b/.test(value)) {
    return 'identifier';
  }
  if (/\b(amount|total|sum|price|value|balance)\b/.test(value)) return 'amount';
  if (/\b(date|time|paid.?date|created|updated)\b/.test(value)) return 'date';
  if (/\b(description|desc|memo|note|details)\b/.test(value)) return 'description';
  if (/\b(customer|client|buyer|name)\b/.test(value)) return 'party';

  return null;
}

function tokenSet(value) {
  return new Set(
    String(value ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  );
}

function overlapRatio(valuesA, valuesB) {
  const setA = new Set(valuesA.map(normalize));
  const setB = new Set(valuesB.map(normalize));

  if (!setA.size || !setB.size) return 0;

  let intersection = 0;
  for (const value of setA) if (setB.has(value)) intersection += 1;

  return intersection / Math.min(setA.size, setB.size);
}

function uniqueRatio(values) {
  if (!values.length) return 0;
  return new Set(values.map(normalize)).size / values.length;
}

function nonEmpty(values) {
  return values
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .slice(0, 1000);
}

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function round(value) {
  return Math.round(value * 100) / 100;
}
