const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create a new order from user's cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Step 1: Validate stock for all products in cart
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(400).json({ message: 'One or more products in your cart no longer exist' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product "${product.name}". Available stock: ${product.stock}, requested: ${item.quantity}`,
        });
      }
    }

    // Step 2: Calculate total, construct order items, and decrement stock
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.productId;
      const priceAtPurchase = product.price;
      const itemTotal = priceAtPurchase * item.quantity;

      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase,
      });

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Step 3: Create the Order
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
      status: 'pending',
    });

    // Step 4: Clear the user's cart
    cart.items = [];
    await cart.save();

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by ID (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Must belong to user or user must be admin
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = Order.schema.path('status').enumValues;

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
