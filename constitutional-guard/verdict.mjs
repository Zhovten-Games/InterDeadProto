export const statuses = ['passed', 'failed', 'unavailable', 'pending', 'manual evidence required'];

export function releaseVerdict(report) {
  const full = ['all', 'check'].includes(report.mode);
  const phases = ['integrity', 'prebuild', 'assembly', 'postbuild', 'manual', 'aggregation'];
  return full &&
    !report.diagnostic &&
    report.clean === true &&
    report.distribution?.diagnostic === false &&
    report.gates.length > 0 &&
    report.gates.every((gate) => gate.status === 'passed') &&
    phases.every((phase) => report.phaseStatus[phase] === 'passed')
    ? 'passed'
    : 'pending';
}

export function validateCollection(registered, collected, results) {
  if (!registered.length || !collected.length) return ['Empty test collection'];
  if (JSON.stringify([...registered].sort()) !== JSON.stringify([...collected].sort()))
    return ['Test collection differs from manifest'];
  if (
    new Set(collected).size !== collected.length ||
    new Set(results.map((row) => row.file)).size !== results.length
  )
    return ['Duplicate collection/result'];
  if (
    JSON.stringify([...collected].sort()) !== JSON.stringify(results.map((row) => row.file).sort())
  )
    return ['Missing/unknown test result'];
  return results.flatMap((row) =>
    row.status !== 'passed' || !(row.tests > 0) || row.pending
      ? [`Incomplete test family: ${row.file}`]
      : [],
  );
}

export function validateGateInventory(definitions, gates) {
  const errors = [];
  if (!definitions.length || new Set(definitions.map((row) => row.id)).size !== definitions.length)
    errors.push('Invalid/empty mandatory gate inventory');
  if (new Set(gates.map((row) => row.id)).size !== gates.length)
    errors.push('Duplicate report gate');
  for (const definition of definitions) {
    const observed = gates.filter((row) => row.id === definition.id);
    if (
      observed.length !== 1 ||
      observed[0].phase !== definition.phase ||
      observed[0].mandatory !== true
    )
      errors.push(`Missing or incompatible mandatory gate: ${definition.id}`);
  }
  for (const gate of gates) {
    if (!definitions.some((definition) => definition.id === gate.id) && gate.status === 'passed')
      errors.push(`Unregistered successful gate: ${gate.id}`);
  }
  return errors;
}
