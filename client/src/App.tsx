import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ToastHost } from "./components/ToastHost";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Collection from "./pages/Collection";
import ProductPage from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="min-h-screen">
      <ToastHost />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections/:slug" element={<Collection />} />
        <Route path="/p/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

