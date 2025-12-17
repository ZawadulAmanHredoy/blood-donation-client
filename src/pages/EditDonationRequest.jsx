import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDonationRequestByIdApi,
  updateDonationRequestApi,
} from "../api/requestApi.js";
import { DISTRICTS } from "../data/bdLocations.js";

export default function EditDonationRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const req = await getDonationRequestByIdApi(id);
      setForm({
        recipientName: req.recipient.name,
        recipientDistrict: req.recipient.district,
        recipientUpazila: req.recipient.upazila,
        hospitalName: req.hospitalName,
        fullAddress: req.fullAddress,
        bloodGroup: req.bloodGroup,
        donationDate: req.donationDate,
        donationTime: req.donationTime,
        requestMessage: req.requestMessage,
      });
    };
    load();
  }, [id]);

  if (!form) return <div className="loading loading-spinner" />;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "recipientDistrict") {
      setForm((p) => ({
        ...p,
        recipientDistrict: value,
        recipientUpazila: "",
      }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateDonationRequestApi(id, form);
    navigate(`/dashboard/requests/${id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-base-100 p-6 rounded-xl space-y-4"
    >
      <h2 className="text-xl font-bold">Edit Donation Request</h2>

      <input
        name="recipientName"
        className="input input-bordered"
        value={form.recipientName}
        onChange={handleChange}
      />

      <select
        name="recipientDistrict"
        className="select select-bordered"
        value={form.recipientDistrict}
        onChange={handleChange}
      >
        {Object.keys(DISTRICTS).map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <select
        name="recipientUpazila"
        className="select select-bordered"
        value={form.recipientUpazila}
        onChange={handleChange}
      >
        {DISTRICTS[form.recipientDistrict].map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>

      <input
        name="hospitalName"
        className="input input-bordered"
        value={form.hospitalName}
        onChange={handleChange}
      />

      <textarea
        name="requestMessage"
        className="textarea textarea-bordered"
        value={form.requestMessage}
        onChange={handleChange}
      />

      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
