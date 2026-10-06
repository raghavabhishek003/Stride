require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { createOrder } = require('../controllers/orderController');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

const validShippingAddress = {
  fullName: 'Test User',
  address: '123 Test Street',
  city: 'Testville',
  postalCode: '12345',
  phone: '555-1234',
};

async function runTests() {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const testDbName = `stride_chk_${uniqueSuffix}`;

  console.log(`Connecting to isolated test DB: ${testDbName}`);
  await mongoose.connect(MONGODB_URI, { dbName: testDbName });

  const actualDbName = mongoose.connection.db.databaseName;
  if (actualDbName !== testDbName) {
    throw new Error(
      `DB Isolation Failure: Expected database name '${testDbName}', but connected to '${actualDbName}'. Aborting test.`
    );
  }
  console.log(`Verified DB isolation: connected strictly to '${actualDbName}'.\n`);

  try {
    console.log('--- Focused Test: Missing request body ---');
    {
      const reqMissingBody = { user: { id: new mongoose.Types.ObjectId().toString() } };
      const res = createMockRes();
      await createOrder(reqMissingBody, res);
      console.log('Missing req.body status:', res.statusCode);
      if (res.statusCode !== 400) {
        throw new Error(`Missing body test failed: expected 400, got ${res.statusCode}`);
      }
      console.log('✓ Missing req.body test passed\n');
    }

    console.log('--- Focused Test: Invalid numeric values (non-finite price, negative stock) ---');
    {
      const userId = new mongoose.Types.ObjectId();
      const productBadPrice = await Product.create({
        name: 'Bad Price Item',
        price: Infinity,
        stock: 5,
      });

      await Cart.create({
        userId,
        items: [{ productId: productBadPrice._id, quantity: 1 }],
      });

      const reqBadPrice = { user: { id: userId.toString() }, body: { shippingAddress: validShippingAddress } };
      const resBadPrice = createMockRes();
      await createOrder(reqBadPrice, resBadPrice);

      console.log('Bad price response status:', resBadPrice.statusCode);
      if (resBadPrice.statusCode !== 400) {
        throw new Error(`Invalid numeric price test failed: expected 400, got ${resBadPrice.statusCode}`);
      }

      const productBadStock = await Product.create({
        name: 'Bad Stock Item',
        price: 50,
        stock: -5,
      });

      const userId2 = new mongoose.Types.ObjectId();
      await Cart.create({
        userId: userId2,
        items: [{ productId: productBadStock._id, quantity: 1 }],
      });

      const reqBadStock = { user: { id: userId2.toString() }, body: { shippingAddress: validShippingAddress } };
      const resBadStock = createMockRes();
      await createOrder(reqBadStock, resBadStock);

      console.log('Bad stock response status:', resBadStock.statusCode);
      if (resBadStock.statusCode !== 400) {
        throw new Error(`Invalid numeric stock test failed: expected 400, got ${resBadStock.statusCode}`);
      }

      console.log('✓ Invalid numeric values test passed\n');
    }

    console.log('--- Test 1: Success creates one order, reduces stock, and clears the cart ---');
    {
      const userId = new mongoose.Types.ObjectId();
      const product = await Product.create({
        name: 'Runner Shoes',
        price: 120,
        stock: 10,
      });

      const cart = await Cart.create({
        userId,
        items: [{ productId: product._id, quantity: 2 }],
      });

      const req = { user: { id: userId.toString() }, body: { shippingAddress: validShippingAddress } };
      const res = createMockRes();

      await createOrder(req, res);

      console.log('Response Status:', res.statusCode);
      if (res.statusCode !== 201) throw new Error(`Test 1 Failed: Expected status 201, got ${res.statusCode}`);

      const updatedProduct = await Product.findById(product._id);
      if (updatedProduct.stock !== 8) throw new Error(`Test 1 Failed: Expected stock 8, got ${updatedProduct.stock}`);

      const updatedCart = await Cart.findById(cart._id);
      if (updatedCart.items.length !== 0) throw new Error(`Test 1 Failed: Expected empty cart`);

      const createdOrders = await Order.find({ userId });
      if (createdOrders.length !== 1) throw new Error(`Test 1 Failed: Expected 1 order`);
      if (createdOrders[0].totalAmount !== 240) throw new Error(`Test 1 Failed: Expected total 240`);

      console.log('✓ Test 1 Passed\n');
    }

    console.log('--- Test 2: Insufficient stock leaves all products, cart, and orders unchanged ---');
    {
      const userId = new mongoose.Types.ObjectId();
      const product = await Product.create({
        name: 'Limited Hoodie',
        price: 80,
        stock: 3,
      });

      const cart = await Cart.create({
        userId,
        items: [{ productId: product._id, quantity: 5 }],
      });

      const req = { user: { id: userId.toString() }, body: { shippingAddress: validShippingAddress } };
      const res = createMockRes();

      await createOrder(req, res);

      console.log('Response Status:', res.statusCode);
      if (![400, 409].includes(res.statusCode)) throw new Error(`Test 2 Failed: Expected 400 or 409, got ${res.statusCode}`);

      const untouchedProduct = await Product.findById(product._id);
      if (untouchedProduct.stock !== 3) throw new Error(`Test 2 Failed: Expected stock 3, got ${untouchedProduct.stock}`);

      const untouchedCart = await Cart.findById(cart._id);
      if (untouchedCart.items.length !== 1) throw new Error(`Test 2 Failed: Expected cart items unchanged`);

      const userOrders = await Order.find({ userId });
      if (userOrders.length !== 0) throw new Error(`Test 2 Failed: Expected 0 orders, got ${userOrders.length}`);

      console.log('✓ Test 2 Passed\n');
    }

    console.log('--- Test 3: A failure after a stock update rolls back all changes ---');
    {
      const userId = new mongoose.Types.ObjectId();
      const productA = await Product.create({
        name: 'Socks',
        price: 10,
        stock: 5,
      });
      const productB = await Product.create({
        name: 'Hat',
        price: 25,
        stock: 0,
      });

      const cart = await Cart.create({
        userId,
        items: [
          { productId: productA._id, quantity: 2 },
          { productId: productB._id, quantity: 1 },
        ],
      });

      const req = { user: { id: userId.toString() }, body: { shippingAddress: validShippingAddress } };
      const res = createMockRes();

      await createOrder(req, res);

      console.log('Response Status:', res.statusCode);
      if (![400, 409].includes(res.statusCode)) throw new Error(`Test 3 Failed: Expected 400 or 409, got ${res.statusCode}`);

      const rolledBackProductA = await Product.findById(productA._id);
      if (rolledBackProductA.stock !== 5) throw new Error(`Test 3 Failed: Expected productA stock 5 after rollback, got ${rolledBackProductA.stock}`);

      const rolledBackCart = await Cart.findById(cart._id);
      if (rolledBackCart.items.length !== 2) throw new Error(`Test 3 Failed: Expected cart items length 2 after rollback`);

      const userOrders = await Order.find({ userId });
      if (userOrders.length !== 0) throw new Error(`Test 3 Failed: Expected 0 orders after rollback`);

      console.log('✓ Test 3 Passed\n');
    }

    console.log('--- Test 4: Two customers competing for the last unit produce only one order ---');
    {
      const user1 = new mongoose.Types.ObjectId();
      const user2 = new mongoose.Types.ObjectId();

      const product = await Product.create({
        name: 'Exclusive Sneaker',
        price: 200,
        stock: 1,
      });

      await Cart.create({
        userId: user1,
        items: [{ productId: product._id, quantity: 1 }],
      });

      await Cart.create({
        userId: user2,
        items: [{ productId: product._id, quantity: 1 }],
      });

      const req1 = { user: { id: user1.toString() }, body: { shippingAddress: validShippingAddress } };
      const req2 = { user: { id: user2.toString() }, body: { shippingAddress: validShippingAddress } };
      const res1 = createMockRes();
      const res2 = createMockRes();

      await Promise.all([createOrder(req1, res1), createOrder(req2, res2)]);

      console.log('User 1 status:', res1.statusCode, '| User 2 status:', res2.statusCode);

      let winnerId, loserId, winnerRes, loserRes;
      if (res1.statusCode === 201) {
        winnerId = user1;
        winnerRes = res1;
        loserId = user2;
        loserRes = res2;
      } else {
        winnerId = user2;
        winnerRes = res2;
        loserId = user1;
        loserRes = res1;
      }

      if (winnerRes.statusCode !== 201) throw new Error(`Test 4 Failed: Expected winner status 201`);
      if (![400, 409].includes(loserRes.statusCode)) {
        throw new Error(`Test 4 Failed: Expected loser status 400 or 409, got ${loserRes.statusCode}`);
      }

      const finalProduct = await Product.findById(product._id);
      if (finalProduct.stock !== 0) throw new Error(`Test 4 Failed: Expected product stock 0, got ${finalProduct.stock}`);

      const totalOrders = await Order.find({ 'items.productId': product._id });
      if (totalOrders.length !== 1) throw new Error(`Test 4 Failed: Expected 1 total order`);

      // Assert winner's cart is empty and loser's cart is unchanged
      const updatedWinnerCart = await Cart.findOne({ userId: winnerId });
      if (updatedWinnerCart.items.length !== 0) throw new Error(`Test 4 Failed: Expected winner cart to be empty`);

      const updatedLoserCart = await Cart.findOne({ userId: loserId });
      if (updatedLoserCart.items.length !== 1) throw new Error(`Test 4 Failed: Expected loser cart to be unchanged (length 1)`);

      console.log('✓ Test 4 Passed\n');
    }

    console.log('--- Test 5: Concurrent checkouts of the same unchanged cart produce only one order ---');
    {
      const userId = new mongoose.Types.ObjectId();
      const product = await Product.create({
        name: 'Jacket',
        price: 150,
        stock: 10,
      });

      const cart = await Cart.create({
        userId,
        items: [{ productId: product._id, quantity: 2 }],
      });

      const req1 = { user: { id: userId.toString() }, body: { shippingAddress: validShippingAddress } };
      const req2 = { user: { id: userId.toString() }, body: { shippingAddress: validShippingAddress } };
      const res1 = createMockRes();
      const res2 = createMockRes();

      await Promise.all([createOrder(req1, res1), createOrder(req2, res2)]);

      console.log('Request 1 status:', res1.statusCode, '| Request 2 status:', res2.statusCode);

      const winnerRes = res1.statusCode === 201 ? res1 : res2;
      const loserRes = res1.statusCode === 201 ? res2 : res1;

      if (winnerRes.statusCode !== 201) throw new Error(`Test 5 Failed: Expected 1 winning response with 201`);
      if (![400, 409].includes(loserRes.statusCode)) {
        throw new Error(`Test 5 Failed: Expected losing response status 400 or 409, got ${loserRes.statusCode}`);
      }

      const finalOrders = await Order.find({ userId });
      if (finalOrders.length !== 1) throw new Error(`Test 5 Failed: Expected 1 total order created`);

      const finalProduct = await Product.findById(product._id);
      if (finalProduct.stock !== 8) throw new Error(`Test 5 Failed: Expected stock 8`);

      // Assert cart is empty
      const updatedUserCart = await Cart.findById(cart._id);
      if (updatedUserCart.items.length !== 0) throw new Error(`Test 5 Failed: Expected cart to be empty after concurrent checkout`);

      console.log('✓ Test 5 Passed\n');
    }

    console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
  } finally {
    if (mongoose.connection && mongoose.connection.db) {
      const dbName = mongoose.connection.db.databaseName;
      if (dbName.startsWith('stride_chk_')) {
        console.log(`Cleaning up test database collections in '${dbName}'...`);
        await Order.deleteMany({});
        await Cart.deleteMany({});
        await Product.deleteMany({});
        console.log(`Database '${dbName}' collections cleaned.`);
      }
      await mongoose.disconnect();
      console.log('Disconnected from test DB.');
    }
  }
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
