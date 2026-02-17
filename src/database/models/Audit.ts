import { Schema, model } from 'mongoose';

// Define the Audit schema
const auditSchema = new Schema({
    action: { type: String, required: true },
    userId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, required: false },
});

// Create the Audit model using the schema
const Audit = model('Audit', auditSchema);

export default Audit;