"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

// Build a reference like PV/EVL/473/2026 with three random digits, avoiding any
// reference already in use so it can never collide with (and overwrite) another.
function genReference(existing, year) {
  const used = new Set((existing || []).map((r) => r.reference));
  for (let i = 0; i < 100; i++) {
    const ref = `PV/EVL/${Math.floor(Math.random() * 900) + 100}/${year}`;
    if (!used.has(ref)) return ref;
  }
  let n = 100, ref = `PV/EVL/${n}/${year}`;
  while (used.has(ref)) ref = `PV/EVL/${++n}/${year}`;
  return ref;
}

// Format a CNIC as xxxxx-xxxxxxx-x (5-7-1), inserting dashes as the admin types
// and capping at the 13 digits every Pakistani CNIC has.
function formatCnic(v) {
  const d = (v || "").replace(/\D/g, "").slice(0, 13);
  const parts = [d.slice(0, 5)];
  if (d.length > 5) parts.push(d.slice(5, 12));
  if (d.length > 12) parts.push(d.slice(12));
  return parts.filter(Boolean).join("-");
}

// One-line summary of a valuation report, used when importing it as a
// net-worth line item so each asset reads clearly in the wealth statement.
function describeReport(r) {
  const d = r.details || {};
  const ref = r.reference ? ` (Ref ${r.reference})` : "";
  if (r.valuation_type === "gold")
    return `Gold jewellery${d.purity_karat ? ` ${d.purity_karat}K` : ""}${d.total_grams ? `, ${d.total_grams} g` : ""}${ref}`;
  if (r.valuation_type === "vehicle")
    return `${d.make_model || "Vehicle"}${d.model_year ? ` (${d.model_year})` : ""}${d.registration_no ? `, Reg ${d.registration_no}` : ""}${ref}`;
  if (r.valuation_type === "property")
    return `${d.nature ? d.nature + ": " : ""}${d.description || "Property"}${ref}`;
  if (r.valuation_type === "movable")
    return `${d.asset_type ? d.asset_type + ": " : ""}${d.description || "Movable asset"}${ref}`;
  return `${r.valuation_type}${ref}`;
}

const STATUSES = ["under_review", "verified", "rejected"];
const STATUS_LABEL = { under_review: "Under Review", verified: "Verified", rejected: "Rejected" };
const TYPES = ["gold", "vehicle", "property", "movable", "wealth"];
const TYPE_LABEL = {
  gold: "Gold",
  vehicle: "Vehicle",
  property: "Property",
  movable: "Movable assets",
  wealth: "Net-worth / wealth statement",
};
const RELATIONS = ["wife", "son", "daughter", "husband"];
const CURRENCIES = ["USD", "CAD", "GBP", "EUR", "AED", "SAR", "AUD"];

const DETAIL_CONFIG = {
  gold: [
    ["purity_karat", "Purity (Karat)", "number"],
    ["total_grams", "Total grams", "number"],
    ["total_tola", "Total tola", "number"],
    ["rate_per_gram_pkr", "Rate per gram (PKR)", "number"],
  ],
  vehicle: [
    ["make_model", "Make & model", "text"],
    ["model_year", "Model year", "number"],
    ["registration_no", "Registration No.", "text"],
    ["engine_no", "Engine No.", "text"],
    ["chassis_no", "Chassis No.", "text"],
    ["transfer_date", "Transfer date", "text"],
    ["odometer_km", "Odometer (km)", "number"],
  ],
  property: [
    ["description", "Property description", "textarea"],
    ["nature", "Nature of property", "text"],
    ["land_area", "Land area", "text"],
    ["value_per_marla_pkr", "Value per Marla (PKR)", "number"],
  ],
  movable: [
    ["asset_type", "Asset type (machinery / equipment / stock)", "text"],
    ["description", "Description", "textarea"],
    ["condition", "Condition", "text"],
    ["basis", "Basis of valuation", "text"],
  ],
};

