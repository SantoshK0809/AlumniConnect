import React from "react";
import { Clock3, CheckCircle2, XCircle } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: <Clock3 size={14} />,
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },

  accepted: {
    label: "Accepted",
    icon: <CheckCircle2 size={14} />,
    classes: "bg-green-100 text-green-700 border-green-200",
  },

  rejected: {
    label: "Rejected",
    icon: <XCircle size={14} />,
    classes: "bg-red-100 text-red-700 border-red-200",
  },
};

const RequestStatusBadge = ({ status }) => {
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium border px-2.5 py-1 rounded-full ${config.classes}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default RequestStatusBadge;
