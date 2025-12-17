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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const loadDonors = async (targetPage = page) => {
    setLoading(true);
    setMessage("");

    try {
      const data = await searchDonorsApi({
        ...filters,
        page: targetPage,
        limit,
      });

      const items = Array.isArray(data) ? data : data.items || [];
      const tp = !Array.isArray(data) ? data.totalPages || 1 : 1;

      setDonors(items);
      setTotalPages(tp);

      if (items.length === 0) setMessage("No donors found.");
    } catch (err) {
      setMessage(err.message || "Failed to load donors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadDonors(1);
  };

  const handleReset = () => {
    const reset = { bloodGroup: "", district: "", upazila: "" };
    setFilters(reset);
    setPage(1);
    loadDonors(1);
  };

  const handlePrev = () => {
    const next = Math.max(1, page - 1);
    setPage(next);
    loadDonors(next);
  };

  const handleNext = () => {
    const next = Math.min(totalPages, page + 1);
    setPage(next);
    loadDonors(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search Donors</h1>
        <p className="text-sm text-slate-600">
          Filter donors by blood group, district, and upazila.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-base-100 rounded-xl shadow p-4 md:p-6 grid md:grid-cols-4 gap-3"
      >
        <select
          name="bloodGroup"
          value={filters.bloodGroup}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        <input
          name="district"
          value={filters.district}
          onChange={handleChange}
          placeholder="District"
          className="input input-bordered w-full"
        />

        <input
          name="upazila"
          value={filters.upazila}
          onChange={handleChange}
          placeholder="Upazila"
          className="input input-bordered w-full"
        />

        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" type="submit">
            Search
          </button>
          <button className="btn btn-ghost" type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {message && <div className="alert alert-error">{message}</div>}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map((d) => (
              <div
                key={d._id}
                className="bg-base-100 rounded-xl shadow p-4 border"
              >
                <p className="font-bold text-lg">{d.name}</p>
                <p className="text-sm text-slate-600">{d.email}</p>
                <div className="mt-2 text-sm">
                  <p>
                    <b>Blood:</b> {d.bloodGroup || "N/A"}
                  </p>
                  <p>
                    <b>District:</b> {d.district || "N/A"}
                  </p>
                  <p>
                    <b>Upazila:</b> {d.upazila || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              className="btn btn-outline btn-sm"
              onClick={handlePrev}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-slate-600">
              Page <b>{page}</b> of <b>{totalPages}</b>
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleNext}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
