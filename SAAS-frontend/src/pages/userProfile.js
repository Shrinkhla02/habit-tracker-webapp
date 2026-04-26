
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "********", // hidden
    plan: "Free",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Get logged-in user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setForm({
        name: userObj.name || "",
        email: userObj.email || "",
        password: "********", // hidden
        plan: userObj.isPro ? "Premium" : "Free",
      });
      setLoading(false);
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Update profile in MongoDB via backend API
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          isPro: form.plan === "Premium"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update localStorage with fresh data from backend
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setForm({
        ...form,
        name: data.user.name,
        email: data.user.email,
        plan: data.user.isPro ? "Premium" : "Free"
      });
      
      setSaving(false);
      setMsg("Profile saved successfully!");
    } catch (error) {
      setSaving(false);
      setMsg(error.message || "Failed to save profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="container py-4">
        <div className="col-12 col-lg-6 mx-auto">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="col-12 col-lg-6 mx-auto">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">User Profile</h4>
          <span className="badge text-bg-light border">{form.plan} Plan</span>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={onSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="your name"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                />
              </div>

              {/* Password (hidden/obscured) */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => alert("Use the reset flow to change your password.")}
                  >
                    Change
                  </button>
                </div>
                <div className="form-text">For security, your password is hidden.</div>
              </div>

              {/* Plan */}
              <div className="mb-3">
                <label className="form-label">Plan</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select w-auto"
                    name="plan"
                    value={form.plan}
                    onChange={onChange}
                  >
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-custom"
                    onClick={() => navigate("/upgrade")}
                  >
                    Upgrade
                  </button>
                </div>
              </div>

              {/* Save */}
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-custom" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>

              {msg && <div className="alert alert-success mt-3 py-2 mb-0">{msg}</div>}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserProfile;