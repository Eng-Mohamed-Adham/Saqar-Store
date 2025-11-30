// models/settingsModel.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  platformFee: { type: Number, default: 10 },
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
