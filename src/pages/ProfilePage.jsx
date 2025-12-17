// client/src/pages/ProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getMeApi, updateProfileApi } from "../api/userApi.js";
import { DISTRICTS } from "../data/bdLocations.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    bloodGroup: "",
    district: "",
    upazila: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const districtList = useMemo(() => Object.keys(DISTRICTS), []);
  const upazilaList = useMemo(() => {
    if (!form.district) return [];
    return DISTRICTS[form.district] || [];
  }, [form.district]);

  // Load current profile info
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const me = await getMeApi();
        setForm({
          name: me.name || "",
          bloodGroup: me.bloodGroup || "",
          district: me.district || "",
          upazila: me.upazila || "",
          avatar: me.avatar || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // reset upazila when district changes
    if (name === "district") {
      setForm((prev) => ({
        ...prev,
        district: value,
        upazila: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Upload avatar to ImgBB when file selected
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("Uploading avatar…");

    try {
      const apiKey = import.meta.env.VITE_IMGBB_KEY;
      if (!apiKey) throw new Error("ImgBB API key (VITE_IMGBB_KEY) is not set.");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error("Failed to upload image.");

      const url = data.data.display_url;
      setForm((prev) => ({ ...prev, avatar: url }));
      setMessage("Avatar uploaded. Don’t forget to save changes.");
    } catch (err) {
      setError(err.message || "Avatar upload failed.");
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!form.district) throw new Error("Please select district.");
      if (!form.upazila) throw new Error("Please select upazila.");

      const payload = {
        name: form.name,
        bloodGroup: form.bloodGroup,
        district: form.district,
        upazila: form.upazila,
        avatar: form.avatar,
      };

      const updated = await updateProfileApi(payload);

      setMessage("Profile updated successfully.");

      // Update auth context user as well
      setUser((prev) => ({
        ...(prev || {}),
        ...updated,
      }));
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-xl p-6 shadow flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow max-w-3xl">
      <h2 className="text-xl font-bold mb-1">My Profile</h2>
      <p className="text-xs text-slate-500 mb-4">
        Update your basic information. This profile is visible when someone
        searches for donors.
      </p>

      {error && (
        <div className="alert alert-error mb-3">
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="alert alert-success mb-3">
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar */}
        <div className="flex items-start gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100 overflow-hidden">
              {form.avatar ? (
                <img src={form.avatar} alt={form.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xl">
                  {form.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <label className="label">
              <span className="label-text text-xs">Profile picture</span>
            </label>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered file-input-sm w-full max-w-xs"
              onChange={handleAvatarChange}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Image will be uploaded to ImgBB, then saved to your profile.
            </p>
          </div>
        </div>

        {/* Name + Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text text-xs">Full Name</span>
            </label>
            <input
              type="text"
              name="name"
              className="input input-bordered input-sm w-full"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text text-xs">Email (read only)</span>
            </label>
            <input
              type="email"
              className="input input-bordered input-sm w-full bg-slate-100"
              value={user?.email || ""}
              disabled
            />
          </div>
        </div>

        {/* Blood + Location */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text text-xs">Blood Group</span>
            </label>
            <select
              name="bloodGroup"
              className="select select-bordered select-sm w-full"
              value={form.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text text-xs">District</span>
            </label>
            <select
              name="district"
              className="select select-bordered select-sm w-full"
              value={form.district}
              onChange={handleChange}
              required
            >
              <option value="">Select District</option>
              {districtList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text text-xs">Upazila</span>
            </label>
            <select
              name="upazila"
              className="select select-bordered select-sm w-full"
              value={form.upazila}
              onChange={handleChange}
              required
              disabled={!form.district}
            >
              <option value="">Select Upazila</option>
              {upazilaList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
