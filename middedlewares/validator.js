const axios = require('axios');
const { check  } = require('express-validator');
const Employee= require('../models/EmployeeModel')
const Organization=require('../models/OrganizationModel')
// @desc  Finds the validation errors in this request and wraps them in an object with handy functions
const { validationResult } = require('express-validator');

const validatorMiddleware =  (req, res ,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
};

exports.createValidator = [
  check('name')
    .notEmpty().withMessage('User name is required')
    .isLength({ min: 2 }).withMessage('User name is too short'),
  check('email')
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Invalid email address')
  .custom(async (val) => {
    const existingInEmployee = await Employee.findOne({ email: val });
    if (existingInEmployee) {
      throw new Error('E-mail already in use by an employee');
    }

    const existingInOrganization = await Organization.findOne({ email: val });
    if (existingInOrganization) {
      throw new Error('E-mail already in use by an organization');
    }

    return true;
  }),

check('address').optional()
  .notEmpty().withMessage('Address is required')
  .custom(async (val) => {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: val,
        key: process.env.GOOGLE_MAPS_API_KEY, 
      },
    });

    const geo = response.data.results[0]?.geometry?.location;

    if (!geo) {
      throw new Error('Invalid or unrecognized address');
    }

    return true;
  }),

 validatorMiddleware
]

exports.getValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware
]
exports.updateValidator = [
    check('id').isMongoId().withMessage('Invalid id format'),
    validatorMiddleware,
]

exports.deleteValidator = [
    check('id').isMongoId().withMessage('Invalid id format'),
    validatorMiddleware,
]
