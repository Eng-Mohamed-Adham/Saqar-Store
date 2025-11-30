import User from '../models/userModel.js';
import {cloudinary} from '../config/cloudinary.js';


// إنشاء مستخدم
export const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, address, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'البريد مسجل بالفعل' });
    }

    let photoUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'users',
      });
      photoUrl = result.secure_url;
    }else if (req.body.photo) {
  // إذا كانت الصورة بصيغة base64
  const result = await cloudinary.uploader.upload(req.body.photo, {
    folder: 'users',
  });
  photoUrl = result.secure_url;
}



const user = new User({
  username,
  email,
  password,
  phone,
  address,
  role: role,
  photo: photoUrl,
});


    await user.save();
    res.status(201).json({ message: 'تم إنشاء المستخدم', user });
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء الإنشاء', error: err.message });
  }
};



// جلب جميع المستخدمين
export const getAllUsers = async (req, res) => { 
  try {
const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الاسترجاع', error: err.message });
  }
};

// جلب مستخدم واحد
export const getUserById = async (req, res) => {
  try {
const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء الجلب', error: err.message });
  }
};
// ✅ ملف تعريفي للمستخدم

// تحديث بيانات المستخدم
export const updateUser = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      address,
      role,
      stripeAccountId,
    } = req.body;

    const updates = {
      username,
      email,
      phone,
      address,
      role,
    };

    if (stripeAccountId) updates.stripeAccountId = stripeAccountId;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'users',
      });
      updates.photo = result.secure_url;
    }else if (req.body.photo) {
  const result = await cloudinary.uploader.upload(req.body.photo, {
    folder: 'users',
  });
  updates.photo = result.secure_url;
}

const existingUser = await User.findById(req.params.id);
if (!existingUser) return res.status(404).json({ message: 'المستخدم غير موجود' });



const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    res.json({ message: 'تم التحديث', user });
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء التحديث', error: err.message });
  }
};

// حذف مستخدم
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء الحذف', error: err.message });
  }
};

