import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VibeCheckApp from "./components/VibeCheckApp";
import VibeResultPage from "./components/VibeResultPage";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<VibeCheckApp />} />
      <Route path="/vibe/:userId" element={<VibeResultPage />} />
    </Routes>
  </Router>
);

export default App;
