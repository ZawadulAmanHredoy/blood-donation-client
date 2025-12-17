// client/src/pages/AdminUsers.jsx
import { useEffect, useState } from "react";
import {
  getAllUsersApi,
  blockUserApi,
  unblockUserApi,
  makeAdminApi,
  makeVolunteerApi,
} from "../api/userApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function AdminUsers() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="bg-base-100 rounded-xl p-6 shadow text-center text-red-500 font-semibold">
        Access denied — Admin only.
      </div>
    );
  }

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async (targetPage = page) => {
    setLoading(true);
    setMessage("");

    try {
      const data = await getAllUsersApi({ page: targetPage, limit });
      const items = Array.isArray(data) ? data : data.items || [];
      const tp = !Array.isArray(data) ? data.totalPages || 1 : 1;

      setUsers(items);
      setTotalPages(tp);

      if (items.length === 0) setMessage("No users found.");
    } catch (err) {
      setMessage(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const runAction = async (id, fn) => {
    setActionLoadingId(id);
    setMessage("");
    try {
      await fn(id);
      setMessage("Action completed successfully.");
      await loadUsers(page);
    } catch (err) {
      setMessage(err.message || "Action failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-base-100 shadow-lg rounded-xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Users</h2>
        <div className="text-sm text-slate-600">
          Page <b>{page}</b> / <b>{totalPages}</b>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                    <td className="capitalize">{u.status || "active"}</td>
                    <td className="text-right space-x-2">
                      {u.status === "blocked" ? (
                        <button
                          className="btn btn-xs btn-success"
                          disabled={actionLoadingId === u._id}
                          onClick={() => runAction(u._id, unblockUserApi)}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          className="btn btn-xs btn-warning"
                          disabled={actionLoadingId === u._id}
                          onClick={() => runAction(u._id, blockUserApi)}
                        >
                          Block
                        </button>
                      )}

                      <button
                        className="btn btn-xs btn-info"
                        disabled={actionLoadingId === u._id}
                        onClick={() => runAction(u._id, makeVolunteerApi)}
                      >
                        Make Volunteer
                      </button>

                      <button
                        className="btn btn-xs btn-primary"
                        disabled={actionLoadingId === u._id}
                        onClick={() => runAction(u._id, makeAdminApi)}
                      >
                        Make Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              className="btn btn-outline btn-sm"
              onClick={handlePrev}
              disabled={page <= 1}
            >
              Prev
            </button>
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
