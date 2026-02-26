import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Footer />
      <AppRoutes />
      <div className="py-10" />
      
    </BrowserRouter>
  );
}