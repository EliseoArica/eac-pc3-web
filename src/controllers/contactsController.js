const contactsController = {};

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'us-east-1' });

// Create S3 service object
const s3 = new AWS.S3({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token
});

const Contact = require('../models/Contact');

contactsController.renderContactForm = (req, res) => {
    res.render('contacts/contacts_form'); // views/contacts/contacts_form
};

contactsController.createNewContact = async(req, res) => {
    // const { name, surname, phone } = req.body;
    // console.log(req.file);
    // const uploadParams = {
    //     Bucket: process.env.Bucket,
    //     Body: req.file.path
    // };
    // console.log(result);
    // const newPhoto = new Photo({
    //     title: title,
    //     description: description,
    //     imageURL: result.url,
    //     public_id: result.public_id
    // });
    // await newPhoto.save();
    // //Eliminar archivo de mi servidor
    // await fs.unlink(req.file.path);

    res.redirect('/');
};

contactsController.renderContacts = async(req, res) => {
    const contacts = await Contact.find();
    res.render('contacts/contacts', { contacts });
};

contactsController.renderEditForm = (req, res) => {
    res.render('contacts/edit_form'); // views/contacts/edit_form
};

contactsController.updateContact = (req, res) => {

};

contactsController.deleteContact = (req, res) => {

};

module.exports = contactsController;