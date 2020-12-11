const { Schema, model } = require('mongoose');

const ContactSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    phone: { type: String, required: true },
    imageURL: { type: String, required: true },
    public_id: { type: String, required: true },
    user: { type: String, required: true }
});

module.exports = model('Contact', ContactSchema);