import {Contact} from '../models/contactModel.js';
import express from 'express';


export const createContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'يرجى ملء جميع الحقول' });
  }

  const contact = await Contact.create({
    user: req.user?._id, // إن كان مسجل دخول
    name,
    email,
    subject,
    message
  });

  res.status(201).json({ message: 'تم إرسال الرسالة بنجاح', contact });
};

export const getAllMessages = async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 }).populate('user', 'username email');
  res.json(messages);
};


export const markMessageResolved = async (req, res) => {
  const { id } = req.params;

  const updated = await Contact.findByIdAndUpdate(id, { isResolved: true }, { new: true });
  if (!updated) return res.status(404).json({ message: 'لم يتم العثور على الرسالة' });

  res.json({ message: 'تم تعليم الرسالة كمقروءة / محلولة', updated });
};
