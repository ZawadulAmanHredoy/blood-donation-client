// client/src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { registerApi } from "../api/authApi.js";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY;

export default function RegisterPage() {
  const { login } = useAuth();
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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

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

    setLoading(true);

    try {
      // 1) Upload avatar (optional but recommended)
      let avatarUrl = "";
      if (avatarFile) {
        avatarUrl = await uploadAvatarToImgBB();
      }

      // 2) Prepare payload for backend (no confirmPassword field)
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        avatar: avatarUrl,
        bloodGroup: form.bloodGroup,
        district: form.district,
        upazila: form.upazila,
      };

      // 3) Call API
      const data = await registerApi(payload); // /api/auth/register

      // 4) Auto-login with context (server returns { token, user })
      login(data);

      // 5) Redirect to dashboard
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

        {/* Avatar upload (ImgBB) */}
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
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>

        {/* District */}
        <div>
          <label className="label">
            <span className="label-text">District</span>
          </label>
          <input
            name="district"
            type="text"
            className="input input-bordered w-full"
            value={form.district}
            onChange={handleChange}
            placeholder="Later we will use real select"
            required
          />
        </div>

        {/* Upazila */}
        <div>
          <label className="label">
            <span className="label-text">Upazila</span>
          </label>
          <input
            name="upazila"
            type="text"
            className="input input-bordered w-full"
            value={form.upazila}
            onChange={handleChange}
            required
          />
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
