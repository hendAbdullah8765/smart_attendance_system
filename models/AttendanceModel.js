const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Employee' },
    address: {
          type: String,
          required: true
        },
    location: {
      type: {
        type: String, 
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    checkInTime: {
      type: Date,
      default: Date.now
    },
    checkOutTime: Date,
    
    timestamp: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model('Attendance ', attendanceSchema);
  