const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
email: { type: String, unique: true },

Organization:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },

}, 
{timestamps: true}
);

module.exports = mongoose.model('Employee', EmployeeSchema);
 