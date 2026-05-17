// controllers/PaymentTrackerController.js
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Member = require('../models/Member');
const User = require('../models/User');

const getGroupContributions = async (req, res) => {
  try {
    const { groupId } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid Group ID format' });
    }

    
    const groupDoc = await Group.findById(groupId);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Group not found' });
    }

    
    const activeMembers = await Member.aggregate([
      {
        
        $match: { 
          group: groupDoc.groupName,
          memberType: 'Member' 
        } 
      },
      {
        
        $lookup: {
          from: 'users',          
          localField: 'user',     
          foreignField: 'email',  
          as: 'profile'
        }
      },
      {
        
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        
        $project: {
          _id: 1,
          email: { $ifNull: ['$profile.email', '$user'] },
          
          firstName: { $ifNull: ['$profile.name', 'Unknown'] },
          lastName: { $ifNull: ['$profile.surname', 'Member'] },
          amount: { $literal: groupDoc.contributionAmount } 
        }
      }
    ]);

    
    const formattedPayments = activeMembers.map((m) => ({
      id: m._id,
      name: m.firstName.trim(),    
      surname: m.lastName.trim(), 
      email: m.email,
      amount: m.amount,
      status: 'pending'            
    }));

    return res.status(200).json(formattedPayments);
  } catch (error) {
    console.error('Error in PaymentTrackerController:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGroupContributions,
};