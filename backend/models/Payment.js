const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    transactionId: { 
        type: String, 
        required: true, 
        unique: true // Prevents duplicate entries for the same Stripe payment
    },
    amount: { 
        type: Number, 
        required: true 
    },
    groupName: { 
        type: String, 
        required: true 
    },
    payerName: { 
        type: String, 
        required: true 
    },
    userEmail: { 
        type: String, 
        required: true // NEW: Crucial for identification
    },
    userId: { 
        type: String, 
        required: true // NEW: Linking this to your User model
    },
    zipCode: { 
        type: String 
    },
    status: { 
        type: String, 
        default: 'Confirmed' 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);