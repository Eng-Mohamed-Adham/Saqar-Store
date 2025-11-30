import Product from '../models/Product.js';
import { Offer } from '../models/offerModel.js';

export const searchItems = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') return res.json({ products: [], offers: [] });

  const regex = new RegExp(q, 'i');

  const [products, offers] = await Promise.all([
    Product.find({ name: regex }).limit(10),
    Offer.find({ title: regex }).limit(10),
  ]);

  res.json({ products, offers });
};
