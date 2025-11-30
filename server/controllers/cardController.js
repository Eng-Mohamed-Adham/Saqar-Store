import Card from '../models/cardModel.js';

// ✅ Get all cards
export const getCards = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) filter.category = category;

    const cards = await Card.find(filter);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب البطاقات' });
  }
};

export const createCard = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const image = req.file?.path;

    if (!image) {
      return res.status(400).json({ message: 'يرجى رفع صورة' });
    }

    const newCard = new Card({
      title,
      description,
      category,
      image,
      owner: req.user._id // 👈 هنا نخزن المالك
    });

    await newCard.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(400).json({ message: 'فشل إنشاء البطاقة' });
  }
};


export const updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'البطاقة غير موجودة' });

    // تحقق من الملكية أو الأدمن
    if (card.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه البطاقة' });
    }

    const { title, description, category } = req.body;
    const image = req.file?.path;

    card.title = title || card.title;
    card.description = description || card.description;
    card.category = category || card.category;
    card.image = image || card.image;

    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: 'فشل تعديل البطاقة' });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'البطاقة غير موجودة' });

    if (card.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذه البطاقة' });
    }

    await card.deleteOne();
    res.json({ message: 'تم حذف البطاقة بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'فشل حذف البطاقة' });
  }
};

// ✅ Get cards for logged-in seller
export const getMyCards = async (req, res) => {
  try {
    // تحقق إذا المستخدم تاجر
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'هذه الصفحة مخصصة للتجار فقط' });
    }

    // جلب الكروت المرتبطة بالمستخدم
    const cards = await Card.find({ owner: req.user._id });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'فشل في جلب بطاقات المستخدم' });
  }
};
