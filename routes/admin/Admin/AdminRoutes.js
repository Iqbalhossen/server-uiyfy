const express = require('express')
const route = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});

const {AdminRoleView, AdminRoleStore, AdminRoleViewById, AdminRoleUpdate, AdminRoleDelete, AdminDashboardView} = require('../../../controller/admin/Admin/AdminController');

// Thrade App Store section 
route.get('/role/view',  AdminRoleView);
route.post('/role/store', AdminRoleStore);
route.get('/role/view/:id', AdminRoleViewById);
route.put('/role/update/:id', AdminRoleUpdate);
route.delete('/role/delete/:id', AdminRoleDelete);
route.get('/dashboard/view', AdminDashboardView);

module.exports = route;