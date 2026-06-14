const AlumniProfessionalProfile = require("../achievements/alumniProfessionalProfileScehma");
const User = require("../../model/registerUser/UserScehma");
const Alumni = require("../../model/Alumni");

// const handleSearchProfessionalAlumni = async (req, res) => {
//   console.log("CONTROLLER HIT");
//   try {
//     const { search = "", page = 1, limit = 10 } = req.query;

//     const trimmedSearch = search.trim().toLowerCase();

//     if (!trimmedSearch) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//     }

//     const parsedPage = parseInt(page);
//     const parsedLimit = parseInt(limit);

//     const skip = (parsedPage - 1) * parsedLimit;

//     const searchFilter = {
//       $or: [
//         {
//           currentCompanyLower: {
//             $regex: `^${trimmedSearch}`,
//             $options: "i",
//           },
//         },
//         {
//           currentRole: {
//             $regex: trimmedSearch,
//             $options: "i",
//           },
//         },
//         {
//           currentLocation: {
//             $regex: trimmedSearch,
//             $options: "i",
//           },
//         },
//         {
//           industry: {
//             $regex: trimmedSearch,
//             $options: "i",
//           },
//         },
//       ],
//       "visibilityControls.profileVisibility": {
//         $ne: "Private",
//       },
//     };

//     const profiles = await AlumniProfessionalProfile.find(searchFilter)
//       .populate({
//         path: "userId",
//         select: "fullName email profilePicture",
//       })
//       .skip(skip)
//       .limit(parsedLimit)
//       .sort({
//         profileCompleteness: -1,
//         updatedAt: -1,
//       })
//       .lean();

//     const totalProfiles =
//       await AlumniProfessionalProfile.countDocuments(searchFilter);

//     return res.status(200).json({
//       success: true,
//       data: profiles,
//       pagination: {
//         totalProfiles,
//         currentPage: parsedPage,
//         totalPages: Math.ceil(totalProfiles / parsedLimit),
//         limit: parsedLimit,
//       },
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const handleGetPublicAlumniProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const profile =
//       await AlumniProfessionalProfile.findOne({
//         userId,
//       }).populate(
//         "userId",
//         "fullName email profilePicture"
//       );

//     if (!profile) {
//       return res.status(404).json({
//         success: false,
//         message: "Profile not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: profile,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const handleSearchProfessionalAlumni = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const trimmedSearch = search.trim().toLowerCase();

    if (!trimmedSearch) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const searchFilter = {
      searchKeywords: {
        $elemMatch: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },

      "visibilityControls.profileVisibility": {
        $ne: "Private",
      },
    };

    const profiles = await AlumniProfessionalProfile.find(searchFilter)
      .populate({
        path: "userId",
        select: "name email profileImage",
      })
      .skip(skip)
      .limit(parsedLimit)
      .sort({
        profileCompleteness: -1,
        updatedAt: -1,
      })
      .lean();

    const totalProfiles =
      await AlumniProfessionalProfile.countDocuments(searchFilter);

    return res.status(200).json({
      success: true,
      data: profiles,

      pagination: {
        totalProfiles,
        currentPage: parsedPage,
        totalPages: Math.ceil(totalProfiles / parsedLimit),
        limit: parsedLimit,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleGetPublicAlumniProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = await Alumni.findOne({ user: userId });

    const professionalProfile = await AlumniProfessionalProfile.findOne({
      userId,
    });

    if (!user && !professionalProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    console.log("User:", user);
    console.log("Profile:", profile);
    console.log("Professional Profile:", professionalProfile);

    // return res.status(200).json({
    //   success: true,
    //   data: {
    //     user,
    //     profile,
    //     professionalProfile,
    //   },
    // });

    return res.status(200).json({
      success: true,
      data: {
        user,
        profile,
        professionalProfile,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  handleSearchProfessionalAlumni,
  handleGetPublicAlumniProfile,
};
