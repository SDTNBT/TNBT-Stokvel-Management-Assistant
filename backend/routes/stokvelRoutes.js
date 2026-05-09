const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Member = require('../models/Member');
const nodemailer = require('nodemailer');

let transporter = null;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
      }
    });
    console.log("Email transporter configured");
  } else {
    console.log("Email credentials not set - running in demo mode (no emails will be sent)");
  }
} catch (err) {
  console.log("Email not configured - running in demo mode");
  transporter = null;
}

router.post('/', async (req, res) => {
    try {
        console.log("Processing New Group");
        const { groupName, adminId, treasurerId, financials, treasurerDetails, members } = req.body;

        const existingGroup = await Group.findOne({ groupName: groupName });
        if (existingGroup) {
          return res.status(400).json({ error: "Group name already exists" });
        }

        const newGroup = new Group({
            groupName: groupName,
            adminEmail: adminId,
            treasurerEmail: treasurerId,
            contributionAmount: financials.amount,
            frequency: financials.frequency
        });
        await newGroup.save();
        console.log("Group Saved to DB:", newGroup._id);

        const existingAdmin = await Member.findOne({ user: adminId.toLowerCase(), group: groupName });
        if (!existingAdmin) {
          await Member.create({
              user: adminId.toLowerCase(),
              group: groupName,
              memberType: 'Admin'
          });
          console.log("Admin Linked to Group");
        }

        const existingTreasurer = await Member.findOne({ user: treasurerId.toLowerCase(), group: groupName });
        if (!existingTreasurer) {
          await Member.create({
              user: treasurerId.toLowerCase(),
              group: groupName,
              memberType: 'Treasurer'
          });
          console.log("Treasurer Linked to Group");
        }

        let membersAdded = 0;
        if (members && Array.isArray(members)) {
            for (let m of members) {
                if (m.email && m.email.trim() !== "") {
                    const existingMember = await Member.findOne({ user: m.email.toLowerCase(), group: groupName });
                    if (!existingMember) {
                        await Member.create({
                            user: m.email.toLowerCase(),
                            group: groupName,
                            memberType: 'Member'
                        });
                        membersAdded++;
                        console.log(`Member ${m.email} saved to DB`);
                    } else {
                        console.log(`Member ${m.email} already exists in group`);
                    }

                    if (transporter) {
                        try {
                            const memberMail = {
                                from: process.env.EMAIL_USER,
                                to: m.email,
                                subject: `Invitation to join ${groupName}`,
                                html: `<p>You have been invited to join <b>${groupName}</b> as a member. Log in to your dashboard to see details.</p>`
                            };
                            await transporter.sendMail(memberMail);
                            console.log(`Email sent to: ${m.email}`);
                        } catch (emailErr) {
                            console.log(`Email failed for ${m.email}:`, emailErr.message);
                        }
                    } else {
                        console.log(`Email not sent (demo mode): Would have sent to ${m.email}`);
                    }
                }
            }
        }

        if (transporter) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: treasurerId,
                    subject: `Invitation to join ${groupName}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                            <h2 style="color: #8b5cf6;">Stokvel Invitation</h2>
                            <p>Hi <strong>${treasurerDetails.firstName}</strong>,</p>
                            <p>You have been appointed as the <b>Treasurer</b> for the new group: <strong>${groupName}</strong>.</p>
                            <hr />
                            <p><strong>Contribution:</strong> R${financials.amount}</p>
                            <p><strong>Frequency:</strong> ${financials.frequency}</p>
                            <hr />
                            <p>Please log in to the Stokvel Stockie app to manage the payouts.</p>
                            <br />
                            <p>Regards,<br/>The Stokvel Team</p>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                console.log(`Treasurer Email sent to: ${treasurerId}`);
            } catch (emailErr) {
                console.log(`Email failed for treasurer:`, emailErr.message);
            }
        } else {
            console.log(`Email not sent (demo mode): Would have sent to ${treasurerId}`);
        }

        res.status(201).json({ 
            message: "Group created and all participants linked",
            groupId: newGroup._id,
            groupName: groupName,
            membersAdded: membersAdded
        });

    } catch (err) {
        console.error("Error in Route:", err.message);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

router.get('/user/:email', async (req, res) => {
    try {
        const userEmail = req.params.email.toLowerCase();
        console.log(`Fetching memberships for: ${userEmail}`);

        const memberships = await Member.find({ user: userEmail });

        if (!memberships || memberships.length === 0) {
            return res.json([]); 
        }

        const groupNames = memberships.map(m => m.group);

        const groupDetails = await Group.find({ groupName: { $in: groupNames } });

        const results = groupDetails.map(group => {
            const m = memberships.find(membership => membership.group === group.groupName);
            return {
                ...group._doc,
                userRole: m ? m.memberType : 'Member' 
            };
        });

        res.json(results);
    } catch (err) {
        console.error("Error fetching groups:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/group/:groupId', async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        await Member.deleteMany({ group: group.groupName });
        await Group.findByIdAndDelete(groupId);
        
        console.log(`Group ${group.groupName} deleted`);
        res.json({ message: "Group deleted successfully" });
    } catch (err) {
        console.error("Error deleting group:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
