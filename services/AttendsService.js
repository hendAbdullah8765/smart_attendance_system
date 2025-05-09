const asyncHandler = require('express-async-handler');
const ApiError = require('../ApiError');
const Attendance = require('../models/AttendanceModel');
const Employee = require('../models/EmployeeModel');
const axios = require('axios');

function calculateDistance(coords1, coords2) {
  const toRad = (value) => (value * Math.PI) / 180;

  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;

  const earthRadius = 6371000; 

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}
//checkin
exports.createAttendance = asyncHandler(async (req, res, next) => {
  const { email, address } = req.body;

  if (!address || !email) {
    return next(new ApiError("Email and Address are required", 400));
  }

  const employee = await Employee.findOne({ email }).populate("Organization");

  if (!employee) {
    return next(new ApiError(`No employee found with email ${email}`, 404));
  }

  const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  const geo = response.data.results[0]?.geometry?.location;
  if (!geo) {
    return next(new ApiError("Unable to get location from address", 500));
  }

  const coordinates = [geo.lng, geo.lat];
  const orgLocation = employee.Organization.location.coordinates;
  const distance = calculateDistance(orgLocation, coordinates);

  if (distance > 100) {
    return next(new ApiError("You are not within the allowed check-in range.", 403));
  }

  const attendance = await Attendance.create({
    address,
    
    employee: employee._id,
    location: {
      type: "Point",
      coordinates: coordinates,
    },
    checkInTime: new Date(),
  });

  res.status(201).json({ message: "Checked in successfully", data: attendance,  organization: {
    email: employee.Organization.email,
    name: employee.Organization.name,
  }, });
});

//ckeckout
exports.checkOut = asyncHandler(async (req, res, next) => {
  const { employeeId } = req.body;

  const attendance = await Attendance.findOne({
    employee: employeeId,
    checkOutTime: { $exists: false }
  }).sort({ checkInTime: -1 }); 

  if (!attendance) {
    return next(new ApiError('No open attendance record found.', 404));
  }

  attendance.checkOutTime = new Date();
  await attendance.save();

  res.status(200).json({ message: 'Checked out successfully', data: attendance });
});

exports.checkWithinRange = asyncHandler(async (req, res, next) => {
  const { lat, lng, employeeId } = req.query;

  if (!lat || !lng || !employeeId) {
    return next(new ApiError("Missing required query params", 400));
  }

  const employee = await Employee.findById(employeeId).populate("Organization");
  if (!employee || !employee.Organization || !employee.Organization.location) {
    return next(new ApiError("Employee or organization location not found", 404));
  }

  const orgCoords = employee.Organization.location.coordinates;
  const userCoords = [parseFloat(lng), parseFloat(lat)];

  const distance = calculateDistance(orgCoords, userCoords); 

  const isWithin = distance <= 100;

  res.status(200).json({ withinRange: isWithin });
});

// nested route
// Get /api/attendance/employee/:employeeId
exports.createFilterObj = (req , res , next) => {
  let filterObject = {};
  if(req.params.employeeId) filterObject = { employee: req.params.employeeId};
   req.filterObj = filterObject;
    next();
}

exports.getAllAttendance = asyncHandler(async (req, res) => {
  const filter = req.filterObj || {};

  const records = await Attendance.find(filter)
    .populate('employee', 'name')
    .lean();

  res.status(200).json({
    results: records.length,
    data: records
  });
});

exports.getAttendanceById = asyncHandler(async (req, res, next) => {
  const record = await Attendance.findById(req.params.id).populate('employee').exec();
  if (!record) {
    return next(new ApiError(`No attendance for this id ${req.params.id}`, 404));
  }

  res.status(200).json({ data: record });
});

exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const record = await Attendance.findByIdAndDelete(req.params.id);
  if (!record) {
    return next(new ApiError(`No attendance for this id ${req.params.id}`, 404));
  }

  res.status(204).send("Attendance Deleted");
});

exports.getTodayAttendance = asyncHandler(async (req, res, next) => {
  const { id: employeeId } = req.params;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const attendance = await Attendance.findOne({
    employee: employeeId,
    checkInTime: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  if (!attendance) {
    return next(new ApiError("No attendance record found for today.", 404));
  }

  res.status(200).json({ data: attendance });
});
