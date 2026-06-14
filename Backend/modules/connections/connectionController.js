const Connection = require("./connectionSchema");
const User = require("../../model/registerUser/UserScehma");
const resolveProfileImage = require("../../utils/profileImageResolver");
const getAffiliation = require("../../utils/getAffiliation");
const { Collection } = require("mongoose");
const { sendEmail, getConnectionRequestTemplate } = require("../../utils/emailService");

// const notificationService = new NotificationService();

async function handleSendRequest(req, res) {
  try {
    const requesterId = req.user.id;
    const { recipientId } = req.params;
    const notificationService = req.app.get("notificationService");

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required." });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({ message: "Cannot send request to yourself." });
    }

    const receiver = await User.findById(recipientId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found." });
    }

    // check if connection already exists (either direction)
    const existingConnection = await Connection.findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });
    
    console.log(`[Connection DEBUG] requesterId: ${requesterId}, recipientId: ${recipientId}`);
    console.log(`[Connection DEBUG] existingConnection found:`, existingConnection ? existingConnection.status : 'null');

    let request;
    if (existingConnection) {
      if (existingConnection.status === "PENDING") {
        return res.status(409).json({ message: "Request already exists." });
      }
      if (existingConnection.status === "ACCEPTED") {
        return res.status(409).json({ message: "Already connected." });
      }
      
      // Reuse the existing document (e.g. if it was REJECTED previously)
      existingConnection.requesterId = requesterId;
      existingConnection.recipientId = recipientId;
      existingConnection.status = "PENDING";
      request = await existingConnection.save();
    } else {
      request = await Connection.create({
        requesterId,
        recipientId,
        status: "PENDING",
      });
    }

    await notificationService.createNotification({
      recipient: recipientId,
      sender: requesterId,
      type: "FRIEND_REQUEST_RECEIVED",
      entityId: request._id,
      entityType: "FRIEND_REQUEST",
      metadata: {
        message: "You have a new friend request",
        senderName: req.user.name,
        senderId: requesterId
      },
    });

    // Send connection request email asynchronously
    sendEmail(receiver.email, "New Connection Request", getConnectionRequestTemplate(receiver.name, req.user.name));

    return res.status(201).json({
      message: "Friend request sent successfully.",
      request,
    });

  } catch (err) {
    // duplicate key error (unique index)
    if (err.code === 11000) {
      console.log(`[Connection DEBUG] 11000 Duplicate Key Error Triggered! err:`, err.message);
      return res.status(409).json({ message: "Request already sent." });
    }

    console.error(`[Connection DEBUG] General error:`, err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function handleAcceptRequest(req, res) {
  try {
    const receiverId = req.user.id;
    const { requesterId } = req.params;
    const notificationService = req.app.get("notificationService");

    if (!requesterId) {
      return res.status(400).json({ message: "Requester ID required." });
    }

    if (receiverId === requesterId) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const connection = await Connection.findOne({
      requesterId: requesterId,
      recipientId: receiverId,
      status: "PENDING",
    });

    if (!connection) {
      return res.status(404).json({
        message: "No pending friend request found.",
      });
    }

    connection.status = "ACCEPTED";
    await connection.save();

    // Increment connection counts for both users
    await User.updateMany(
      { _id: { $in: [requesterId, receiverId] } },
      { $inc: { connectionsCount: 1 } }
    );

    await notificationService.createNotification({
      recipient: requesterId,
      sender: receiverId,
      type: "FRIEND_REQUEST_ACCEPTED",
      entityId: connection._id,
      entityType: "FRIEND_REQUEST",
      metadata: {
        message: "Your friend request has been accepted",
      },
    });

    return res.status(200).json({
      message: "Request accepted successfully.",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function handleRemoveFriend(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    if (!friendId) {
      return res.status(400).json({ message: "Friend ID required." });
    }

    if (userId === friendId) {
      return res.status(400).json({ message: "Invalid operation." });
    }

    const connection = await Connection.findOneAndDelete({
      status: "ACCEPTED",
      $or: [
        { requesterId: userId, recipientId: friendId },
        { requesterId: friendId, recipientId: userId },
      ],
    });

    if (!connection) {
      return res.status(404).json({
        message: "You are not friends.",
      });
    }

    // Decrement connection counts for both users
    await User.updateMany(
      { _id: { $in: [userId, friendId] } },
      { $inc: { connectionsCount: -1 } }
    );

    return res.status(200).json({
      message: "Friend removed successfully.",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function handleRejectedRequest(req, res) {
  try {
    const receiverId = req.user.id;
    const { requesterId } = req.params;

    if (!requesterId) {
      return res.status(400).json({ message: "Requester ID required." });
    }

    if (receiverId === requesterId) {
      return res.status(400).json({ message: "Invalid operation." });
    }

    const connection = await Connection.findOne({
      requesterId,
      recipientId: receiverId,
      status: "PENDING",
    });

    if (!connection) {
      return res.status(404).json({
        message: "No pending request found.",
      });
    }

    connection.status = "REJECTED";
    await connection.save();

    return res.status(200).json({
      message: "Friend request rejected successfully.",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}


async function handleGetSuggestions(req, res) {
  try {
    const userId = req.user.id;

    // 1️⃣ Get all existing connections (sent + received)
    const connections = await Connection.find({
      $or: [
        { requesterId: userId },
        { recipientId: userId },
      ],
    }).select("requesterId recipientId");

    // 2️⃣ Build exclusion set
    const excludedIds = new Set([userId]);
    connections.forEach(c => {
      excludedIds.add(c.requesterId.toString());
      excludedIds.add(c.recipientId.toString());
    });

    // 3️⃣ Fetch candidate users
    const users = await User.find({
      _id: { $nin: [...excludedIds] },
    }).select("name role");

    // 4️⃣ Enrich users with profileImage and affiliation
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const profileImage = await resolveProfileImage(user._id, user.role);
        const affiliation = await getAffiliation(user._id, user.role);

        return {
          _id: user._id,
          name: user.name,
          role: user.role,
          affiliation: affiliation,
          avatar: profileImage,
          status: "NONE",
        };
      })
    );

    return res.status(200).json(enrichedUsers);

  } catch (err) {
    console.error("Get Suggestions Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}



async function handleGetConnections(req, res) {
  try {
    const userId = req.user.id;

    // 1️⃣ Fetch accepted connections
    const connections = await Connection.find({
      status: "ACCEPTED",
      $or: [
        { requesterId: userId },
        { recipientId: userId },
      ],
    }).populate("requesterId", "name role").populate("recipientId", "name role");

    // 2️⃣ Extract the friend users
    const friends = connections.map(c =>
      c.requesterId._id.toString() === userId
        ? c.recipientId
        : c.requesterId
    );

    // 3️⃣ Enrich each friend with profileImage and affiliation
    const formatted = await Promise.all(
      friends.map(async (friend) => {
        const profileImage = await resolveProfileImage(friend._id, friend.role);
        const affiliation = await getAffiliation(friend._id, friend.role);

        return {
          _id: friend._id,
          name: friend.name,
          role: friend.role,
          affiliation: affiliation,
          avatar: profileImage,
        };
      })
    );

    return res.status(200).json(formatted);

  } catch (err) {
    console.error("Get Connections Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}



async function handleGetIncomingRequests(req, res) {
  try {
    const userId = req.user.id;

    // 1️⃣ Fetch pending requests + requester identity
    const requests = await Connection.find({
      recipientId: userId,
      status: "PENDING",
    }).populate("requesterId", "name role");

    // 2️⃣ Enrich with profileImage and affiliation
    const formatted = await Promise.all(
      requests.map(async (r) => {
        const requester = r.requesterId;

        const profileImage = await resolveProfileImage(requester._id, requester.role);
        const affiliation = await getAffiliation(requester._id, requester.role);

        return {
          _id: requester._id,
          name: requester.name,
          role: requester.role,
          affiliation: affiliation,
          avatar: profileImage,
        };
      })
    );

    return res.status(200).json(formatted);

  } catch (err) {
    console.error("Get Incoming Requests Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  handleSendRequest,
  handleAcceptRequest,
  handleRemoveFriend,
  handleRejectedRequest,
  handleGetSuggestions,
  handleGetConnections,
  handleGetIncomingRequests
};
