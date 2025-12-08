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

  // Simple guard: if not admin, show access denied (backend will also protect)
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

  const loadUsers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await getAllUsersApi({});
      // backend returns an array of users
      setUsers(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setMessage(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const runAction = async (id, fn) => {
    setActionLoadingId(id);
    setMessage("");
    try {
      await fn(id);
      setMessage("Action completed successfully.");
      await loadUsers();
    } catch (err) {
      setMessage(err.message || "Action failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Manage Users</h2>
          <p className="text-xs text-slate-500">
            Block abusive accounts, assign roles, and keep the community safe.
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-4">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm md:table-md">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Blood</th>
                <th>Location</th>
                <th>Status</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {u.avatar && (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{u.name}</span>
                        <span className="text-xs text-slate-500">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-outline">
                      {u.bloodGroup || "-"}
                    </span>
                  </td>
                  <td className="text-xs">
                    <div>{u.district || "-"}</div>
                    <div className="text-slate-500">{u.upazila || ""}</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.status === "active"
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-ghost text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-1">
                      {u._id === user._id ? (
                        <span className="text-[10px] text-slate-400">
                          (You)
                        </span>
                      ) : (
                        <>
                          {u.status === "active" ? (
                            <button
                              className="btn btn-xs btn-warning"
                              disabled={actionLoadingId === u._id}
                              onClick={() =>
                                runAction(u._id, blockUserApi)
                              }
                            >
                              {actionLoadingId === u._id
                                ? "Blocking..."
                                : "Block"}
                            </button>
                          ) : (
                            <button
                              className="btn btn-xs btn-success"
                              disabled={actionLoadingId === u._id}
                              onClick={() =>
                                runAction(u._id, unblockUserApi)
                              }
                            >
                              {actionLoadingId === u._id
                                ? "Unblocking..."
                                : "Unblock"}
                            </button>
                          )}

                          <button
                            className="btn btn-xs btn-info"
                            disabled={actionLoadingId === u._id}
                            onClick={() =>
                              runAction(u._id, makeVolunteerApi)
                            }
                          >
                            {actionLoadingId === u._id
                              ? "Updating..."
                              : "Make Volunteer"}
                          </button>

                          <button
                            className="btn btn-xs btn-primary"
                            disabled={actionLoadingId === u._id}
                            onClick={() =>
                              runAction(u._id, makeAdminApi)
                            }
                          >
                            {actionLoadingId === u._id
                              ? "Updating..."
                              : "Make Admin"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
