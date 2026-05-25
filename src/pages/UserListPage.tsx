// src/pages/UserListPage.tsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { listUsers, deleteUser, toggleAdminRole } from "../store/userSlice";

const UserListPage = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(listUsers());
  }, [dispatch]);

  const deleteHandler = (id: string) => {
    if (
      window.confirm(
        "Bhai, kya aap waqai is user ko urrana (delete) chahte hain?",
      )
    ) {
      dispatch(deleteUser(id))
        .unwrap()
        .then(() => alert("User successfully deleted! 🗑️"))
        .catch((err) => alert(err));
    }
  };

  const toggleAdminHandler = (id: string) => {
    if (
      window.confirm("Kya aap is user ka Admin status badalna chahte hain?")
    ) {
      dispatch(toggleAdminRole(id))
        .unwrap()
        .then(() => alert("User role updated successfully! 🔄"))
        .catch((err) => alert(err));
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10 font-bold">Loading Users Panel...</div>
    );
  if (error)
    return (
      <div className="text-center mt-10 text-red-500 font-bold">{error}</div>
    );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        User Control Station
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 text-sm uppercase">
              <th className="p-4">User ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Admin Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm divide-y divide-gray-100">
            {users.map((user: any) => (
              <tr key={user._id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-xs text-gray-400">
                  {user._id}
                </td>
                <td className="p-4 font-medium text-gray-800">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {user.isAdmin ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Yes (Admin)
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                      No (Customer)
                    </span>
                  )}
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => toggleAdminHandler(user._id)}
                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                  >
                    Toggle Admin
                  </button>

                  {!user.isAdmin && (
                    <button
                      onClick={() => deleteHandler(user._id)}
                      className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;
