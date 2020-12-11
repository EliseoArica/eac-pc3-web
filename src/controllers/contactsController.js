const contactsController = {};

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Create S3 service object
const s3 = new AWS.S3({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

const Contact = require('../models/Contact');
const fs = require('fs-extra');

contactsController.renderContactForm = (req, res) => {
    res.render('contacts/contacts_form'); // views/contacts/contacts_form
};

contactsController.createNewContact = async(req, res) => {
    const { name, surname, phone } = req.body;
    const file = req.file;

    if (file) {
        const { filename, mimetype, path } = req.file;
        fs.readFile(file.path, (err, data) => {
            if (err) throw err; // Something went wrong!
            console.log(data);
            const uploadParams = {
                Bucket: `${process.env.bucket_name}/images`,
                Key: filename, // Nombre de la imagen que se guardará en S3 (El ID generado con Date())
                Body: data, // Archivo de Imagen
                ACL: 'public-read',
                ContentType: mimetype,
                ContentDisposition: 'inline'
            };
            s3.upload(uploadParams, async(err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const newContact = new Contact({
                        name,
                        surname,
                        phone,
                        imageURL: data.Location, // Guardo la url publica en mi variable
                        public_id: data.key // Guardo la llave en mi variable
                    });
                    newContact.user = req.user.id;
                    await newContact.save();
                    await fs.unlink(path); // Borra el archivo del servidor
                    req.flash('success_msg', 'Registro correcto');
                    res.redirect('/contacts');
                }
            });
        });
    } else {
        console.log('No hay imagen');
        req.flash('error_msg', 'El campo imagen es obligatorio');
        res.redirect('/contacts/add');
    }
};

contactsController.renderContacts = async(req, res) => {
    const contacts = await Contact.find({ user: req.user.id });
    res.render('contacts/contacts', { contacts });
};

contactsController.renderEditForm = async(req, res) => {
    const { id } = req.params;
    var contact = [];
    const data = await Contact.findById(id).lean();
    if (data.user != req.user.id) {
        req.flash('err_msg', 'Acceso no autorizado');
        return res.redirect('/contacts');
    }
    contact = data;
    console.log(contact);
    res.render('contacts/edit_form', { contact });
};

contactsController.updateContact = async(req, res) => {
    const { id, name, surname, phone, public_id } = req.body;
    const file = req.file;

    if (file) {
        const { filename, mimetype, path } = req.file;
        fs.readFile(file.path, function(err, data) {
            if (err) throw err; // Something went wrong!
            const deleteParams = {
                Bucket: process.env.bucket_name,
                Key: public_id
            };
            s3.deleteObject(deleteParams, function(err, result) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log(result);
                    const uploadParams = {
                        Bucket: `${process.env.bucket_name}/images`,
                        Key: filename, // Nombre de la imagen que se guardará en S3 (El ID generado con Date())
                        Body: data, // Archivo de Imagen
                        ACL: 'public-read',
                        ContentType: mimetype,
                        ContentDisposition: 'inline'
                    };
                    s3.upload(uploadParams, async function(err, data) {
                        await fs.unlink(path);
                        if (err) {
                            console.log(err)
                            req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                            res.redirect('/contacts');
                        } else {
                            params = {
                                name: name,
                                surname: surname,
                                phone: phone,
                                imageURL: data.Location,
                                public_id: data.key
                            };
                            await Contact.findByIdAndUpdate(id, params, function(err, doc) {
                                if (err) {
                                    console.log(err);
                                    req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                                    res.redirect('/contacts');
                                } else {
                                    console.log(doc);
                                    req.flash('success_msg', 'Contacto actualizado');
                                    res.redirect('/contacts');
                                }
                            });
                        }
                    });
                }
            });
        });
    } else {
        const paramsToUpdate = {
            name,
            surname,
            phone
        };
        await Contact.findByIdAndUpdate(id, paramsToUpdate, function(err, doc) {
            if (err) {
                console.log(err);
                req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                res.redirect('/contacts');
            } else {
                console.log(doc);
                req.flash('success_msg', 'Contacto actualizado');
                res.redirect('/contacts');
            }
        });
    }
};

contactsController.deleteContact = async(req, res) => {
    const { id } = req.params;
    const result = await Contact.findById(id).lean();
    console.log(result);
    const params = {
        Bucket: process.env.bucket_name,
        Key: result.public_id
    };
    s3.deleteObject(params, async function(err, data) {
        if (err) {
            console.log(err, err.stack);
            req.flash('error_msg', 'Ha ocurrido un error, vuelve a intentarlo');
            res.redirect('/contacts');
        } else {
            console.log(data);
            const resp = await Contact.findByIdAndDelete(id);
            console.log(resp);
            req.flash('success_msg', 'Contacto eliminado');
            res.redirect('/contacts');
        }
    });
};

module.exports = contactsController;