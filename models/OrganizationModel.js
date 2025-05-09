const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
name: {
    type: String,
    required: true
  },
  
email: { type: String, unique: true },

address: {
    type: String,
    required: true
  },
location: {
    type: {
      type: String, // "Point"
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]

    },
  },
}, 
{timestamps: true}
);

OrganizationSchema.index({ location: '2dsphere' });


module.exports = mongoose.model('Organization', OrganizationSchema);
 