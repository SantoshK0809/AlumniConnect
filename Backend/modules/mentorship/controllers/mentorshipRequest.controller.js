const mentorshipRequestService = require("../services/mentorshipRequest.service");

// const handleSendMentorshipRequest = async (req, res, next) => {
//   try {
//     const result = await mentorshipRequestService.sendRequest({
//       mentorId: req.body.mentorId,
//       menteeId: req.user._id,
//       message: req.body.message,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Mentorship request sent successfully",
//       data: result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const handleSendMentorshipRequest = async (req, res) => {
  try {
    const { mentorId, message } = req.body;

    const mentorshipRequest = await mentorshipRequestService.sendRequest({
      mentorId,
      menteeId: req.user.id,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Mentorship request sent successfully",
      data: mentorshipRequest,
    });
  } catch (error) {
    // Self request
    if (error.message === "You cannot send mentorship request to yourself") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Mentor not found
    if (error.message === "Mentor not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Duplicate request
    if (error.message === "Pending mentorship request already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // Internal server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const handleReceivedMentorshipRequests = async (req, res) => {
//   try {
//     const mentorshipRequests =
//       await mentorshipRequestService.getReceivedRequests(req.user._id);

//     return res.status(200).json({
//       success: true,
//       data: mentorshipRequests,
//     });
//   } catch (error) {
//     if(error.message === "No mentorship requests found"){
//       return res.status(404).json({
//         success: false,
//         message: error.message,
//       })
//     }
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const handleReceivedMentorshipRequests = async (req, res) => {
  try {
    const mentorshipRequests =
      await mentorshipRequestService.getReceivedRequests(req.user.id);

    return res.status(200).json({
      success: true,
      data: mentorshipRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSentMentorshipRequests = async (req, res) => {
  try {
    const mentorshipRequests = await mentorshipRequestService.getSentRequests(
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      data: mentorshipRequests,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleAcceptMentorshipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const updatedRequest = await mentorshipRequestService.acceptRequest(
      requestId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Mentorship request accepted successfully",
      data: updatedRequest,
    });
  } catch (error) {
    if (error.message === "Mentorship request not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Unauthorized to accept this request") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Request already processed") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleRejectMentorshipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const updatedRequest = await mentorshipRequestService.rejectRequest(
      requestId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Mentorship request rejected successfully",
      data: updatedRequest,
    });
  } catch (error) {
    if (error.message === "Mentorship request not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Unauthorized to reject this request") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Request already processed") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  handleSendMentorshipRequest,
  handleReceivedMentorshipRequests,
  getSentMentorshipRequests,
  handleAcceptMentorshipRequest,
  handleRejectMentorshipRequest,
};
