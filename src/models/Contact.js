const { Schema, model } = require('mongoose');

const ContactSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    phone: { type: String, required: true },
    imageURL: { type: String },
    public_id: { type: String }
});

module.exports = model('Contact', ContactSchema);