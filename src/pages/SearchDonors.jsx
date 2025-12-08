// client/src/pages/SearchDonors.jsx
import { useEffect, useState } from "react";
import { searchDonorsApi } from "../api/userApi.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function SearchDonors() {
  const [filters, setFilters] = useState({
    bloodGroup: "",
    district: "",
    upazila: "",
  });

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadDonors = async () => {
    setLoading(true);
    setMessage("");

    try {
      const cleanFilters = {};
      if (filters.bloodGroup) cleanFilters.bloodGroup = filters.bloodGroup;
      if (filters.district) cleanFilters.district = filters.district;
      if (filters.upazila) cleanFilters.upazila = filters.upazila;

      const data = await searchDonorsApi(cleanFilters);
      setDonors(data || []);
      if (!data || data.length === 0) {
        setMessage("No donors found with the selected filters.");
      }
    } catch (err) {
      setMessage(err.message || "Failed to load donors.");
    } finally {
      setLoading(false);
    }
  };

  // Load all donors on first mount
  useEffect(() => {
    loadDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadDonors();
  };

  const handleReset = () => {
    setFilters({
      bloodGroup: "",
      district: "",
      upazila: "",
    });
    // reload all donors
    setTimeout(loadDonors, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Search Donors</h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Filter donors by blood group, district and upazila. Only active
            donors are shown.
          </p>
        </div>
      </div>

      {/* Filter form */}
      <form
        onSubmit={handleSubmit}
        className="bg-base-100 shadow-md rounded-xl p-4 grid md:grid-cols-4 gap-3"
      >
        <div>
          <label className="label">
            <span className="label-text text-xs">Blood Group</span>
          </label>
          <select
            name="bloodGroup"
            className="select select-bordered select-sm w-full"
            value={filters.bloodGroup}
            onChange={handleChange}
          >
            <option value="">Any</option>
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
          <input
            type="text"
            name="district"
            className="input input-bordered input-sm w-full"
            value={filters.district}
            onChange={handleChange}
            placeholder="e.g. Dhaka"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text text-xs">Upazila</span>
          </label>
          <input
            type="text"
            name="upazila"
            className="input input-bordered input-sm w-full"
            value={filters.upazila}
            onChange={handleChange}
            placeholder="e.g. Dhanmondi"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="btn btn-sm btn-primary flex-1"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="bg-base-100 shadow-md rounded-xl p-4">
        {message && (
          <div className="alert alert-info mb-3">
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : donors.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No donors to show.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm md:table-md">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donor</th>
                  <th>Blood</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((d, idx) => (
                  <tr key={d._id || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {d.avatar && (
                          <img
                            src={d.avatar}
                            alt={d.name}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {d.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {d.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="text-xs">
                      <div>{d.district}</div>
                      <div className="text-slate-500">{d.upazila}</div>
                    </td>
                    <td className="text-xs">
                      {/* If you store phone later, show it here. For now just email */}
                      {d.email}
                    </td>
                    <td>
                      <span className="badge badge-ghost text-xs">
                        {d.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
