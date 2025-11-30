// services/orderService.js
import Product from '../models/Product.js';


export const prepareOrderDetails = async (items, feePercent) => {
  let totalPrice = 0;
  let discountAmount = 0;
  const line_items = [];
  const sellerTransfers = {};
  const groupedItems = {};
  let sellerId;

  for (const item of items) {
    const product = await Product.findById(item.product).populate('seller');
    if (!product) throw new Error(`Product not found: ${item.product}`);

    if (item.quantity > product.stock) {
      throw new Error(`Requested quantity not available for: ${product.name}`);
    }

    sellerId = product.seller._id.toString();
    const itemTotal = item.quantity * product.price;
    totalPrice += itemTotal;

    if (!product.seller.stripeAccountId) {
      throw new Error(`Seller ${product.seller.username} has no Stripe`);
    }

    if (!groupedItems[sellerId]) groupedItems[sellerId] = [];
    groupedItems[sellerId].push({ product, quantity: item.quantity });

    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    });

    const sellerAmount = itemTotal * (1 - feePercent / 100);
    sellerTransfers[sellerId] = (sellerTransfers[sellerId] || 0) + Math.round(sellerAmount * 100);
  }

  return { totalPrice, discountAmount, line_items, sellerTransfers, groupedItems };
};
