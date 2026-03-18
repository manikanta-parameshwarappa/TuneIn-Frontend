import React from "react";
import { useAuth } from "./hooks/useAuth";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import ProtectedPage from "./components/ProtectedPage";

function App() {
  const { user, signup, login, logout, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {!user ? (
        <>
          <SignupForm onSignup={signup} />
          <LoginForm onLogin={login} />
        </>
      ) : (
        <>
          <ProtectedPage user={user} />
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  );
}

export default App;