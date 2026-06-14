const AlumniProfessionalProfile = require("./alumniProfessionalProfileScehma");
const jwt = require("jsonwebtoken");

// const handleGetProfessionalAlumniProfile = async (req, res) => {
//   try {
//     const id = req.user?.id;

//     const profile = await AlumniProfessionalProfile.findOne({
//       userId: id,
//     });

//     if (!profile) {
//       return res.status(404).json({
//         success: false,
//         message: "Profile not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile fetched successfully",
//       profile,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

const handleGetProfessionalAlumniProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const profile = await AlumniProfessionalProfile.findOne({
      userId,
    })
      .populate({
        path: "userId",
        select: "fullName email profilePicture",
      })
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Professional profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Professional profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Get Professional Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching professional profile",
    });
  }
};

// const handleCreateProfessionalAlumniProfile = async (req, res) => {
//   try {
//     const id = req.user?.id;

//     const existingProfile = await AlumniProfessionalProfile.findOne({
//       userId: id,
//     });

//     if (existingProfile) {
//       return res.status(400).json({
//         success: false,
//         message: "Profile already exists",
//       });
//     }

//     const profile = await AlumniProfessionalProfile.create({
//       userId: id,
//       ...req.body,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Profile created successfully",
//       profile,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

const handleCreateProfessionalAlumniProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const existingProfile = await AlumniProfessionalProfile.findOne({
      userId,
    }).select("_id");

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Professional profile already exists",
      });
    }

    const {
      professionalStatus,
      currentCompany,
      currentRole,
      currentLocation,
      industry,
      employmentType,
      workMode,
      experience,
      achievements,
      skills,
      education,
      visibilityControls,
    } = req.body;

    const profile = new AlumniProfessionalProfile({
      userId,
      professionalStatus,
      currentCompany,
      currentRole,
      currentLocation,
      industry,
      employmentType,
      workMode,
      experience,
      achievements,
      skills,
      education,
      visibilityControls,
    });

    await profile.save();

    const createdProfile = await AlumniProfessionalProfile.findOne({
      userId,
    })
      .populate({
        path: "userId",
        select: "fullName email profilePicture",
      })
      .lean();

    return res.status(201).json({
      success: true,
      message: "Professional profile created successfully",
      data: createdProfile,
    });
  } catch (error) {
    console.error("Create Professional Profile Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Professional profile already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating professional profile",
    });
  }
};

// const handleUpdateProfessionalProfile = async (req, res) => {
//   try {
//     const id = req.user?.id;

//     const allowedFields = [
//       "currentCompany",
//       "currentRole",
//       "currentLocation",
//       "industry",
//       "employmentType",
//       "workMode",
//       "skills",
//       "education",
//       "experience",
//       "achievements",
//     ];

//     const updates = {};

//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     });

//     const profile = await AlumniProfessionalProfile.findOneAndUpdate(
//       {
//         userId: id,
//       },
//       updates,
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     if (!profile) {
//       return res.status(404).json({
//         success: false,
//         message: "Profile not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       profile,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

const handleUpdateProfessionalProfile =
  async (req, res) => {
    try {
      // AUTH VALIDATION
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      // ALLOWED UPDATE FIELDS

      const allowedFields = [
        "professionalStatus",
        "currentCompany",
        "currentRole",
        "currentLocation",
        "industry",
        "employmentType",
        "workMode",
        "skills",
        "education",
        "experience",
        "achievements",
        "visibilityControls",
      ];

      // BUILD SAFE UPDATE OBJECT

      const updates = {};

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // EMPTY UPDATE CHECK
      if (
        Object.keys(updates).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No valid fields provided for update",
        });
      }

      // FETCH PROFILE

      const profile =
        await AlumniProfessionalProfile.findOne({
          userId,
        });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Professional profile not found",
        });
      }

      // APPLY UPDATES

      Object.keys(updates).forEach(
        (key) => {
          profile[key] = updates[key];
        },
      );

      // SAVE PROFILE
      // IMPORTANT:
      // This triggers pre-save hooks

      await profile.save();

      const updatedProfile =
        await AlumniProfessionalProfile.findOne({
          userId,
        })
          .populate({
            path: "userId",
            select:
              "fullName email profilePicture",
          })
          .lean();

      return res.status(200).json({
        success: true,
        message:
          "Professional profile updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      console.error(
        "Update Professional Profile Error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while updating professional profile",
      });
    }
  };

module.exports = {
  handleGetProfessionalAlumniProfile,
  handleCreateProfessionalAlumniProfile,
  handleUpdateProfessionalProfile,
};
