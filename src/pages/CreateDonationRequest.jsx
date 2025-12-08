// client/src/pages/CreateDonationRequest.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDonationRequestApi } from "../api/requestApi.js";

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
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await createDonationRequestApi(form);
      setMessage("Donation request created successfully.");
      setForm(INITIAL_FORM);
      // Optionally redirect to My Requests
      navigate("/dashboard/my-requests");
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
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Recipient Name</span>
            </label>
            <input
              type="text"
              name="recipientName"
              className="input input-bordered w-full"
              value={form.recipientName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Blood Group</span>
            </label>
            <select
              name="bloodGroup"
              className="select select-bordered w-full"
              value={form.bloodGroup}
              onChange={handleChange}
              required
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
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">District</span>
            </label>
            <input
              type="text"
              name="recipientDistrict"
              className="input input-bordered w-full"
              value={form.recipientDistrict}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Upazila</span>
            </label>
            <input
              type="text"
              name="recipientUpazila"
              className="input input-bordered w-full"
              value={form.recipientUpazila}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Hospital & Address */}
        <div>
          <label className="label">
            <span className="label-text">Hospital Name</span>
          </label>
          <input
            type="text"
            name="hospitalName"
            className="input input-bordered w-full"
            value={form.hospitalName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Full Address</span>
          </label>
          <input
            type="text"
            name="fullAddress"
            className="input input-bordered w-full"
            value={form.fullAddress}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Donation Date</span>
            </label>
            <input
              type="date"
              name="donationDate"
              className="input input-bordered w-full"
              value={form.donationDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Donation Time</span>
            </label>
            <input
              type="time"
              name="donationTime"
              className="input input-bordered w-full"
              value={form.donationTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="label">
            <span className="label-text">Request Message</span>
          </label>
          <textarea
            name="requestMessage"
            className="textarea textarea-bordered w-full"
            rows={4}
            value={form.requestMessage}
            onChange={handleChange}
            placeholder="Explain the situation, urgency, contact instructions..."
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-2"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Request"}
        </button>
      </form>
    </div>
  );
}
