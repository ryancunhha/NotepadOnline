import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";

import Home from "./pages/home";
import Notepad from "./pages/notepad";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/:slug" element={<Notepad />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
