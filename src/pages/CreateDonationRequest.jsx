import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDonationRequestApi } from "../api/requestApi.js";
import { DISTRICTS } from "../data/bdLocations.js";

const INITIAL_FORM = {
  recipientName: "",
  recipientDistrict: "",
  recipientUpazila: "",
  hospitalName: "",
  fullAddress: "",
  bloodGroup: "A+",
  donationDate: "",
  donationTime: "",
  requestMessage: "",
};

export default function CreateDonationRequest() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // reset upazila when district changes
    if (name === "recipientDistrict") {
      setForm((prev) => ({
        ...prev,
        recipientDistrict: value,
        recipientUpazila: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await createDonationRequestApi(form);
      navigate("/dashboard/my-donation-requests");
    } catch (err) {
      setMessage(err.message || "Failed to create donation request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-base-100 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Create Blood Donation Request</h2>

      {message && (
        <div className="alert alert-error mb-4">
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient + Blood */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="recipientName"
            placeholder="Recipient Name"
            className="input input-bordered"
            value={form.recipientName}
            onChange={handleChange}
            required
          />

          <select
            name="bloodGroup"
            className="select select-bordered"
            value={form.bloodGroup}
            onChange={handleChange}
          >
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {/* District + Upazila */}
        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="recipientDistrict"
            className="select select-bordered"
            value={form.recipientDistrict}
            onChange={handleChange}
            required
          >
            <option value="">Select District</option>
            {Object.keys(DISTRICTS).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            name="recipientUpazila"
            className="select select-bordered"
            value={form.recipientUpazila}
            onChange={handleChange}
            required
            disabled={!form.recipientDistrict}
          >
            <option value="">Select Upazila</option>
            {form.recipientDistrict &&
              DISTRICTS[form.recipientDistrict].map((u) => (
                <option key={u}>{u}</option>
              ))}
          </select>
        </div>

        <input
          name="hospitalName"
          placeholder="Hospital Name"
          className="input input-bordered"
          value={form.hospitalName}
          onChange={handleChange}
          required
        />

        <input
          name="fullAddress"
          placeholder="Full Address"
          className="input input-bordered"
          value={form.fullAddress}
          onChange={handleChange}
          required
        />

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="date"
            name="donationDate"
            className="input input-bordered"
            value={form.donationDate}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="donationTime"
            className="input input-bordered"
            value={form.donationTime}
            onChange={handleChange}
            required
          />
        </div>

        <textarea
          name="requestMessage"
          className="textarea textarea-bordered"
          rows={4}
          placeholder="Explain urgency..."
          value={form.requestMessage}
          onChange={handleChange}
          required
        />

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Request"}
        </button>
      </form>
    </div>
  );
}
