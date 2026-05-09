const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Group = require('../models/Group');

// 1. GET members with normalized name matching
router.get('/:groupId/members', async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const membersWithNames = await Member.aggregate([
            { $match: { group: group.groupName } },
            {
                $lookup: {
                    from: 'users',
                    let: { mEmail: { $trim: { input: { $toLower: "$user" } } } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [{ $trim: { input: { $toLower: "$email" } } }, "$$mEmail"]
                                }
                            }
                        }
                    ],
                    as: 'uDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    memberType: 1,
                    joiningDate: 1,
                    userEmail: '$user',
            
                    fullName: {
                        $trim: {
                            input: {
                                $concat: [
                                    { $ifNull: [{ $arrayElemAt: ['$uDetails.name', 0] }, ""] },
                                    " ",
                                    { $ifNull: [{ $arrayElemAt: ['$uDetails.surname', 0] }, ""] }
                                ]
                            }
                        }
                    }
                }
            }
        ]);
        res.status(200).json({ group, members: membersWithNames });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. SAFE DELETE route: Scoped by Group Name
router.delete('/:groupId/member/:memberId', async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        
        // Find group first to get the correct groupName string
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Only delete if the member ID matches AND they belong to this specific groupName
        const deletedMember = await Member.findOneAndDelete({ 
            _id: memberId, 
            group: group.groupName 
        });

        if (!deletedMember) {
            return res.status(404).json({ message: "Member not found in this group" });
        }

        res.status(200).json({ message: "Member successfully removed" });
    } catch (err) {
       console.error("Delete Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;