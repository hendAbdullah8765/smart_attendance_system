const asyncHandler = require('express-async-handler');
const ApiError = require('../ApiError')
const Organization = require("../models/OrganizationModel")
const axios = require('axios');

exports.deleteOrganization =  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const organization = await Organization.findByIdAndDelete(id);

    if (!organization) {
      return next(new ApiError(`No organization for this id ${id}`, 404));
    }
    res.status(204).send(" organization Deleted");
  });

exports.updateOrganization =  asyncHandler(async (req, res, next) => {

    const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!organization) {
      return next(
        new ApiError(`No organization for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: organization });
  });

exports.createOrganization = asyncHandler(async (req, res, next) => {
    const { name, address ,email } = req.body;
  
    if (!address) {
      return next(new ApiError("Address is required", 400));
    }
    try {
      // 1. Get coordinates using Google Maps Geocoding API
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
  
      const coordinates = [geo.lng, geo.lat]; // [longitude, latitude]
  
      // 2. Create organization with location
      const organization = await Organization.create({
        name,
        address,
        email,
        location: {
          type: "Point",
          coordinates: coordinates,
        },
      });
  
      res.status(201).json({ data: organization });
    } catch (error) {
      next(new ApiError("Error creating organization", 500));
    }
  });
  

exports.getOrganization =  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const organization = await Organization.findById(id);
    if (!organization) {
      return next(new ApiError(`No organization for this id ${id}`, 404));
    }
    res.status(200).json({ data: organization });
  });


exports.getAllOrganization = asyncHandler(async (req, res) => {
    const organizations = await Organization.find().lean();
    res.status(200).json({
      results: organizations.length,
      data: organizations
    });
  });