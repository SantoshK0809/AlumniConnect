import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getIncomingRequests,
  getConnections,
  getSuggestions,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeFriend,
} from "../api/connections";

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role?.toLowerCase();

  const getRoleBasePath = () => {
    if (role === "admin") return "/teacher/admin";
    return `/${role}`;
  };

  /* LOAD DATA */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [reqData, connData, sugData] = await Promise.all([
          getIncomingRequests(),
          getConnections(),
          getSuggestions(),
        ]);

        setRequests(Array.isArray(reqData) ? reqData : []);
        setConnections(Array.isArray(connData) ? connData : []);
        setSuggestions(Array.isArray(sugData) ? sugData : []);
      } catch (err) {
        console.error("Failed to load connections", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ACTIONS */

  const handleSendRequest = async (recipientId) => {
    try {
      await sendConnectionRequest(recipientId);
      setSuggestions((prev) =>
        prev.map((u) =>
          u._id === recipientId ? { ...u, status: "sent" } : u
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      await acceptConnectionRequest(requesterId);
      const acceptedUser = requests.find((r) => r._id === requesterId);
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
      if (acceptedUser) setConnections((prev) => [...prev, acceptedUser]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await rejectConnectionRequest(requesterId);
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(friendId);
      setConnections((prev) => prev.filter((c) => c._id !== friendId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove friend");
    }
  };

  const handleMessage = (person) => {
    navigate(`${getRoleBasePath()}/messages`, {
      state: {
        selectedUser: {
          _id: person._id,
          name: person.name,
          role: person.role,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  /* USER CARD */
  const Card = ({ person, action }) => (
    <div
      onClick={() =>
        navigate(`/profile/${(person.role || "student").toLowerCase()}/${person._id}`)
      }
      className="w-full bg-white border border-gray-200 rounded-xl
                 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={
            person.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`
          }
          alt={person.name}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {person.name}
          </p>

          <p className="text-xs text-gray-600 truncate">
            {person.role}
            {person.affiliation ? ` • ${person.affiliation}` : ""}
          </p>
        </div>

        <div onClick={(e) => e.stopPropagation()}>{action}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        {/* INVITATIONS */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Invitations ({requests.length})
          </h2>

          {requests.length === 0 && (
            <p className="text-xs text-gray-500 italic">No pending invitations</p>
          )}

          <div className="space-y-2">
            {requests.map((person) => (
              <Card
                key={person._id}
                person={person}
                action={
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(person._id)}
                      className="px-3 py-1 text-xs rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(person._id)}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Ignore
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        </section>

        {/* CONNECTIONS */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Connections ({connections.length})
          </h2>

          {connections.length === 0 && (
            <p className="text-xs text-gray-500 italic">You have no connections yet</p>
          )}

          <div className="space-y-2">
            {connections.map((person) => (
              <Card
                key={person._id}
                person={person}
                action={
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMessage(person)}
                      className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(person._id)}
                      className="px-3 py-1 text-xs rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        </section>

        {/* SUGGESTIONS */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            People you may know
          </h2>

          {suggestions.length === 0 && (
            <p className="text-xs text-gray-500 italic">No suggestions available</p>
          )}

          <div className="space-y-2">
            {suggestions.map((person) => (
              <Card
                key={person._id}
                person={person}
                action={
                  person.status === "sent" ? (
                    <span className="text-xs text-gray-400 font-medium">Pending</span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(person._id)}
                      className="px-3 py-1 text-xs rounded-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Connect
                    </button>
                  )
                }
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Connections;
