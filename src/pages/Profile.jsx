import { useEffect, useState } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function Profile() {
  const { logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/profile").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
}