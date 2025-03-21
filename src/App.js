import React, { useState, useEffect, createContext, useContext } from "react";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  const addToCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[product.id]) {
        newCart[product.id].quantity += 1;
      } else {
        newCart[product.id] = { ...product, quantity: 1 };
      }
      return newCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[id].quantity > 1) {
        newCart[id].quantity -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const clearCart = () => setCart({});

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

const categories = ["All", "men's clothing", "women's clothing", "electronics", "jewelery"];

const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filterProducts = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category.toLowerCase() === category));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => filterProducts(category)}
            style={{
              margin: "5px",
              padding: "10px 20px",
              border: selectedCategory === category ? "2px solid black" : "1px solid gray",
              background: selectedCategory === category ? "black" : "white",
              color: selectedCategory === category ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
          <div style={{
            border: "4px solid rgba(0, 0, 0, 0.1)",
            borderLeftColor: "black",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite"
          }}></div>
        </div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center", fontSize: "18px" }}>{error}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
              <img src={product.image} alt={product.title} style={{ width: "100%", height: "150px", objectFit: "contain" }} />
              <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{product.title}</h3>
              <p style={{ fontSize: "14px", color: "gray" }}>{product.category}</p>
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>${product.price.toFixed(2)}</p>
              {cart[product.id] ? (
                <div>
                  <button onClick={() => removeFromCart(product.id)}>-</button>
                  <span>{cart[product.id].quantity}</span>
                  <button onClick={() => addToCart(product)}>+</button>
                </div>
              ) : (
                <button onClick={() => addToCart(product)}>Add to cart</button>
              )}
            </div>
          ))}
        </div>
      )}
      <Cart />
    </div>
  );
};

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const totalPrice = Object.values(cart).reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div style={{ marginTop: "20px", display: "flex", gap: "20px", overflowX: "auto", whiteSpace: "nowrap" }}>
      <h2>Cart</h2>
      {Object.values(cart).length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <div style={{ display: "flex", gap: "15px" }}>
          {Object.values(cart).map((item) => (
            <div key={item.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={item.image} alt={item.title} style={{ width: "120px", height: "120px", objectFit: "contain" }} />
              <h3>{item.title}</h3>
              <p>${item.price.toFixed(2)} x {item.quantity}</p>
              <div>
                <button onClick={() => removeFromCart(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
            </div>
          ))}
          <h3>Total: ${totalPrice.toFixed(2)}</h3>
          <button onClick={clearCart}>Clear Cart</button>
        </div>
      )}
    </div>
  );
};

const Root = () => (
  <CartProvider>
    <App />
  </CartProvider>
);

export default Root;
