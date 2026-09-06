const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get populated cart
const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'name price imageUrl stock',
  });
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await getPopulatedCart(req.user.id);

    if (!cart) {
      return res.json({ userId: req.user.id, items: [] });
    }

    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart or increase quantity
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ message: 'Quantity must be a whole number greater than 0' });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Please provide a valid productId' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [{ productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();

    const updatedCart = await getPopulatedCart(req.user.id);
    return res.status(200).json(updatedCart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Case 1: Not a valid whole number -> 400 Bad Request, cart untouched
    if (!Number.isInteger(quantity)) {
      return res
        .status(400)
        .json({ message: 'Quantity must be a valid whole number' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Case 2: Valid whole number <= 0 -> remove item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Case 3: Valid whole number > 0 -> update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const updatedCart = await getPopulatedCart(req.user.id);
    return res.json(updatedCart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    await cart.save();

    const updatedCart = await getPopulatedCart(req.user.id);
    return res.json(updatedCart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
