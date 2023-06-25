const express = require('express');
const router = express.Router();
const EHRController = require('./EHRController');

// Create EHR
router.post('/', EHRController.createEHR);

// Update EHR
router.put('/:ehrId', EHRController.updateEHR);

// Grant Access to EHR
router.post('/:ehrId/access', EHRController.grantAccess);

// Revoke Access from EHR
router.delete('/:ehrId/access/:revoked', EHRController.revokeAccess);

// Get EHR by ID
router.get('/:ehrId', EHRController.getEHR);


module.exports = router;


//http://localhost:3000/api/ehr/:patientId