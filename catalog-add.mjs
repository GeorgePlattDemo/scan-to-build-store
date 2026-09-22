/** Validate an addition and write a complete candidate atomically; no implicit input overwrite. */
import { readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadCatalog, addCatalogOfferings } from './store-zero-stage2-store.mjs';

const [catalogPath, additionsPath, outputPath] = process.argv.slice(2);
let temporary;
try {
  if (!catalogPath || !additionsPath || !outputPath) {
    throw new Error('Usage: node catalog-add.mjs CATALOG.json ADDITIONS.json OUTPUT.json');
  }
  if (resolve(outputPath) === resolve(additionsPath)) throw new Error('Output must not replace the additions file');
  const catalog = loadCatalog(catalogPath);
  const additions = JSON.parse(readFileSync(additionsPath, 'utf8'));
  const result = addCatalogOfferings(catalog, additions.offerings);
  if (result.status !== 'ACCEPTED') throw new Error(result.errors.join('; '));
  temporary = `${outputPath}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(result.catalog) + '\n', { flag: 'wx' });
  renameSync(temporary, outputPath);
  console.log(`Validated catalog written: ${result.catalog.skuCount} offerings`);
} catch (error) {
  if (temporary) rmSync(temporary, { force: true });
  console.error(`CATALOG_UPDATE_REJECTED: ${error.message}`);
  process.exitCode = 1;
}
