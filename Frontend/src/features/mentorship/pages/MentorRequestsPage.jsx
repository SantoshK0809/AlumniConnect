// import React from "react";
// import MentorshipRequestCard from "../components/MentorshipRequestCard";

// const mockRequests = [
//   {
//     _id: "1",
//     message: "I need guidance for MERN stack development and placements.",
//     status: "pending",
//     createdAt: new Date(),
//     user: {
//       fullName: "Rahul Sharma",
//       profilePicture:
//         "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
//     },
//   },
//   {
//     _id: "2",
//     message: "Can you mentor me regarding DSA preparation?",
//     status: "accepted",
//     createdAt: new Date(),
//     user: {
//       fullName: "Priya Verma",
//       profilePicture:
//         "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
//     },
//   },
// ];

// const MentorRequestsPage = () => {
//   const handleAccept = (requestId) => {
//     console.log("Accepted:", requestId);
//   };

//   const handleReject = (requestId) => {
//     console.log("Rejected:", requestId);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 sm:mb-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//             Mentorship Requests
//           </h1>

//           <p className="text-sm sm:text-base text-gray-500 mt-2">
//             Review and manage mentorship requests from students.
//           </p>
//         </div>

//         {/* Requests */}
//         <div className="space-y-4">
//           {mockRequests.map((request) => (
//             <MentorshipRequestCard
//               key={request._id}
//               request={request}
//               showActions
//               onAccept={handleAccept}
//               onReject={handleReject}
//             />
//           ))}
//         </div>

//         {/* Empty State Example */}
//         {mockRequests.length === 0 && (
//           <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center mt-6">
//             <h2 className="text-lg font-semibold text-gray-800">
//               No mentorship requests yet
//             </h2>

//             <p className="text-sm text-gray-500 mt-2">
//               Incoming mentorship requests from students will appear here.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MentorRequestsPage;

import React from "react";
import MentorshipRequestCard from "../components/MentorshipRequestCard";

import useReceivedRequests from "../hooks/useReceivedRequests";

import {
  acceptMentorshipRequest,
  rejectMentorshipRequest,
} from "../api/mentorship.api";

const MentorRequestsPage = () => {
  const { requests, loading, error, refetch } = useReceivedRequests();

  /*
    Accept Request
  */
  const handleAccept = async (requestId) => {
    try {
      await acceptMentorshipRequest(requestId);

      await refetch();
    } catch (error) {
      console.error("Accept Error:", error);
    }
  };

  /*
    Reject Request
  */
  const handleReject = async (requestId) => {
    try {
      await rejectMentorshipRequest(requestId);

      await refetch();
    } catch (error) {
      console.error("Reject Error:", error);
    }
  };

  /*
    Loading State
  */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading mentorship requests...</p>
      </div>
    );
  }

  /*
    Error State
  */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mentorship Requests
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Review and manage mentorship requests from students.
          </p>
        </div>

        {/* Requests */}
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <MentorshipRequestCard
                key={request._id}
                request={request}
                showActions={true}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center mt-6">
            <h2 className="text-lg font-semibold text-gray-800">
              No mentorship requests yet
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Incoming mentorship requests from students will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorRequestsPage;
