const express = require('express');
const AttendsService = require("../services/AttendsService")
const {
  deleteAttendance,
  getAttendanceById,
  getAllAttendance ,
  getTodayAttendance,
  checkWithinRange,
  createFilterObj
  } = require('../services/AttendsService');

const router = express.Router({mergeParams: true });

router.get('/employee/:employeeId', createFilterObj ,getAllAttendance)

router.get('/today/:id',   getTodayAttendance)

router.get('/within-range', checkWithinRange)

router.route('/').get(getAllAttendance);

router.post('/checkin', AttendsService.createAttendance );
router.post('/checkout', AttendsService.checkOut);

router
.route('/:id')
.get(getAttendanceById)
.delete(deleteAttendance)


module.exports = router;