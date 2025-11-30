import express from 'express';
import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import Product   from '../models/Product.js';
import Order from '../models/orderModel.js';

// Create Stripe instance with dependency injection for testing
const createStripeInstance = () => new Stripe(process.env.STRIPE_SECRET_KEY);

// 🔥 NEW: Function to reduce product inventory after successful payment
const reduceProductInventory = async (metadataItems, ProductModel) => {
  try {
    console.log(`🔄 Starting inventory reduction for ${metadataItems.length} items...`);
    
    for (const item of metadataItems) {
      const productId = item.productId;
      const quantity = Number(item.quantity || 1);
      
      if (!productId) {
        console.warn('⚠ Skipping item with no productId');
        continue;
      }
      
      // Find and update product inventory
      const product = await ProductModel.findById(productId);
      if (product && product.stock !== undefined) {
        const oldStock = product.stock;
        // Ensure stock doesn't go below 0
        const newStock = Math.max(0, oldStock - quantity);
        product.stock = newStock;
        
        // Mark as low stock if below threshold (optional)
        if (newStock <= 5) {
          product.lowStock = true;
        }
        
        await product.save();
        
        // Use product name if available, otherwise use ID
        const productName = product.name || product.title || `Product ${productId}`;
        console.log(`📦 Inventory reduced: ${productName} (${productId}) -${quantity} units, old stock: ${oldStock} → new stock: ${newStock}`);
      } else if (!product) {
        console.warn(`⚠ Product not found: ${productId}`);
      } else {
        console.warn(`⚠ Product ${productId} has no stock field`);
      }
    }
    console.log('✅ Product inventory updated successfully');
  } catch (error) {
    console.error('❌ Error updating product inventory:', error.message);
    // Don't throw error - inventory update failure shouldn't break payment processing
  }
};

// Extract webhook logic for better testability
export const processWebhook = async (stripeInstance, event, ProductModel, OrderModel) => {
  if (event.type === 'charge.succeeded') {
    const charge = event.data.object;

    const paymentIntentId = charge.payment_intent;
    if (!paymentIntentId) {
      console.warn('⚠ لا يوجد payment_intent في charge');
      return { status: 200, message: 'No payment_intent on charge' };
    }

    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    const transferGroup = paymentIntent.transfer_group || charge.transfer_group || paymentIntent.id;
    const currency = (charge.currency || 'cad').toLowerCase(); 

    const rawItems = paymentIntent.metadata?.items;
    const orderId = paymentIntent.metadata?.orderId || paymentIntent.metadata?.client_reference_id;

    if (!rawItems) {
      console.error('❌ metadata.items غير موجود في الـ paymentIntent!');
      return { status: 200, message: 'No metadata.items found, acknowledged' };
    }

    let metadataItems;
    try {
      metadataItems = JSON.parse(rawItems);
    } catch (err) {
      console.error('❌ فشل في JSON.parse للـ metadata.items:', rawItems);
      return { status: 200, message: 'Invalid JSON in metadata.items, acknowledged' };
    }

    const products = await ProductModel.find({
      _id: { $in: metadataItems.map((i) => i.productId) },
    }).populate('seller');

    const platformFeePercent = 0.10;

    for (const item of metadataItems) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product || !product.seller || !product.seller.stripeAccountId) {
        console.warn(
          `⚠ منتج/تاجر غير صالح أو بدون stripeAccountId: productId=${item.productId}`
        );
        continue;
      }

      const unitAmount = Math.round(Number(product.price) * 100); 
      // Calculate fee more precisely for small amounts
      const platformFeeAmount = Math.round(unitAmount * platformFeePercent);
      const sellerNetPerUnit = Math.max(1, unitAmount - platformFeeAmount); // Ensure minimum 1 cent
      const sellerAmount = sellerNetPerUnit * Number(item.quantity || 1);

      // Ensure minimum amount after fees
      if (sellerAmount <= 0) {
        console.warn(`⚠ قيمة تحويل غير صالحة للبائع، productId=${item.productId}, amount=${sellerAmount}`);
        continue;
      }

      
      try {
        const idempotencyKey = `transfer:${charge.id}:${item.productId}`;
        const transfer = await stripeInstance.transfers.create(
          {
            amount: sellerAmount,
            currency,
            destination: product.seller.stripeAccountId,
            transfer_group: transferGroup,
            source_transaction: charge.id, 
          },
          { idempotencyKey }
        );

        console.log(
          `✅ Transfer ${transfer.id} → ${product.seller.stripeAccountId}: ${sellerAmount} ${currency}`
        );
      } catch (e) {
        console.error(
          `❌ فشل إنشاء تحويل للبائع ${product.seller._id} - productId=${item.productId}:`,
          e?.message || e
        );
      }
    }

    if (orderId) {
      try {
        const order = await OrderModel.findById(orderId);
        if (order && order.status !== 'paid') {
          order.status = 'paid';
          order.paymentInfo = {
            paymentIntentId: paymentIntentId,
            chargeId: charge.id,
          };
          await order.save();
          console.log(`🧾 Order ${orderId} marked as 'paid'`);
          
          // 🔥 NEW: Reduce inventory/stock after successful payment
          await reduceProductInventory(metadataItems, ProductModel);
        }
      } catch (e) {
        console.error(`⚠ تعذر تحديث حالة الطلب ${orderId}:`, e?.message || e);
      }
    }

    console.log('✅ تم تحويل الأموال للتجار (separate transfers via source_transaction)');
    
    // Return success for charge.succeeded events
    return { status: 200, message: 'Charge processed successfully' };
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('ℹ️ checkout.session.completed:', {
      sessionId: session.id,
      payment_intent: session.payment_intent,
      client_reference_id: session.client_reference_id,
      metadata: session.metadata,
    });
    
    // 🔥 NEW: Handle inventory reduction for checkout.session.completed
    if (session.metadata?.items) {
      try {
        let metadataItems;
        try {
          metadataItems = JSON.parse(session.metadata.items);
        } catch (err) {
          console.error('❌ Invalid JSON in checkout session metadata.items:', session.metadata.items);
          return { status: 200, message: 'Invalid metadata format, acknowledged' };
        }
        
        if (Array.isArray(metadataItems) && metadataItems.length > 0) {
          // Reduce inventory for checkout session completion
          await reduceProductInventory(metadataItems, ProductModel);
          console.log('✅ Inventory updated for checkout session completion');
        } else {
          console.warn('⚠ No valid items found in checkout session metadata');
        }
      } catch (error) {
        console.error('❌ Error processing checkout session inventory:', error.message);
      }
    } else {
      console.log('ℹ️ No items metadata found in checkout session');
    }
    
    return { status: 200, message: 'Checkout session processed successfully' };
  }

  return { status: 200, message: { received: true } };
};

const router = express.Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const stripe = createStripeInstance(); // Create instance only when needed
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return res.status(200).send(`Webhook Error: ${err.message}`);
    }

    console.log('✅ Event received:', event.type);

    const result = await processWebhook(stripe, event, Product, Order);
    
    if (result.message && typeof result.message === 'object') {
      return res.status(result.status).json(result.message);
    } else {
      return res.status(result.status).send(result.message);
    }
  })
);

export default router;
