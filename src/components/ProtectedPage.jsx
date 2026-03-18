import React from "react";

export default function ProtectedPage({ user }) {
  if (!user) {
    return <p>You must log in to view this page.</p>;
  }
  return <p>Welcome {user.email}, this is a protected page!</p>;
}
