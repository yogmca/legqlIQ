const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  state: {
    type: String,
    default: 'Karnataka',
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  professionalCount: {
    type: Number,
    default: 0
  },
  addedBy: {
    type: String,
    enum: ['system', 'professional', 'admin'],
    default: 'professional'
  }
}, {
  timestamps: true
});

// Index for faster queries
locationSchema.index({ city: 1 });
locationSchema.index({ isActive: 1 });

// Static method to add or update location
locationSchema.statics.addOrUpdateLocation = async function(cityName) {
  if (!cityName || typeof cityName !== 'string') {
    return null;
  }

  const trimmedCity = cityName.trim();
  
  if (!trimmedCity) {
    return null;
  }

  try {
    // Find existing location or create new one
    let location = await this.findOne({ 
      city: { $regex: new RegExp(`^${trimmedCity}$`, 'i') } 
    });

    if (location) {
      // Increment professional count
      location.professionalCount += 1;
      await location.save();
      return location;
    } else {
      // Create new location
      location = await this.create({
        city: trimmedCity,
        professionalCount: 1,
        addedBy: 'professional'
      });
      return location;
    }
  } catch (error) {
    console.error('Error adding/updating location:', error);
    return null;
  }
};

// Static method to get all active locations
locationSchema.statics.getActiveLocations = async function() {
  try {
    const locations = await this.find({ isActive: true })
      .sort({ professionalCount: -1, city: 1 })
      .select('city state professionalCount');
    
    return locations.map(loc => loc.city);
  } catch (error) {
    console.error('Error fetching active locations:', error);
    return [];
  }
};

// Static method to decrement professional count
locationSchema.statics.decrementCount = async function(cityName) {
  if (!cityName || typeof cityName !== 'string') {
    return null;
  }

  try {
    const location = await this.findOne({ 
      city: { $regex: new RegExp(`^${cityName.trim()}$`, 'i') } 
    });

    if (location && location.professionalCount > 0) {
      location.professionalCount -= 1;
      await location.save();
      return location;
    }
  } catch (error) {
    console.error('Error decrementing location count:', error);
  }
  return null;
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
