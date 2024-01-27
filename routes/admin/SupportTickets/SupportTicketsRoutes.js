const express = require('express')
const route = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});


const {UserSupportTicketsPending, UserSupportTicketsDetails, UserSupportTicketsFile} = require('./../../../controller/admin/SupportTickets/SupportTicketsController');

// route.post('/store/:id', upload.single('image'),   UserSupportTicketsStore);
route.get('/view',   UserSupportTicketsPending);
route.get('/view/details/:id',   UserSupportTicketsDetails);
route.get('/file/view/:id',   UserSupportTicketsFile);



module.exports = route;