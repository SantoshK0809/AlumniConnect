// import React, { useState } from "react";
// import { Clock3, CheckCircle2, XCircle } from "lucide-react";
// import RequestStatusBadge from "./RequestStatusBadge";
// import useReceivedRequests from "../hooks/useReceivedRequests";

// const MentorshipRequestCard = ({
//   request,
//   showActions = false,
//   onAccept,
//   onReject,
//   //loading,
// }) => {
//   //   const status = statusStyles[request.status];

//   const [message, setMessage] = useState("");
//   const { requests, loading, error, refetch } = useReceivedRequests();

//   const handleRecievedRequest = async () => {
//     e.preventDefault();
//     try {
//       const res = refetch();
//     } catch (error) {

//     }
//   }

//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
//       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//         {/* Left Section */}
//         <div className="flex items-start gap-4 w-full">
//           <img
//             src={request.user.profilePicture}
//             alt={request.user.fullName}
//             className="w-14 h-14 rounded-full object-cover border border-gray-200"
//           />

//           <div className="flex-1 min-w-0">
//             <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
//               {request.user.fullName}
//             </h3>

//             <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words">
//               {request.message}
//             </p>

//             <div className="mt-3 flex flex-wrap items-center gap-2">
//               {/* <span
//                 className={`inline-flex items-center gap-1 text-xs font-medium border px-2.5 py-1 rounded-full ${status.classes}`}
//               >
//                 {status.icon}
//                 {status.label}
//               </span> */}

//               <RequestStatusBadge status={request.status} />

//               <span className="text-xs text-gray-400">
//                 {new Date(request.createdAt).toLocaleDateString()}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         {showActions && request.status === "pending" && (
//           <div className="flex sm:flex-col gap-2 sm:w-[120px] w-full">
//             <button
//               disabled={loading}
//               onClick={() => onAccept(request._id)}
//               className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50"
//             >
//               Accept
//             </button>

//             <button
//               disabled={loading}
//               onClick={() => onReject(request._id)}
//               className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50"
//             >
//               Reject
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MentorshipRequestCard;

import React from "react";
import RequestStatusBadge from "./RequestStatusBadge";

const MentorshipRequestCard = ({
  request,
  showActions = false,
  onAccept,
  onReject,
  loading = false,
}) => {
  console.log("mentorship request card ka request: ", request);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-start gap-4 w-full">
          <img
            src={
              request?.user?.profileImage ||
              "https://ui-avatars.com/api/?name=User"
            }
            alt={request?.user?.name || "User"}
            className="w-14 h-14 rounded-full object-cover border border-gray-200"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {request?.menteeId?.name || "Unknown User"}
            </h3>

            <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words">
              {request?.message || "No message provided"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={request?.status} />

              <span className="text-xs text-gray-400">
                {request?.createdAt
                  ? new Date(request.createdAt).toLocaleDateString()
                  : "Unknown Date"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && request?.status === "pending" && (
          <div className="flex sm:flex-col gap-2 sm:w-[120px] w-full">
            <button
              disabled={loading}
              onClick={() => onAccept(request._id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              Accept
            </button>

            <button
              disabled={loading}
              onClick={() => onReject(request._id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipRequestCard;
