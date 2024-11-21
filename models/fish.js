const mongoose = require('mongoose')

const fishSchema = new mongoose.Schema({
    species: String,
    size: String,
    tackle: String,
    tripId: String,
    asignee : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    }
})

const Fish = mongoose.model('Fish', fishSchema);
module.exports = Fish;
