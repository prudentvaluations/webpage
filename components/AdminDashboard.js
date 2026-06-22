"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

const STATUSES = ["under_review", "verified", "rejected"];
const STATUS_LABEL = { under_review: "Under Review", verified: "Verified", rejected: "Rejected" };
const TYPES = ["gold", "vehicle", "property"];

const EMPTY = {
  reference: "",
  valuation_type: "gold",
  status: "verified",
  owner_name: "",
  owner_guardian: "",
  cnic: "",
  passport_no: "",
  report_date: "",
  market_value_pkr: "",
  market_value_cad: "",
  exchange_rate: "",
  valid_until: "",
  detailsText: "{}",
  pdf_filename: "",
};

function fromRecord(r) {
  return {
    reference: r.reference || "",
    valuation_type: r.valuation_type || "gold",
    status: r.status || "verified",
    owner_name: r.owner_name || "",
    owner_guardian: r.owner_guardian || "",
    cnic: r.cnic || "",
    passport_no: r.passport_no || "",
    report_date: r.report_date || "",
    market_value_pkr: r.market_value_pkr ?? "",
    market_value_cad: r.market_value_cad ?? "",
    exchange_rate: r.exchange_rate ?? "",
    valid_until: r.valid_until || "",
    detailsText: JSON.stringify(r.details || {}, null, 2),
    pdf_filename: r.pdf_filename || "",
  };
}

