const express = require('express');
const {
  createValidator,
  getValidator,
  updateValidator,
  deleteValidator,
  
} = require('../middedlewares/validator')

const {
  deleteEmployee,
  updateEmployee,
  createEmployee ,
  getEmployee ,
  getAllEmployee,
  createFilterObj
  
  } = require('../services/EmployeeService');

const AttendanceRoute =require("../Routes/AttendanceRoute")

const router = express.Router({mergeParams: true });


router.use('/:employeeId/attendance', AttendanceRoute)

router
.route('/')
.post(createValidator,createEmployee)
.get(createFilterObj ,getAllEmployee);

router
.route('/:id')
.get(getValidator,getEmployee)
.delete(deleteValidator,deleteEmployee)
.put(updateValidator,updateEmployee);


module.exports = router;