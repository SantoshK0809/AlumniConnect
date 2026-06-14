const MentorshipRequest = require("../models/mentorshipRequest.model");

const User = require("../../../model/registerUser/UserScehma");

const AppError = require("../utils/AppError");
const resolveProfileImage = require("../../../utils/profileImageResolver");

// const sendRequest = async ({ mentorId, menteeId, message }) => {
//   if (mentorId.toString() === menteeId.toString()) {
//     throw new AppError("You cannot send mentorship request to yourself", 400);
//   }

//   const mentor = await User.findById(mentorId);

//   if (!mentor) {
//     throw new AppError("Mentor not found", 404);
//   }

//   const existingRequest = await MentorshipRequest.findOne({
//     mentorId,
//     menteeId,
//     status: "pending",
//   });

//   if (existingRequest) {
//     throw new AppError("Pending mentorship request already exists", 409);
//   }

//   const mentorshipRequest = await MentorshipRequest.create({
//     mentorId,
//     menteeId,
//     message,
//   });

//   return mentorshipRequest;
// };

const sendRequest = async ({ mentorId, menteeId, message }) => {
  // Prevent self mentorship request
  if (mentorId.toString() === menteeId.toString()) {
    throw new Error("You cannot send mentorship request to yourself");
  }

  // Check mentor exists
  const mentor = await User.findById(mentorId);

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  // Prevent duplicate pending requests
  const existingRequest = await MentorshipRequest.findOne({
    mentorId,
    menteeId,
    status: "pending",
  });

  if (existingRequest) {
    throw new Error("Pending mentorship request already exists");
  }

  // Create mentorship request
  const mentorshipRequest = await MentorshipRequest.create({
    mentorId,
    menteeId,
    message,
  });

  return mentorshipRequest;
};

// const getReceivedRequests = async (mentorId) => {
//   const requests = await MentorshipRequest.find({ mentorId })
//     .populate("menteeId", "name profileImage, role")
//     .sort({ createdAt: -1 });

//   const profileImage = requests.forEach((request) => {
//     request.menteeId.profileImage = resolveProfileImage(
//       request.menteeId._id,
//       request.menteeId.role,
//     );
//   });
//   console.log("profile image:", profileImage);
//   console.log("Requests for mentorships received by mentor: ", requests);
//   return requests;
// };

const getReceivedRequests = async (mentorId) => {
  const requests = await MentorshipRequest.find({ mentorId })
    .populate("menteeId", "name profileImage role")
    .sort({ createdAt: -1 });

  const formattedRequests = await Promise.all(
    requests.map(async (request) => {
      const profileImage = await resolveProfileImage(
        request.menteeId._id,
        request.menteeId.role,
      );

      return {
        ...request.toObject(),

        user: {
          _id: request.menteeId._id,
          fullName: request.menteeId.name,
          profileImage,
        },
      };
    }),
  );

  console.log("Formatted Requests for received requests:", formattedRequests);

  return formattedRequests;
};

const getSentRequests = async (menteeId) => {
  const requests = await MentorshipRequest.find({ menteeId })
    .populate("mentorId", "name profileImage role")
    .sort({ createdAt: -1 })
    .lean();

  const formattedRequests = await Promise.all(
    requests.map(async (request) => {
      const profileImage = await resolveProfileImage(
        request.mentorId._id,
        request.mentorId.role,
      );

      return {
        ...request,

        user: {
          _id: request.mentorId._id,
          fullName: request.mentorId.name,
          profileImage,
        },
      };
    }),
  );

  console.log("Formatted Requests for sent requests:", formattedRequests);

  return formattedRequests;
};

const acceptRequest = async (requestId, mentorId) => {
  const request = await MentorshipRequest.findById(requestId);

  if (!request) {
    throw new Error("Mentorship request not found");
  }

  // Ownership validation
  if (request.mentorId.toString() !== mentorId.toString()) {
    throw new Error("Unauthorized to accept this request");
  }

  // Prevent re-processing
  if (request.status !== "pending") {
    throw new Error("Request already processed");
  }

  request.status = "accepted";

  await request.save();

  return request;
};

const rejectRequest = async (requestId, mentorId) => {
  const request = await MentorshipRequest.findById(requestId);

  if (!request) {
    throw new Error("Mentorship request not found");
  }
  if (request.mentorId.toString() !== mentorId.toString()) {
    throw new Error("Unauthorized to reject this request");
  }
  if (request.status !== "pending") {
    throw new Error("Request already processed");
  }

  request.status = "rejected";
  await request.save();
  return request;
};

module.exports = {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
};
