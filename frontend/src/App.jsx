import { useState } from "react";
import Login from "./components/Login";
import UserList from "./components/admin/UserList";
import FileList from "./components/admin/FileList";
import FileStatus from "./components/admin/FileStatus";

function App() {
  const [token, setToken] = useState("");

  if (!token) return <Login setToken={setToken} />;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <UserList token={token} />
      <FileList token={token} />
      <FileStatus token={token} />
    </div>
  );
}

export default App;
