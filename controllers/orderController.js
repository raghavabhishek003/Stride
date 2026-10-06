const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create a new order from user's cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body ?? {};

    // Requirement 1: Validate shippingAddress as an object with non-empty trimmed string fields before any DB calls
    if (
      !shippingAddress ||
      typeof shippingAddress !== 'object' ||
      Array.isArray(shippingAddress)
    ) {
      return res.status(400).json({
        message: 'Please provide complete shipping address details (fullName, address, city, postalCode, phone).',
      });
    }

    const requiredFields = ['fullName', 'address', 'city', 'postalCode', 'phone'];
    const trimmedAddress = {};

    for (const field of requiredFields) {
      const val = shippingAddress[field];
      if (typeof val !== 'string' || val.trim() === '') {
        return res.status(400).json({
          message: 'Please provide complete shipping address details (fullName, address, city, postalCode, phone).',
        });
      }
      trimmedAddress[field] = val.trim();
    }

    let createdOrder;

    // Requirement 2: Use mongoose.connection.transaction(async (session) => {...})
    await mongoose.connection.transaction(async (session) => {
      // Requirement 6: Keep per-attempt variables inside the transaction callback
      const orderItems = [];
      let totalAmount = 0;

      // Requirement 2: Read cart INSIDE transaction attached to session
      const cart = await Cart.findOne({ userId: req.user.id }).session(session);

      // Requirement 3: Reject empty cart
      if (!cart || !cart.items || cart.items.length === 0) {
        const err = new Error('Cart is empty. Add items before checking out.');
        err.statusCode = 400;
        throw err;
      }

      // Requirement 3: Combine duplicate product entries before checking stock & reject non-positive safe integer quantities
      const itemMap = new Map();

      for (const item of cart.items) {
        if (!item || !item.productId) {
          const err = new Error('One or more products in your cart no longer exist.');
          err.statusCode = 400;
          throw err;
        }

        if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
          const err = new Error('Invalid item quantity in cart.');
          err.statusCode = 400;
          throw err;
        }

        const pIdStr = item.productId.toString();
        if (itemMap.has(pIdStr)) {
          const existing = itemMap.get(pIdStr);
          const combinedQty = existing.quantity + item.quantity;
          if (!Number.isSafeInteger(combinedQty)) {
            const err = new Error('Invalid item quantity in cart.');
            err.statusCode = 400;
            throw err;
          }
          existing.quantity = combinedQty;
        } else {
          itemMap.set(pIdStr, {
            productId: item.productId,
            quantity: item.quantity,
          });
        }
      }

      // Requirement 2 & 4 & 5: Process items sequentially without Promise.all
      for (const entry of itemMap.values()) {
        const product = await Product.findById(entry.productId).session(session);

        if (!product) {
          const err = new Error('One or more products in your cart no longer exist.');
          err.statusCode = 400;
          throw err;
        }

        // Require Number.isFinite(price) && price >= 0 and Number.isSafeInteger(stock) && stock >= 0
        if (
          !Number.isFinite(product.price) ||
          product.price < 0 ||
          !Number.isSafeInteger(product.stock) ||
          product.stock < 0
        ) {
          const err = new Error(`Invalid price or stock value for product "${product.name}".`);
          err.statusCode = 400;
          throw err;
        }

        if (product.stock < entry.quantity) {
          const err = new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${entry.quantity}.`);
          err.statusCode = 400;
          throw err;
        }

        // Requirement 4: Reduce stock using conditional atomic update
        const updateResult = await Product.updateOne(
          { _id: entry.productId, stock: { $gte: entry.quantity } },
          { $inc: { stock: -entry.quantity } }
        ).session(session);

        if (updateResult.matchedCount === 0) {
          const err = new Error(`Insufficient stock for product "${product.name}".`);
          err.statusCode = 409;
          throw err;
        }

        // Requirement 5: Calculate prices and totals from database products
        const priceAtPurchase = product.price;
        const itemTotal = priceAtPurchase * entry.quantity;

        if (!Number.isFinite(itemTotal) || !Number.isFinite(totalAmount + itemTotal)) {
          const err = new Error('Invalid total amount calculation.');
          err.statusCode = 400;
          throw err;
        }

        totalAmount += itemTotal;

        orderItems.push({
          productId: product._id,
          quantity: entry.quantity,
          priceAtPurchase,
        });
      }

      // Requirement 5: Create pending order inside transaction
      const newOrder = new Order({
        userId: req.user.id,
        items: orderItems,
        totalAmount,
        shippingAddress: trimmedAddress,
        status: 'pending',
      });

      await newOrder.save({ session });

      // Requirement 5: Clear the same cart inside transaction
      cart.items = [];
      await cart.save({ session });

      createdOrder = newOrder;
    });

    // Requirement 6: Send HTTP response outside callback; 201 only after commit succeeds
    return res.status(201).json(createdOrder);
  } catch (error) {
    // Requirement 6: Preserve useful 400/409 errors, log unexpected errors, return generic 500
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Order creation transaction failed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'name imageUrl price')
      .sort({ createdAt: -1 });
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
    const order = await Order.findById(req.params.id).populate('items.productId', 'name imageUrl price');

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
      .populate('items.productId', 'name imageUrl price')
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