export default function AdminDashboard({ siteUrl }) {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // {type, text}
  const [qr, setQr] = useState(null); // {reference, link, dataUrl}

  const origin = siteUrl || (typeof window !== "undefined" ? window.location.origin : "");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const d = await res.json();
    setReports(d.reports || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
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
        reference: p.reference || "",
        valuation_type: p.valuation_type || "gold",
        status: "verified",
        owner_name: p.owner_name || "",
        owner_guardian: p.owner_guardian || "",
        cnic: p.cnic || "",
        passport_no: p.passport_no || "",
        report_date: p.report_date || "",
        market_value_pkr: p.market_value_pkr ?? "",
        market_value_cad: p.market_value_cad ?? "",
        exchange_rate: p.exchange_rate ?? "",
        valid_until: "",
        detailsText: JSON.stringify(p.details || {}, null, 2),
        pdf_filename: d.filename || "",
      });
      setEditingId(null);
      setMsg({ type: "ok", text: "Extracted from PDF. Review the fields, then save." });
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
    let details;
    try {
      details = JSON.parse(form.detailsText || "{}");
    } catch {
      setBusy(false);
      setMsg({ type: "err", text: "Details is not valid JSON." });
      return;
    }
    const payload = {
      reference: form.reference.trim(),
      valuation_type: form.valuation_type,
      status: form.status,
      owner_name: form.owner_name.trim(),
      owner_guardian: form.owner_guardian.trim() || null,
      cnic: form.cnic.trim(),
      passport_no: form.passport_no.trim() || null,
      report_date: form.report_date || null,
      market_value_pkr: form.market_value_pkr === "" ? null : Number(form.market_value_pkr),
      market_value_cad: form.market_value_cad === "" ? null : Number(form.market_value_cad),
      exchange_rate: form.exchange_rate === "" ? null : Number(form.exchange_rate),
      valid_until: form.valid_until || null,
      details,
      pdf_filename: form.pdf_filename || null,
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
    const res = await fetch(`/api/admin/reports/${r.id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  function edit(r) {
    setForm(fromRecord(r));
    setEditingId(r.id);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function showQr(r) {
    const link = `${origin}/v/${r.verify_token}`;
    const dataUrl = await QRCode.toDataURL(link, { width: 320, margin: 1 });
    setQr({ reference: r.reference, link, dataUrl });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-route admin">
      <header className="admin-top">
        <span className="admin-brand">
          <span className="brand-name-1">Prudent</span> <span className="brand-name-2">Valuations</span>
          <span className="admin-tag">Admin</span>
        </span>
        <button className="admin-logout" onClick={logout}>
          Log out
        </button>
      </header>

      <main className="admin-main">
        {/* Add / edit form */}
        <section className="admin-card">
          <div className="admin-card__head">
            <h2>{editingId ? "Edit report" : "Add a report"}</h2>
            {editingId && (
              <button className="admin-link" onClick={resetForm}>
                + New instead
              </button>
            )}
          </div>

          {!editingId && (
            <label className="admin-upload">
              <input type="file" accept="application/pdf" onChange={onPdf} disabled={busy} />
              <span>{busy ? "Reading PDF…" : "📄 Upload a final report PDF to auto-fill"}</span>
            </label>
          )}

          {msg && <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>{msg.text}</p>}

          <form className="admin-form" onSubmit={save}>
            <div className="admin-grid">
              <Field label="Reference *">
                <input value={form.reference} onChange={(e) => set("reference", e.target.value)} required />
              </Field>
              <Field label="Type *">
                <select value={form.valuation_type} onChange={(e) => set("valuation_type", e.target.value)}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status *">
                <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Owner name *">
                <input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} required />
              </Field>
              <Field label="Guardian (w/o)">
                <input value={form.owner_guardian} onChange={(e) => set("owner_guardian", e.target.value)} />
              </Field>
              <Field label="CNIC *">
                <input value={form.cnic} onChange={(e) => set("cnic", e.target.value)} required />
              </Field>
              <Field label="Passport">
                <input value={form.passport_no} onChange={(e) => set("passport_no", e.target.value)} />
              </Field>
              <Field label="Report date">
                <input type="date" value={form.report_date || ""} onChange={(e) => set("report_date", e.target.value)} />
              </Field>
              <Field label="Valid until">
                <input type="date" value={form.valid_until || ""} onChange={(e) => set("valid_until", e.target.value)} />
              </Field>
              <Field label="Value (PKR)">
                <input type="number" step="0.01" value={form.market_value_pkr} onChange={(e) => set("market_value_pkr", e.target.value)} />
              </Field>
              <Field label="Value (CAD)">
                <input type="number" step="0.01" value={form.market_value_cad} onChange={(e) => set("market_value_cad", e.target.value)} />
              </Field>
              <Field label="Exchange rate">
                <input type="number" step="0.0001" value={form.exchange_rate} onChange={(e) => set("exchange_rate", e.target.value)} />
              </Field>
            </div>
            <Field label="Type-specific details (JSON)">
              <textarea rows={6} value={form.detailsText} onChange={(e) => set("detailsText", e.target.value)} spellCheck={false} />
            </Field>
            <div className="admin-actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Saving…" : editingId ? "Update report" : "Save report"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Reports list */}
        <section className="admin-card">
          <div className="admin-card__head">
            <h2>Reports ({reports.length})</h2>
            <button className="admin-link" onClick={load}>
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="admin-muted">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="admin-muted">No reports yet. Add one above.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td className="admin-mono">{r.reference}</td>
                      <td>{r.valuation_type}</td>
                      <td>{r.owner_name}</td>
                      <td>
                        <select
                          className={`admin-status admin-status--${r.status}`}
                          value={r.status}
                          onChange={(e) => changeStatus(r, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="admin-row-actions">
                        <button className="admin-link" onClick={() => showQr(r)}>
                          QR
                        </button>
                        <button className="admin-link" onClick={() => edit(r)}>
                          Edit
                        </button>
                        <button className="admin-link admin-link--danger" onClick={() => remove(r)}>
                          Delete
                        </button>
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
            <img src={qr.dataUrl} alt={`QR code for ${qr.reference}`} width={260} height={260} />
            <p className="admin-qr-link">{qr.link}</p>
            <div className="admin-actions">
              <a className="btn btn-primary" href={qr.dataUrl} download={`qr-${qr.reference.replace(/\W+/g, "-")}.png`}>
                Download QR
              </a>
              <button className="btn btn-ghost" onClick={() => setQr(null)}>
                Close
              </button>
            </div>
            <p className="admin-muted">Place this QR on the PDF. Scanning it opens the verified record.</p>
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
