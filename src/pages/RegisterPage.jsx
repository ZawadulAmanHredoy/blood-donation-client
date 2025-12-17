// client/src/pages/RegisterPage.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { registerApi } from "../api/authApi.js";
import { DISTRICTS } from "../data/bdLocations.js";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterPage() {
  const { applyAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodGroup: "A+",
    district: "",
    upazila: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const districtList = useMemo(() => Object.keys(DISTRICTS), []);
  const upazilaList = useMemo(() => {
    if (!form.district) return [];
    return DISTRICTS[form.district] || [];
  }, [form.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "district") {
      setForm((prev) => ({ ...prev, district: value, upazila: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatarToImgBB = async () => {
    if (!avatarFile) return "";

    if (!IMGBB_KEY) {
      throw new Error("ImgBB API key is not configured (VITE_IMGBB_KEY).");
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("image", avatarFile);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploadingAvatar(false);

    if (!data?.success) {
      throw new Error("Failed to upload avatar image. Please try again.");
    }

    return data.data.display_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Password and Confirm Password do not match.");
      return;
    }

    if (!form.district) {
      setMessage("Please select your district.");
      return;
    }

    if (!form.upazila) {
      setMessage("Please select your upazila.");
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = "";
      if (avatarFile) avatarUrl = await uploadAvatarToImgBB();

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        avatar: avatarUrl,
        bloodGroup: form.bloodGroup,
        district: form.district,
        upazila: form.upazila,
      };

      // Server returns { token, user }
      const data = await registerApi(payload);

      // ✅ correct: apply auth from server response
      applyAuth(data);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMessage(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-base-100 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Join as a Donor</h2>

      {message && (
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <div>
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            name="name"
            type="text"
            className="input input-bordered w-full"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            name="email"
            type="email"
            className="input input-bordered w-full"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              name="password"
              type="password"
              className="input input-bordered w-full"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              name="confirmPassword"
              type="password"
              className="input input-bordered w-full"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Avatar upload */}
        <div>
          <label className="label">
            <span className="label-text">Avatar (ImgBB upload)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={handleAvatarChange}
          />

          {avatarPreview && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <span className="text-xs text-slate-500">
                This image will be uploaded to ImgBB.
              </span>
            </div>
          )}

          {uploadingAvatar && (
            <p className="text-xs text-slate-500 mt-1">Uploading avatar...</p>
          )}
        </div>

        {/* Blood group */}
        <div>
          <label className="label">
            <span className="label-text">Blood Group</span>
          </label>
          <select
            name="bloodGroup"
            className="select select-bordered w-full"
            value={form.bloodGroup}
            onChange={handleChange}
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="label">
            <span className="label-text">District</span>
          </label>
          <select
            name="district"
            className="select select-bordered w-full"
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

        {/* Upazila */}
        <div>
          <label className="label">
            <span className="label-text">Upazila</span>
          </label>
          <select
            name="upazila"
            className="select select-bordered w-full"
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

        <button
          type="submit"
          className="btn btn-primary w-full mt-2"
          disabled={loading || uploadingAvatar}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-red-500 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
