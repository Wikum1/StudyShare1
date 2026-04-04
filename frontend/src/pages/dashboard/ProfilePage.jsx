import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken, getStoredUser } from "../../utils/authStorage";
import { apiUrl } from "../../config/api";
import "./ProfilePage.css";

function formatJoined(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = getAuthToken();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("about");

  const [form, setForm] = useState({
    name: "",
    email: "",
    university: "",
    year: "",
    modules: "",
    password: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiUrl("/api/profile/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.message || "Could not load profile");
          setUser(null);
          return;
        }
        const u = data.user;
        setUser(u);
        setForm({
          name: u.name || "",
          email: u.email || "",
          university: u.university || "",
          year: u.year != null && u.year !== "" ? String(u.year) : "",
          modules: Array.isArray(u.modules) ? u.modules.join(", ") : "",
          password: "",
        });
      } catch {
        if (!cancelled) setError("Server error while loading profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  const initials = useMemo(() => {
    const n = user?.name || form.name || "?";
    const parts = String(n).trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[1][0]).toUpperCase();
    return String(n).slice(0, 2).toUpperCase();
  }, [user, form.name]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        university: form.university.trim(),
        modules: form.modules
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
      };
      if (form.year.trim() === "") body.year = null;
      else body.year = Number(form.year);
      if (form.password.trim()) body.password = form.password;

      const res = await fetch(apiUrl("/api/profile/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }
      setUser(data.user);
      setSuccess(data.message || "Profile updated successfully");
      setForm((f) => ({ ...f, password: "" }));

      const stored = getStoredUser();
      if (stored && data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            name: data.user.name,
            email: data.user.email,
          })
        );
      }
      setTab("about");
    } catch {
      setError("Server error while saving");
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <div className="profile-page--fb">
      <div
        className={`profile-fb-cover ${loading ? "profile-fb-cover--loading" : ""}`}
      >
        {!loading && <div className="profile-fb-cover-image" aria-hidden />}
      </div>

      <div className="profile-fb-inner">
        {loading ? (
          <p className="profile-fb-loading-text">Loading your profile…</p>
        ) : (
          <>
            {error && (
              <div className="profile-fb-alert profile-fb-alert--error">
                {error}
              </div>
            )}
            {success && (
              <div className="profile-fb-alert profile-fb-alert--success">
                {success}
              </div>
            )}

            <div className="profile-fb-avatar-row">
              <div className="profile-fb-avatar" aria-hidden>
                {initials}
              </div>
            </div>

            <div className="profile-fb-headline">
              <h1 className="profile-fb-name">
                {user?.name || "Student"}
                {user?.role === "admin" && (
                  <span className="profile-fb-verified" title="Admin">
                    ✓
                  </span>
                )}
              </h1>
              <p className="profile-fb-stats">
                {user?.email}
                {user?.role ? ` · ${user.role}` : ""}
                {user?.createdAt
                  ? ` · Joined ${formatJoined(user.createdAt)}`
                  : ""}
              </p>
              {user?.university ? (
                <p className="profile-fb-bio">{user.university}</p>
              ) : (
                <p className="profile-fb-bio">
                  Add your university and modules so classmates can find you.
                </p>
              )}
            </div>

            <div className="profile-fb-actions">
              <button
                type="button"
                className="profile-fb-btn-primary profile-fb-btn-primary--wide"
                onClick={() => {
                  setSuccess("");
                  setTab("edit");
                }}
              >
                Edit profile
              </button>
              <Link
                className="profile-fb-btn-secondary profile-fb-btn-secondary--wide"
                to="/dashboard/my-resources"
              >
                My resources
              </Link>
            </div>

            <div className="profile-fb-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "about"}
                className={`profile-fb-tab ${tab === "about" ? "profile-fb-tab--active" : ""}`}
                onClick={() => setTab("about")}
              >
                About
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "edit"}
                className={`profile-fb-tab ${tab === "edit" ? "profile-fb-tab--active" : ""}`}
                onClick={() => setTab("edit")}
              >
                Edit
              </button>
            </div>

            {tab === "about" && (
              <div className="profile-fb-panel">
                <h2 className="profile-fb-section-title">Details</h2>
                <ul className="profile-fb-details">
                  <li>
                    <span className="profile-fb-detail-icon" aria-hidden>
                      🎓
                    </span>
                    <span>
                      <strong>University</strong>
                      <br />
                      {user?.university || "Not set"}
                    </span>
                  </li>
                  <li>
                    <span className="profile-fb-detail-icon" aria-hidden>
                      📅
                    </span>
                    <span>
                      <strong>Year</strong>
                      <br />
                      {user?.year != null && user.year !== ""
                        ? user.year
                        : "Not set"}
                    </span>
                  </li>
                  <li>
                    <span className="profile-fb-detail-icon" aria-hidden>
                      📚
                    </span>
                    <span>
                      <strong>Modules</strong>
                      <br />
                      {Array.isArray(user?.modules) && user.modules.length ? (
                        user.modules.join(", ")
                      ) : (
                        <span className="profile-fb-muted">None added yet</span>
                      )}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {tab === "edit" && (
              <div className="profile-fb-panel">
                <div className="profile-fb-edit-head">
                  <h2 className="profile-fb-edit-title">Edit your profile</h2>
                  <p className="profile-fb-muted">
                    Update how you appear on StudyShare. Leave password blank to
                    keep your current one.
                  </p>
                </div>
                <form className="profile-fb-form" onSubmit={handleSave}>
                  <label className="profile-fb-field">
                    <span>Name</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="profile-fb-field">
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleFormChange}
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="profile-fb-field">
                    <span>University</span>
                    <input
                      name="university"
                      value={form.university}
                      onChange={handleFormChange}
                      placeholder="e.g. University of Colombo"
                    />
                  </label>
                  <label className="profile-fb-field">
                    <span>Year (1–10)</span>
                    <input
                      name="year"
                      inputMode="numeric"
                      value={form.year}
                      onChange={handleFormChange}
                      placeholder="e.g. 2"
                    />
                  </label>
                  <label className="profile-fb-field">
                    <span>Modules</span>
                    <textarea
                      name="modules"
                      value={form.modules}
                      onChange={handleFormChange}
                      placeholder="Comma-separated, e.g. CS101, MA201"
                    />
                  </label>
                  <label className="profile-fb-field">
                    <span>New password (optional)</span>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleFormChange}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                    />
                  </label>
                  <div className="profile-fb-form-actions">
                    <button
                      type="submit"
                      className="profile-fb-btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                    <button
                      type="button"
                      className="profile-fb-btn-secondary"
                      onClick={() => setTab("about")}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
