const SupportTicketsModels = require('../../../models/SupportTickets/SupportTicketsModels');
const SupportMessagesModels = require('../../../models/SupportTickets/SupportMessagesModels');
const SupportAttachmentsModels = require('../../../models/SupportTickets/SupportAttachmentsModels');
const userModels = require('../../../models/userModels');
const { SupportMessagesStore } = require('../../../commonfile/SupportTickets/SupportTickets');

const { ObjectId } = require('mongodb');

const UserSupportTicketsPending = async (req, res) => {
    try {

        const SupportTickets = await SupportTicketsModels.find({status:0}).sort('-created_at');
        res.status(201).json({
            success: true,
            data: SupportTickets,
        });
    } catch (error) {
        console.log(error);
    }
};

const UserSupportTicketsDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const SupportTickets = await SupportTicketsModels.findOne(query);
        const SupportTicketsMessage = await SupportMessagesModels.find({support_ticket_id:id});
        res.status(201).json({
            success: true,
            SupportTickets: SupportTickets,
            SupportTicketsMessage: SupportTicketsMessage,
        });
    } catch (error) {
        console.log(error);
    }
};
const UserSupportTicketsFile = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await SupportAttachmentsModels.findOne({support_message_id:id});
        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        console.log(error);
    }
};






module.exports = { UserSupportTicketsPending, UserSupportTicketsDetails, UserSupportTicketsFile};
