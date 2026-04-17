require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const exists = await User.findOne({ role: 'admin' });
  if (exists) {
    console.log('Admin đã tồn tại:', exists.username);
    process.exit(0);
  }

  await User.create({
    username: 'admin',
    email:    'tranquocdong10.2@gmail.com',
    password: '123456',
    role:     'admin',
  });

  console.log('Tạo admin thành công!');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});