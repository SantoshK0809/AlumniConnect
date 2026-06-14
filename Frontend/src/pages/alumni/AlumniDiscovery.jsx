import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import server from "../../../environment.js";

const AlumniDiscovery = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const search = searchParams.get("search");

  useEffect(() => {
    if (!search) return;

    const fetchProfiles = async () => {
      try {
        setLoading(true);

        setError("");
        const token = localStorage.getItem("token");

        const response = await axios.get(
          // "http://localhost:4000/api/discovery/search-professional",
          `${server}/api/discovery/search-professional`,
          {
            params: {
              search,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("PROFILES FOUND:  ", response.data.data);

        setProfiles(response.data.data);
      } catch (error) {
        console.error(error);

        setError("Failed to fetch alumni profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [search, user]);

  //   const fetchCurrentUserProfile = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const profile = await axios.get(
  //         `http://localhost:4000/api/discovery/profile/${profile?.userId?._id}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Alumni Discovery</h1>

      {loading && <p>Loading...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && profiles.length === 0 && <p>No alumni found</p>}

      {/* <div className="grid gap-4">
        {profiles.map((profile) => (
          <div
            key={profile._id}
            onClick={fetchCurrentUserProfile}
            className="bg-white p-4 rounded-xl shadow"
          >
            <h2 className="font-semibold text-lg">
              {profile?.userId?.fullName}
            </h2>

            <p>{profile.currentRole}</p>

            <p>{profile.currentCompany}</p>

            <p>{profile.currentLocation}</p>
          </div>
        ))}
      </div> */}

      {/* <div className="grid gap-4">
        {profiles.map((profile) => (
          <Link
            key={profile._id}
            // to={`/${user?.role?.toLowerCase()}/profile/${profile?.userId?._id}`}
            to={`/alumni/${profile?.userId?._id}`}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition block"
          >
            <h2 className="font-semibold text-lg">{profile?.userId?.name}</h2>
            <h2 className="font-semibold text-lg">{profile?.userId?.email}</h2>

            <p>{profile.currentRole}</p>

            <p>{profile.currentCompany}</p>

            <p>{profile.currentLocation}</p>
          </Link>
        ))}
      </div> */}

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Link
            key={profile._id}
            to={`/alumni/${profile?.userId?._id}`}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition flex items-center gap-4"
          >
            {/* Profile Image */}
            <img
              src={
                profile?.profileImage?.url ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={profile?.userId?.name}
              className="w-16 h-16 rounded-full object-cover border"
            />

            {/* Alumni Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {profile?.userId?.name}
              </h2>

              <p className="text-sm text-gray-600">
                {profile?.currentRole || "Professional"}
              </p>

              <p className="text-sm text-blue-600 font-medium">
                {profile?.currentCompany || "Company not added"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AlumniDiscovery;
