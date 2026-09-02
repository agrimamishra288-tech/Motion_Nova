import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Evaluator from "./pages/Evaluator.jsx";
import History from "./pages/History.jsx";
import About from "./pages/About.jsx";
import Profile from "./pages/Profile.jsx";
import { shared } from "./theme.js";
import "./App.css";

/* App.jsx holds no evaluator logic directly — that lives in
   pages/Evaluator.jsx. This file just lays out the shared background
   + nav bar and swaps in whichever page matches the URL. */
export default function App() {
  return (
    <div style={shared.pageBg}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evaluator" element={<Evaluator />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}