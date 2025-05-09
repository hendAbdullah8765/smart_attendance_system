const asyncHandler = require('express-async-handler');
const ApiError = require('../ApiError')
const Employee = require("../models/EmployeeModel")

exports.deleteEmployee =  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return next(new ApiError(`No employee for this id ${id}`, 404));
    }
  res.status(204).send(" Employee Deleted");
  });

exports.updateEmployee =  asyncHandler(async (req, res, next) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!employee) {
      return next(
        new ApiError(`No employee for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: employee });
  });

exports.createEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.create(req.body);
    res.status(201).json({ data: employee });
  });

exports.getEmployee =  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return next(new ApiError(`No employee for this id ${id}`, 404));
    }
    res.status(200).json({ data: employee });
  });

exports.createFilterObj = (req , res , next) => {
  let filterObject = {};
  if(req.params.organizationId) filterObject = { Organization: req.params.organizationId};
   req.filterObj = filterObject;
    next();
}
  exports.getAllEmployee = asyncHandler(async (req, res) => {
    const employees = await Employee.find(req.filterObj).lean();
  
    res.status(200).json({
      results: employees.length,
      data: employees
    });
  });
  