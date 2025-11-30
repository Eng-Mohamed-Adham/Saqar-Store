// controllers/settingsController.js
import Settings from '../models/settingsModel.js';

export const updatePlatformFee = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'غير مصرح' });

    const { platformFee } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    settings.platformFee = platformFee;
    await settings.save();

    res.json({ message: 'تم التحديث', platformFee });
  } catch (err) {
    res.status(500).json({ message: 'فشل التحديث', error: err.message });
  }
};
