// Title of a wealth statement, matching the printed report: the spousal-support
// variant is used only when the statement actually includes spouse-owned funds.
export function wealthTitle(hasSupport) {
  return hasSupport
    ? "Statement of Personal Net Worth and Spousal Financial Support"
    : "Statement of Net Worth";
}

// Derive the net-worth breakdown from a wealth statement's line items.
// Mirrors the split used on the printed report: applicant liquid + appraised
// assets = personal/joint net worth; spouse-owned funds = committed support;
// the two together = combined accessible resources.
export function wealthTotals(details) {
  const items = Array.isArray(details?.items) ? details.items : [];
  const sumBy = (pred) => items.filter(pred).reduce((t, i) => t + (Number(i.value_pkr) || 0), 0);
  const liquidTotal = sumBy((i) => i.section === "liquid");
  const supportTotal = sumBy((i) => i.section === "support");
  const assetTotal = sumBy((i) => i.section !== "liquid" && i.section !== "support");
  const personalNet = liquidTotal + assetTotal;
  const combined = personalNet + supportTotal;
  return {
    hasItems: items.length > 0,
    hasSupport: items.some((i) => i.section === "support"),
    liquidTotal,
    supportTotal,
    assetTotal,
    personalNet,
    combined,
  };
}
