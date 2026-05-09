const Minutes = require('../models/minutes');

exports.saveMinutes = async (req, res) => {
  try {
    // 1. Grab the groupId from the URL parameter
    const { groupId } = req.params;

    // 2. Grab the exact fields your React buildPayload() function is sending
    const { meetingDate, meetingTime, contributions, decisions, notes } = req.body;

    // 3. Create a new Minutes document
    const newMinutes = new Minutes({
      group: groupId,
      meetingDate: meetingDate,
      meetingTime: meetingTime,
      contributions: contributions,
      decisions: decisions,
      notes: notes
    });

    // 4. Save to MongoDB
    const savedMinutes = await newMinutes.save();

    // 5. Send success response back to React
    res.status(201).json({ 
      message: "Minutes saved successfully!", 
      data: savedMinutes 
    });

  } catch (error) {
    console.error("Error saving minutes:", error);
    res.status(500).json({ message: "Failed to save meeting minutes." });
  }
};