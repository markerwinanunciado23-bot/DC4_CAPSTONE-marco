import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function ResourceManager({
  title,
  endpoint,
  fields,
  columns,
  description,
}) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(endpoint, {
        params: { search, page },
      });

      setItems(response.data.data || []);
      setLastPage(response.data.meta?.last_page || 1);
    } catch (err) {
      setError(err.response?.data?.message || `Could not load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, search, title]);

  useEffect(() => {
    const timer = setTimeout(loadItems, 250);
    return () => clearTimeout(timer);
  }, [loadItems]);

  function startCreate() {
    const initial = {};

    fields.forEach((field) => {
      initial[field.name] = field.defaultValue ?? "";
    });

    setForm(initial);
    setEditing(null);
    setErrors({});
    setShowForm(true);
    setSuccess("");
  }

  async function startEdit(item) {
    setError("");
    setErrors({});

    try {
      const response = await api.get(`${endpoint}/${item.id}`);
      const record = response.data.data || response.data;
      const values = {};

      fields.forEach((field) => {
        values[field.name] = record[field.name] ?? "";
      });

      setForm(values);
      setEditing(item.id);
      setShowForm(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load the record.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setError("");
    setSuccess("");

    const nextErrors = {};

    fields.forEach((field) => {
      const value = form[field.name];

      if (field.required && (value === "" || value == null)) {
        nextErrors[field.name] = `${field.label} is required.`;
      }

      if (field.type === "number" && value !== "" && Number(value) < 0) {
        nextErrors[field.name] = `${field.label} cannot be negative.`;
      }
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);

    try {
      const payload = {};

      fields.forEach((field) => {
        const value = form[field.name];

        if (field.type === "number" && value !== "") {
          payload[field.name] = Number(value);
        } else if (value !== "") {
          payload[field.name] = value;
        } else {
          payload[field.name] = field.nullable ? null : value;
        }
      });

      if (editing) {
        await api.put(`${endpoint}/${editing}`, payload);
        setSuccess("Record updated successfully.");
      } else {
        await api.post(endpoint, payload);
        setSuccess("Record created successfully.");
      }

      setShowForm(false);
      setEditing(null);
      await loadItems();
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};

      if (Object.keys(serverErrors).length) {
        setErrors(serverErrors);
      } else {
        setError(err.response?.data?.message || "Could not save the record.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete this record from ${title}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`${endpoint}/${item.id}`);
      setSuccess("Record deleted successfully.");

      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadItems();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this record.");
    }
  }

  function fieldError(name) {
    const value = errors[name];
    return Array.isArray(value) ? value[0] : value;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MANAGEMENT</span>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </div>
        <button className="button-primary" onClick={startCreate}>
          <Plus size={18} /> Add {title.replace(/s$/, "")}
        </button>
      </div>

      {success && <div className="alert success-alert">{success}</div>}
      {error && <div className="alert error-alert">{error}</div>}

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="button-secondary" onClick={loadItems}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="page-loading">Loading records...</div>
        ) : items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key] ?? "—")}
                      </td>
                    ))}
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          title="Edit"
                          onClick={() => startEdit(item)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button danger-icon"
                          title="Delete"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No records found.</p>
            <button className="button-secondary" onClick={startCreate}>
              <Plus size={16} /> Add your first record
            </button>
          </div>
        )}

        <div className="pagination">
          <span>Page {page} of {lastPage}</span>
          <div>
            <button
              className="button-secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <button
              className="button-secondary"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <section className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</span>
                <h2>{editing ? "Update" : "Create"} {title.replace(/s$/, "")}</h2>
              </div>
              <button className="icon-button" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="form-stack" onSubmit={handleSubmit}>
              {fields.map((field) => (
                <label key={field.name}>
                  {field.label}
                  {field.type === "select" ? (
                    <select
                      value={form[field.name] ?? ""}
                      required={field.required}
                      onChange={(event) =>
                        setForm({ ...form, [field.name]: event.target.value })
                      }
                    >
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={form[field.name] ?? ""}
                      required={field.required}
                      onChange={(event) =>
                        setForm({ ...form, [field.name]: event.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={form[field.name] ?? ""}
                      required={field.required}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      onChange={(event) =>
                        setForm({ ...form, [field.name]: event.target.value })
                      }
                    />
                  )}
                  {fieldError(field.name) && (
                    <small className="field-error">{fieldError(field.name)}</small>
                  )}
                </label>
              ))}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="button-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}