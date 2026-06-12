import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export const FREE_SHIP_THRESHOLD = 25;
export const SHIPPING_PRICE = 3.49;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("homivy-cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("homivy-cart", JSON.stringify(items));
  }, [items]);

  // product: { _id, slug, title, image, price, stock }
  const add = (product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: Math.min(i.qty + qty, product.stock ?? 99) } : i
        );
      }
      return [...prev, {
        _id: product._id, slug: product.slug, title: product.title,
        image: product.images?.[0] || product.image || "", price: product.price,
        stock: product.stock ?? 99, qty: Math.min(qty, product.stock ?? 99),
      }];
    });

  const setQty = (id, qty) =>
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i._id !== id)
        : prev.map((i) => (i._id === id ? { ...i, qty: Math.min(qty, i.stock) } : i))
    );

  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;
  const shipping = items.length === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_PRICE;

  return (
    <CartContext.Provider value={{ items, add, setQty, clear, count, subtotal, shipping }}>
      {children}
    </CartContext.Provider>
  );
}
