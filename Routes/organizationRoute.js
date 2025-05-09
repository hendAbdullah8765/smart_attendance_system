const express = require('express');
const {
  createValidator,
  getValidator,
  updateValidator,
  deleteValidator
} = require('../middedlewares/validator')

const {
    deleteOrganization,
    updateOrganization,
    createOrganization ,
    getOrganization ,
    getAllOrganization,
  } = require('../services/organizationService');

const router = express.Router({mergeParams: true });
const employeeRoute = require('./employeeRoute')  


router.use('/:organizationId/employees', employeeRoute)

router
.route('/')
.post(createValidator,createOrganization)
.get(getAllOrganization);

router
.route('/:id')
.get(getValidator,getOrganization)
.delete(deleteValidator,deleteOrganization)
.put(updateValidator,updateOrganization);

module.exports = router;
