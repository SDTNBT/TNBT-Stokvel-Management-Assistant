// controllers/PaymentTrackerController.js
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Member = require('../models/Member');
const User = require('../models/User');
const Tracker = require('../models/Tracker');

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
        $lookup: {
          from: 'trackers',
          let: { memberId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$memberId', '$$memberId'] },
                    { $eq: ['$groupId', new mongoose.Types.ObjectId(groupId)] }
                  ]
                }
              }
            }
          ],
          as: 'trackingRecord'
        }
      },
      
      {
        $unwind: {
          path: '$trackingRecord',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          email: { $ifNull: ['$profile.email', '$user'] },
          firstName: { $ifNull: ['$profile.name', 'Unknown'] },
          lastName: { $ifNull: ['$profile.surname', 'Member'] },
          amount: { $literal: groupDoc.contributionAmount },
          status: { $ifNull: ['$trackingRecord.status', 'pending'] }
        }
      }
    ]);

    const formattedPayments = activeMembers.map((m) => ({
      id: m._id,
      name: m.firstName.trim(),    
      surname: m.lastName.trim(), 
      email: m.email,
      amount: m.amount,
      status: m.status        
    }));

    return res.status(200).json(formattedPayments);
  } catch (error) {
    console.error('Error in PaymentTrackerController:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateContributionStatus = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid Group or Member ID format' });
    }

    const allowedStatuses = ['paid', 'pending', 'missed', 'flagged'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status type provided' });
    }

    const updatedRecord = await Tracker.findOneAndUpdate(
      { memberId, groupId },
      { status },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ 
      message: 'Status synchronized successfully', 
      data: updatedRecord 
    });
  } catch (error) {
    console.error('Error modifying tracking record fields:', error);
    return res.status(500).json({ message: 'Server error updating tracking target status' });
  }
};

module.exports = {
  getGroupContributions,
  updateContributionStatus, 
};