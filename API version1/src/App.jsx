// src/App.jsx
import React from "react";
import AuthenticationSys from "./systems/AuthenticationSys";
import AppContextProvider from "./contexts/AppContext";

export default function App() {
  return (
    <AppContextProvider>
      <AuthenticationSys />
    </AppContextProvider>
  );
}
