const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
    password: {
    type: String,
    minlength: 8       
  },
  authType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: String,     
 }, { timestamps: true });

userSchema.pre('save', async function(next) {
   if (!this.isModified('password') || !this.password) return next();
   this.password = await bcrypt.hash(this.password, 10);
   next();
 });

module.exports = mongoose.model('User', userSchema);