const EMPTY = {
  reference: "",
  valuation_type: "gold",
  status: "verified",
  owner_name: "",
  owner_guardian: "",
  guardian_relation: "wife",
  cnic: "",
  passport_no: "",
  report_date: "",
  valid_until: "",
  present_address: "",
  permanent_address: "",
  remarks: "",
  market_value_pkr: "",
  market_value_cad: "",
  currency_code: "USD",
  exchange_rate: "",
  pdf_filename: "",
  details: {},
};

function fromRecord(r) {
  return {
    ...EMPTY,
    ...r,
    market_value_pkr: r.market_value_pkr ?? "",
    market_value_cad: r.market_value_cad ?? "",
    exchange_rate: r.exchange_rate ?? "",
    report_date: r.report_date || "",
    valid_until: r.valid_until || "",
    owner_guardian: r.owner_guardian || "",
    guardian_relation: r.guardian_relation || "wife",
    passport_no: r.passport_no || "",
    present_address: r.present_address || "",
    permanent_address: r.permanent_address || "",
    remarks: r.remarks || "",
    currency_code: r.currency_code || "USD",
    details: r.details || {},
  };
}

export default function AdminDashboard({ siteUrl }) {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [qr, setQr] = useState(null);
  const [settings, setSettings] = useState({});
  const origin = siteUrl || (typeof window !== "undefined" ? window.location.origin : "");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports");
    if (res.status === 401) return router.replace("/admin/login");
    setReports((await res.json()).reports || []);
    setLoading(false);
  }, [router]);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) setSettings((await res.json()).settings || {});
  }, []);

  useEffect(() => {
    load();
    loadSettings();
  }, [load, loadSettings]);

  // Auto-assign a reference to a fresh report once reports have loaded (so the
  // generated number is checked against every existing reference).
  useEffect(() => {
    if (loading || editingId) return;
    setForm((f) => (f.reference ? f : { ...f, reference: genReference(reports, new Date().getFullYear()) }));
  }, [reports, editingId, loading]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDetail = (k, v) => setForm((f) => ({ ...f, details: { ...f.details, [k]: v } }));
  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };
  const regenRef = () => set("reference", genReference(reports, new Date().getFullYear()));

  // Typing a CNIC that matches an existing client auto-fills their identity
  // details (name, guardian, passport, address) from their most recent report.
  const setCnic = (raw) =>
    setForm((f) => {
      const v = formatCnic(raw);
      const next = { ...f, cnic: v };
      if (editingId) return next;
      const match = reports.find((r) => (r.cnic || "").trim() === v && v);
      if (match) {
        next.owner_name = match.owner_name || next.owner_name;
        next.owner_guardian = match.owner_guardian || next.owner_guardian;
        next.guardian_relation = match.guardian_relation || next.guardian_relation;
        next.passport_no = match.passport_no || next.passport_no;
        next.present_address = match.present_address || next.present_address;
      }
      return next;
    });

  // wealth line-item helpers
  const items = form.details.items || [];
  const setItems = (next) =>
    setForm((f) => ({
      ...f,
      details: { ...f.details, items: typeof next === "function" ? next(f.details.items || []) : next },
    }));
  const addItem = (section) => setItems([...items, { section, description: "", ownership: "", value_pkr: "" }]);
  const updItem = (i, k, v) => setItems(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const delItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const itemsTotal = items.reduce((t, i) => t + (Number(i.value_pkr) || 0), 0);

  // Equivalent value = market value (PKR) ÷ exchange rate, kept in sync whenever
  // either input changes so it never has to be worked out by hand.
  const equiv = (pkr, rate) => {
    const p = Number(pkr), r = Number(rate);
    return pkr !== "" && rate !== "" && r ? (p / r).toFixed(2) : "";
  };
  const setPkr = (v) =>
    setForm((f) => ({ ...f, market_value_pkr: v, market_value_cad: equiv(v, f.exchange_rate) }));
  const setRate = (v) =>
    setForm((f) => ({ ...f, exchange_rate: v, market_value_cad: equiv(f.market_value_pkr, v) }));

  // Wealth automation: group the same client's other valuation reports so a
  // net-worth statement can be assembled from them in a couple of clicks.
  const [wealthSourceKey, setWealthSourceKey] = useState("");
  const [wealthPicks, setWealthPicks] = useState([]);
  const ownerGroups = useMemo(() => {
    const m = new Map();
    for (const r of reports) {
      if (r.valuation_type === "wealth") continue;
      const key = (r.cnic || r.owner_name || "").trim();
      if (!key) continue;
      if (!m.has(key)) m.set(key, { key, owner_name: r.owner_name, cnic: r.cnic, reports: [] });
      m.get(key).reports.push(r);
    }
    return [...m.values()];
  }, [reports]);
  const activeGroup = ownerGroups.find((g) => g.key === wealthSourceKey) || null;

  // An imported valuation report becomes an appraised-asset line, tagged with
  // source_ref so it stays in sync with the checkboxes and survives save().
  const assetLine = (r) => ({
    section: "asset",
    description: describeReport(r),
    ownership: r.owner_name || "",
    value_pkr: r.market_value_pkr ?? "",
    source_ref: r.reference,
  });

  function pickWealthOwner(key) {
    setWealthSourceKey(key);
    const g = ownerGroups.find((o) => o.key === key);
    if (!g) {
      setWealthPicks([]);
      setItems((prev) => prev.filter((i) => !i.source_ref)); // drop prior client's imports
      return;
    }
    const rep = g.reports[0];
    setForm((f) => ({
      ...f,
      owner_name: f.owner_name || rep.owner_name || "",
      owner_guardian: f.owner_guardian || rep.owner_guardian || "",
      guardian_relation: rep.guardian_relation || f.guardian_relation,
      cnic: f.cnic || rep.cnic || "",
      passport_no: f.passport_no || rep.passport_no || "",
      present_address: f.present_address || rep.present_address || "",
      currency_code: rep.currency_code || f.currency_code,
      exchange_rate: f.exchange_rate || (rep.exchange_rate ?? "") || "",
    }));
    setWealthPicks(g.reports.map((r) => r.id));
    // Auto-fill every one of this client's reports as asset lines, keeping any
    // manually-entered items (e.g. liquid funds) and replacing prior imports.
    setItems((prev) => [...prev.filter((i) => !i.source_ref), ...g.reports.map(assetLine)]);
  }

  // Ticking/unticking a report adds or removes its asset line automatically.
  function togglePick(r) {
    const on = wealthPicks.includes(r.id);
    setWealthPicks((p) => (on ? p.filter((x) => x !== r.id) : [...p, r.id]));
    setItems((prev) => {
      if (on) return prev.filter((i) => i.source_ref !== r.reference);
      if (prev.some((i) => i.source_ref === r.reference)) return prev;
      return [...prev, assetLine(r)];
    });
  }

  async function onPdf(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/extract", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Extraction failed");
      const p = d.parsed || {};
      setForm({
        ...EMPTY,
        reference: p.reference || "",
        valuation_type: p.valuation_type || "gold",
        status: "verified",
        owner_name: p.owner_name || "",
        owner_guardian: p.owner_guardian || "",
        guardian_relation: "wife",
        cnic: p.cnic || "",
        passport_no: p.passport_no || "",
        report_date: p.report_date || "",
        present_address: p.present_address || "",
        permanent_address: p.permanent_address || "",
        remarks: p.remarks || "",
        market_value_pkr: p.market_value_pkr ?? "",
        market_value_cad: p.market_value_cad ?? equiv(p.market_value_pkr ?? "", p.exchange_rate ?? ""),
        currency_code: p.currency_code || "USD",
        exchange_rate: p.exchange_rate ?? "",
        pdf_filename: d.filename || "",
        details: p.details || {},
      });
      setEditingId(null);
      setMsg({ type: "ok", text: "Extracted from PDF. Review every field, then save." });
    } catch (err) {
      setMsg({ type: "err", text: err.message });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const numOrNull = (v) => (v === "" || v == null ? null : Number(v));

    let details;
    let mvp = numOrNull(form.market_value_pkr);
    let mvc = numOrNull(form.market_value_cad);

    if (form.valuation_type === "wealth") {
      const cleaned = items
        .filter((i) => i.description || i.value_pkr)
        .map((i) => ({
          section: i.section === "liquid" ? "liquid" : i.section === "support" ? "support" : "asset",
          description: (i.description || "").trim(),
          ownership: (i.ownership || "").trim() || null,
          value_pkr: i.value_pkr === "" ? null : Number(i.value_pkr),
        }));
      details = {
        items: cleaned,
        support_letter_date: form.details.support_letter_date || null,
        support_notarised: !!form.details.support_notarised,
      };
      const total = cleaned.reduce((t, i) => t + (i.value_pkr || 0), 0);
      mvp = total || mvp;
      if (form.exchange_rate) mvc = mvp / Number(form.exchange_rate);
    } else {
      const cfg = DETAIL_CONFIG[form.valuation_type] || [];
      details = {};
      for (const [k, , type] of cfg) {
        const v = form.details[k];
        if (v === "" || v == null) continue;
        details[k] = type === "number" ? Number(v) : v;
      }
    }

    const payload = {
      reference: form.reference.trim(),
      valuation_type: form.valuation_type,
      status: form.status,
      owner_name: form.owner_name.trim(),
      owner_guardian: form.owner_guardian.trim() || null,
      guardian_relation: form.guardian_relation,
      cnic: form.cnic.trim(),
      passport_no: form.passport_no.trim() || null,
      report_date: form.report_date || null,
      valid_until: form.valid_until || null,
      present_address: form.present_address.trim() || null,
      permanent_address: null,
      remarks: form.remarks.trim() || null,
      market_value_pkr: mvp,
      market_value_cad: mvc,
      currency_code: form.currency_code,
      exchange_rate: numOrNull(form.exchange_rate),
      pdf_filename: form.pdf_filename || null,
      details,
    };
    try {
      const url = editingId ? `/api/admin/reports/${editingId}` : "/api/admin/reports";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Save failed");
      setMsg({ type: "ok", text: `Saved ${payload.reference}.` });
      resetForm();
      load();
    } catch (err) {
      setMsg({ type: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(r, status) {
    const res = await fetch(`/api/admin/reports/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  }
  async function remove(r) {
    if (!confirm(`Delete ${r.reference}? This cannot be undone.`)) return;
    if ((await fetch(`/api/admin/reports/${r.id}`, { method: "DELETE" })).ok) load();
  }
  function edit(r) {
    setForm(fromRecord(r));
    setEditingId(r.id);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function showQr(r) {
    const link = `${origin}/v/${r.verify_token}`;
    setQr({ reference: r.reference, link, dataUrl: await QRCode.toDataURL(link, { width: 320, margin: 1 }) });
  }
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  async function uploadImage(field, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: reader.result }),
      });
      const d = await res.json();
      if (res.ok) setSettings(d.settings);
      else alert(d.error || "Upload failed");
    };
    reader.readAsDataURL(file);
  }
  async function saveText(field, value) {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) setSettings((await res.json()).settings);
  }

  const isWealth = form.valuation_type === "wealth";
  const detailCfg = DETAIL_CONFIG[form.valuation_type] || [];

  return (
    <div className="admin-route admin">
      <header className="admin-top">
        <span className="admin-brand">
          <span className="brand-name-1">Prudent</span> <span className="brand-name-2">Valuations</span>
          <span className="admin-tag">Admin</span>
        </span>
        <button className="admin-logout" onClick={logout}>Log out</button>
      </header>

      <main className="admin-main">
        {/* Signature & seal */}
        <section className="admin-card">
          <div className="admin-card__head">
            <h2>Signature &amp; seal</h2>
            <span className="admin-muted">Used on valuation reports (property, gold, vehicle, movable)</span>
          </div>
          <div className="admin-grid">
            <div className="admin-field">
              <span>Signature / stamp image</span>
              {settings.signature_data && <img className="admin-thumb" src={settings.signature_data} alt="signature" />}
              <input type="file" accept="image/*" onChange={(e) => uploadImage("signature_data", e.target.files?.[0])} />
            </div>
            <div className="admin-field">
              <span>Separate seal (optional)</span>
              {settings.seal_data && <img className="admin-thumb" src={settings.seal_data} alt="seal" />}
              <input type="file" accept="image/*" onChange={(e) => uploadImage("seal_data", e.target.files?.[0])} />
            </div>
            <div className="admin-field">
              <span>Signatory title</span>
              <input
                defaultValue={settings.signatory_name || "Director (Valuations)"}
                onBlur={(e) => saveText("signatory_name", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Wealth statement signature & seal */}
        <section className="admin-card">
          <div className="admin-card__head">
            <h2>Wealth statement signature &amp; seal</h2>
            <span className="admin-muted">Used only on Statement of Net Worth reports</span>
          </div>
          <div className="admin-grid">
            <div className="admin-field">
              <span>Signature / stamp image</span>
              {settings.wealth_signature_data && <img className="admin-thumb" src={settings.wealth_signature_data} alt="wealth signature" />}
              <input type="file" accept="image/*" onChange={(e) => uploadImage("wealth_signature_data", e.target.files?.[0])} />
            </div>
            <div className="admin-field">
              <span>Separate seal (optional)</span>
              {settings.wealth_seal_data && <img className="admin-thumb" src={settings.wealth_seal_data} alt="wealth seal" />}
              <input type="file" accept="image/*" onChange={(e) => uploadImage("wealth_seal_data", e.target.files?.[0])} />
            </div>
            <div className="admin-field">
              <span>Signatory title</span>
              <input
                defaultValue={settings.wealth_signatory_name || "Chartered Accountant (Director)"}
                onBlur={(e) => saveText("wealth_signatory_name", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Add / edit form */}
        <section className="admin-card">
          <div className="admin-card__head">
            <h2>{editingId ? "Edit report" : "Add a report"}</h2>
            {editingId && <button className="admin-link" onClick={resetForm}>+ New instead</button>}
          </div>

          {!editingId && (
            <label className="admin-upload">
              <input type="file" accept="application/pdf" onChange={onPdf} disabled={busy} />
              <span>{busy ? "Reading PDF…" : "📄 Upload a draft PDF to auto-fill (optional)"}</span>
            </label>
          )}

          {msg && <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>{msg.text}</p>}

          <form className="admin-form" onSubmit={save}>
            <h3 className="admin-sub">Report</h3>
            <div className="admin-grid">
              <Field label="Reference * (auto)">
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <input style={{ flex: 1 }} value={form.reference} onChange={(e) => set("reference", e.target.value)} required />
                  <button type="button" className="btn btn-ghost" onClick={regenRef} title="Generate a new reference">↻</button>
                </div>
              </Field>
              <Field label="Type *">
                <select value={form.valuation_type} onChange={(e) => set("valuation_type", e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </Field>
              <Field label="Status *">
                <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </Field>
              <Field label="Report date"><input type="date" value={form.report_date || ""} onChange={(e) => set("report_date", e.target.value)} /></Field>
              <Field label="Valid until"><input type="date" value={form.valid_until || ""} onChange={(e) => set("valid_until", e.target.value)} /></Field>
            </div>

            <h3 className="admin-sub">Client</h3>
            <div className="admin-grid">
              <Field label="Owner name *"><input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} required /></Field>
              <Field label="Relation">
                <select value={form.guardian_relation} onChange={(e) => set("guardian_relation", e.target.value)}>
                  {RELATIONS.map((rel) => <option key={rel} value={rel}>{rel} of</option>)}
                </select>
              </Field>
              <Field label="Guardian / spouse name"><input value={form.owner_guardian} onChange={(e) => set("owner_guardian", e.target.value)} /></Field>
              <Field label="CNIC * (auto-fills known clients)"><input value={form.cnic} onChange={(e) => setCnic(e.target.value)} inputMode="numeric" maxLength={15} placeholder="xxxxx-xxxxxxx-x" required /></Field>
              <Field label="Passport"><input value={form.passport_no} onChange={(e) => set("passport_no", e.target.value)} /></Field>
            </div>
            <Field label="Address"><textarea rows={2} value={form.present_address} onChange={(e) => set("present_address", e.target.value)} /></Field>

            <h3 className="admin-sub">Valuation</h3>
            <div className="admin-grid">
              {!isWealth && (
                <Field label="Market value (PKR)"><input type="number" step="0.01" value={form.market_value_pkr} onChange={(e) => setPkr(e.target.value)} /></Field>
              )}
              <Field label="Equivalent currency">
                <select value={form.currency_code} onChange={(e) => set("currency_code", e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={`Exchange rate (1 ${form.currency_code} = ? PKR)`}><input type="number" step="0.0001" value={form.exchange_rate} onChange={(e) => setRate(e.target.value)} /></Field>
              {!isWealth && (
                <Field label={`Equivalent value (${form.currency_code}) — auto`}>
                  <input type="number" step="0.01" value={form.market_value_cad} readOnly tabIndex={-1} title="Automatically calculated from Market value (PKR) ÷ Exchange rate" />
                </Field>
              )}
            </div>

            {isWealth ? (
              <>
                <h3 className="admin-sub">Generate from existing reports</h3>
                <div className="admin-grid">
                  <Field label="Pick a client (from their valuation reports)">
                    <select value={wealthSourceKey} onChange={(e) => pickWealthOwner(e.target.value)}>
                      <option value="">— Select a client —</option>
                      {ownerGroups.map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.owner_name} {g.cnic ? `· ${g.cnic}` : ""} ({g.reports.length})
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {activeGroup && (
                  <>
                    <table className="admin-items">
                      <thead>
                        <tr><th></th><th>Reference</th><th>Type</th><th>Value (PKR)</th></tr>
                      </thead>
                      <tbody>
                        {activeGroup.reports.map((r) => (
                          <tr key={r.id}>
                            <td style={{ width: 28, textAlign: "center" }}>
                              <input type="checkbox" checked={wealthPicks.includes(r.id)} onChange={() => togglePick(r)} />
                            </td>
                            <td className="admin-mono">{r.reference}</td>
                            <td>{TYPE_LABEL[r.valuation_type] || r.valuation_type}</td>
                            <td>{r.market_value_pkr != null ? Number(r.market_value_pkr).toLocaleString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="admin-muted">Ticked reports are added below as appraised-asset lines automatically. Add an exchange rate above to show the equivalent value.</p>
                  </>
                )}

                <h3 className="admin-sub">Net-worth line items</h3>
                <p className="admin-muted">
                  Total: PKR {itemsTotal.toLocaleString()} {form.exchange_rate ? `(≈ ${form.currency_code} ${(itemsTotal / Number(form.exchange_rate)).toLocaleString(undefined, { maximumFractionDigits: 2 })})` : ""}
                </p>
                <table className="admin-items">
                  <thead>
                    <tr><th>Section</th><th>Description</th><th>Ownership</th><th>Value (PKR)</th><th></th></tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i}>
                        <td>
                          <select value={it.section} onChange={(e) => updItem(i, "section", e.target.value)}>
                            <option value="liquid">Liquid (cash/bank)</option>
                            <option value="asset">Asset (appraised)</option>
                            <option value="support">Spousal support (spouse-owned)</option>
                          </select>
                        </td>
                        <td><input value={it.description} onChange={(e) => updItem(i, "description", e.target.value)} placeholder="e.g. Meezan Bank a/c …" /></td>
                        <td><input value={it.ownership} onChange={(e) => updItem(i, "ownership", e.target.value)} placeholder="e.g. Applicant / Joint / Spouse" /></td>
                        <td><input type="number" step="0.01" value={it.value_pkr} onChange={(e) => updItem(i, "value_pkr", e.target.value)} /></td>
                        <td><button type="button" className="admin-link admin-link--danger" onClick={() => delItem(i)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => addItem("liquid")}>+ Liquid fund</button>
                  <button type="button" className="btn btn-ghost" onClick={() => addItem("asset")}>+ Asset</button>
                  <button type="button" className="btn btn-ghost" onClick={() => addItem("support")}>+ Spousal support</button>
                </div>
                <p className="admin-muted">
                  Mark funds legally owned by the spouse as <strong>Spousal support</strong>. They are certified as
                  committed financial support, not the applicant&rsquo;s personal net worth, and this switches the report
                  to the IRCC &ldquo;Personal Net Worth &amp; Spousal Financial Support&rdquo; format.
                </p>
                <div className="admin-grid">
                  <Field label="Spouse support letter date">
                    <input type="date" value={form.details.support_letter_date || ""} onChange={(e) => setDetail("support_letter_date", e.target.value)} />
                  </Field>
                  <label className="admin-field">
                    <span>Support letter is notarised</span>
                    <select value={form.details.support_notarised ? "yes" : "no"} onChange={(e) => setDetail("support_notarised", e.target.value === "yes")}>
                      <option value="no">No — signed only</option>
                      <option value="yes">Yes — signed &amp; notarised</option>
                    </select>
                  </label>
                </div>
              </>
            ) : (
              <>
                <h3 className="admin-sub">{TYPE_LABEL[form.valuation_type]} details</h3>
                <div className="admin-grid">
                  {detailCfg.map(([k, label, type]) =>
                    type === "textarea" ? null : (
                      <Field label={label} key={k}>
                        <input
                          type={type === "number" ? "number" : "text"}
                          step={type === "number" ? "any" : undefined}
                          value={form.details[k] ?? ""}
                          onChange={(e) => setDetail(k, e.target.value)}
                        />
                      </Field>
                    )
                  )}
                </div>
                {detailCfg
                  .filter(([, , type]) => type === "textarea")
                  .map(([k, label]) => (
                    <Field label={label} key={k}>
                      <textarea rows={2} value={form.details[k] ?? ""} onChange={(e) => setDetail(k, e.target.value)} />
                    </Field>
                  ))}
              </>
            )}

            <h3 className="admin-sub">Remarks</h3>
            <Field label="Remarks paragraph"><textarea rows={4} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} /></Field>

            <div className="admin-actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Saving…" : editingId ? "Update report" : "Save report"}
              </button>
              {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </section>

        {/* Reports list */}
        <section className="admin-card">
          <div className="admin-card__head">
            <h2>Reports ({reports.length})</h2>
            <button className="admin-link" onClick={load}>Refresh</button>
          </div>
          {loading ? (
            <p className="admin-muted">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="admin-muted">No reports yet. Add one above.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Reference</th><th>Type</th><th>Owner</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td className="admin-mono">{r.reference}</td>
                      <td>{r.valuation_type}</td>
                      <td>{r.owner_name}</td>
                      <td>
                        <select className={`admin-status admin-status--${r.status}`} value={r.status} onChange={(e) => changeStatus(r, e.target.value)}>
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </td>
                      <td className="admin-row-actions">
                        <a className="admin-link" href={`/admin/report/${r.id}`} target="_blank" rel="noreferrer">Report</a>
                        <button className="admin-link" onClick={() => showQr(r)}>QR</button>
                        <button className="admin-link" onClick={() => edit(r)}>Edit</button>
                        <button className="admin-link admin-link--danger" onClick={() => remove(r)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {qr && (
        <div className="admin-modal" onClick={() => setQr(null)}>
          <div className="admin-modal__card" onClick={(e) => e.stopPropagation()}>
            <h3>QR for {qr.reference}</h3>
            <img src={qr.dataUrl} alt={`QR code for ${qr.reference}`} width={240} height={240} />
            <p className="admin-qr-link">{qr.link}</p>
            <div className="admin-actions">
              <a className="btn btn-primary" href={qr.dataUrl} download={`qr-${qr.reference.replace(/\W+/g, "-")}.png`}>Download QR</a>
              <button className="btn btn-ghost" onClick={() => setQr(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
