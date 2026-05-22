import React from "react";
import { Navigate } from "react-router-dom";
import { getVariable } from "../utils/localStorage.js";

const ProtectedRoute = ({ children }) => {
  const token = getVariable("km_user_token");

  // if token is missing, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // otherwise, allow access to the protected page
  return children;
};

export default ProtectedRoute;
