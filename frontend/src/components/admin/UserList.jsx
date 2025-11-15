import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../services/api";

export default function UserList({ token }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const data = await getUsers(token);
    if (data.success) setUsers(data.data);
  };

  const handleDelete = async (id) => {
    await deleteUser(id, token);
    fetchUsers();
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map(u => (
          <li key={u._id}>
            {u.email} 
            <button onClick={() => handleDelete(u._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
