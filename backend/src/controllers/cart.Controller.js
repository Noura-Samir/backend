const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
const getCart = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    console.log("Getting cart for user...");
    console.log("User ID:", userId);

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title price images stock",
      model: "Product",
    });
    console.log("Cart found:", cart);

    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }

    console.log("Cart items before transform:", cart.items);

    // Transform the response to match frontend expectations
    const transformedItems = cart.items.map((item) => {
      console.log("=== Processing cart item ===");
      console.log("Item:", item);
      console.log("Product:", item.product);
      console.log("Product type:", typeof item.product);
      console.log("Product _id:", item.product?._id);
      console.log("Product images:", item.product?.images);
      const { productId, name, price, quantity, image, color } = req.body;



      // Handle images properly
      let imageUrl = "";
      if (
        item.product?.images &&
        Array.isArray(item.product.images) &&
        item.product.images.length > 0
      ) {
        imageUrl = item.product.images[0];
        console.log("Using first image from array:", imageUrl);
      } else if (typeof item.product?.images === "string") {
        imageUrl = item.product.images;
        console.log("Using string image:", imageUrl);
      } else {
        imageUrl = "https://via.placeholder.com/150x150?text=No+Image";
        console.log("Using placeholder image:", imageUrl);
      }

      const transformedItem = {
        _id: item.product?._id?.toString() || item.product?.toString() || "",
        id: item.product?._id?.toString() || item.product?.toString() || "",
        name: item.product?.title || "Unknown Product",
        price: item.price,
        quantity: item.quantity,
        image: imageUrl,
        color: item.color || "",
      };

      console.log("Transformed item:", transformedItem);
      return transformedItem;
    });

    const response = {
      items: transformedItems,
      total: cart.total || 0,
    };

    console.log("Final response:", response);
    res.json(response);
  } catch (error) {
    console.error("Get cart error:", error);
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    console.log("Adding item to cart...");
    console.log("Request body:", req.body);

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    console.log("Looking for product:", productId);
    const product = await Product.findById(productId);
    console.log("Product found:", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    let cart = await Cart.findOne({ user: userId });
    console.log("Existing cart:", cart);

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
      });
      console.log("Created new cart");
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = product.price;
        console.log("Updated existing item");
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
        console.log("Added new item");
      }
    }
    await cart.save();
    await cart.populate("items.product", "title price images stock");
    console.log("Cart saved successfully");

    // Transform the response to match frontend expectations
    const transformedItems = cart.items.map((item) => {
      console.log("Processing cart item:", item);
      console.log("Product:", item.product);
      console.log("Product images:", item.product?.images);

      // Handle images properly
      let imageUrl = "";
      if (
        item.product?.images &&
        Array.isArray(item.product.images) &&
        item.product.images.length > 0
      ) {
        imageUrl = item.product.images[0];
      } else if (typeof item.product?.images === "string") {
        imageUrl = item.product.images;
      } else {
        imageUrl = "https://via.placeholder.com/150x150?text=No+Image"; // Default placeholder
      }

      return {
        _id: item.product?._id?.toString() || item.product?.toString() || "",
        id: item.product?._id?.toString() || item.product?.toString() || "",
        name: item.product?.title || "Unknown Product",
        price: item.price,
        quantity: item.quantity,
        image: imageUrl,
        color: item.color || "",
      };
    });

    const response = {
      items: transformedItems,
      total: cart.total || 0,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Add to cart error:", error);
    res
      .status(500)
      .json({ message: "Error adding item to cart", error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();
    await cart.populate("items.product", "title price images stock");

    // Transform the response to match frontend expectations
    const transformedItems = cart.items.map((item) => {
      console.log("Processing cart item:", item);
      console.log("Product:", item.product);
      console.log("Product images:", item.product?.images);

      // Handle images properly
      let imageUrl = "";
      if (
        item.product?.images &&
        Array.isArray(item.product.images) &&
        item.product.images.length > 0
      ) {
        imageUrl = item.product.images[0];
      } else if (typeof item.product?.images === "string") {
        imageUrl = item.product.images;
      } else {
        imageUrl = "https://via.placeholder.com/150x150?text=No+Image"; // Default placeholder
      }

      return {
        _id: item.product?._id?.toString() || item.product?.toString() || "",
        id: item.product?._id?.toString() || item.product?.toString() || "",
        name: item.product?.title || "Unknown Product",
        price: item.price,
        quantity: item.quantity,
        image: imageUrl,
        color: item.color || "",
      };
    });

    const response = {
      items: transformedItems,
      total: cart.total || 0,
    };

    res.json(response);
  } catch (error) {
    console.error("Remove from cart error:", error);
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = [];
    await cart.save();

    // Return empty cart with correct format
    const response = {
      items: [],
      total: 0,
    };

    res.json(response);
  } catch (error) {
    console.error("Clear cart error:", error);
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    console.log("=== UPDATE CART ITEM DEBUG ===");
    console.log("Product ID from params:", productId);
    console.log("Quantity from body:", quantity);

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    cartItem.quantity = quantity;
    cartItem.price = product.price;
    await cart.save();
    await cart.populate("items.product", "title price images stock");

    // Transform the response to match frontend expectations
    const transformedItems = cart.items.map((item) => {
      console.log("Processing cart item:", item);
      console.log("Product:", item.product);
      console.log("Product images:", item.product?.images);

      // Handle images properly
      let imageUrl = "";
      if (
        item.product?.images &&
        Array.isArray(item.product.images) &&
        item.product.images.length > 0
      ) {
        imageUrl = item.product.images[0];
      } else if (typeof item.product?.images === "string") {
        imageUrl = item.product.images;
      } else {
        imageUrl = "https://via.placeholder.com/150x150?text=No+Image"; // Default placeholder
      }

      return {
        _id: item.product?._id?.toString() || item.product?.toString() || "",
        id: item.product?._id?.toString() || item.product?.toString() || "",
        name: item.product?.title || "Unknown Product",
        price: item.price,
        quantity: item.quantity,
        image: imageUrl,
        color: item.color || "",
      };
    });

    const response = {
      items: transformedItems,
      total: cart.total || 0,
    };

    res.json(response);
  } catch (error) {
    console.error("Update cart error:", error);
    res
      .status(500)
      .json({ message: "Error updating cart item", error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
};
