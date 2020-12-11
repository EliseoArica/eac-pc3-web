const { Router } = require('express');
const router = Router();

const { renderContactForm, createNewContact, renderContacts, renderEditForm, updateContact, deleteContact } = require('../controllers/contactsController');

router.get('/contacts', renderContacts);

router.get('/contacts/add', renderContactForm);

router.post('/contacts/add', createNewContact);

router.get('/contacts/edit/:id', renderEditForm);

router.post('/contacts/edit', updateContact);

router.get('/contacts/delete/:id', deleteContact);

module.exports = router;