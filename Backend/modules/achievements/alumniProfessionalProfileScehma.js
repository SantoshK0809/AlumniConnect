// import mongoose, { Schema } from "mongoose";

// const experienceSchema = new Schema(
//   {
//     companyName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Store lowercase normalized version for searching
//     companyNameLower: {
//       type: String,
//       lowercase: true,
//       trim: true,
//       select: false,
//     },

//     role: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     location: {
//       type: String,
//       trim: true,
//     },

//     employmentType: {
//       type: String,
//       enum: [
//         "Full-time",
//         "Internship",
//         "Part-time",
//         "Freelance",
//         "Contract",
//         "Founder",
//       ],
//     },

//     workMode: {
//       type: String,
//       enum: ["Remote", "Hybrid", "Onsite"],
//     },

//     startDate: {
//       type: Date,
//     },

//     endDate: {
//       type: Date,
//       validate: {
//         validator: function (value) {
//           if (!value || !this.startDate) return true;
//           return value >= this.startDate;
//         },
//         message: "End date cannot be before start date",
//       },
//     },

//     currentlyWorking: {
//       type: Boolean,
//       default: false,
//     },

//     description: {
//       type: String,
//       maxlength: 1000,
//     },

//     skillsUsed: [
//       {
//         type: String,
//         trim: true,
//         lowercase: true,
//       },
//     ],
//   },
//   { _id: false },
// );

// const achievementSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       trim: true,
//     },

//     achievementType: {
//       type: String,
//       enum: [
//         "Award",
//         "Promotion",
//         "Certification",
//         "Hackathon",
//         "Research Paper",
//         "Patent",
//         "Speaker",
//         "Leadership",
//         "Startup",
//         "Open Source",
//         "Other",
//       ],
//     },

//     date: {
//       type: Date,
//     },

//     // proofUrl: {
//     //   type: String,
//     //   trim: true,
//     // },
//   },
//   { _id: false },
// );

// const alumniProfessionalProfileSchema = new Schema(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true,
//       index: true,
//     },

//     currentCompany: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true,
//     },

//     // NORMALIZED FIELD FOR SEARCHING
//     currentCompanyLower: {
//       type: String,
//       lowercase: true,
//       trim: true,
//       index: true,
//       select: false,
//     },

//     currentRole: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true,
//     },

//     currentLocation: {
//       type: String,
//       trim: true,
//       index: true,
//     },

//     industry: {
//       type: String,
//       trim: true,
//       index: true,
//       sparse: true,
//     },

//     employmentType: {
//       type: String,
//       enum: [
//         "Full-time",
//         "Internship",
//         "Part-time",
//         "Freelance",
//         "Contract",
//         "Founder",
//       ],
//     },

//     workMode: {
//       type: String,
//       enum: ["Remote", "Hybrid", "Onsite"],
//     },

//     experience: [experienceSchema],

//     achievements: [achievementSchema],

//     skills: [
//       {
//         type: String,
//         trim: true,
//         lowercase: true,
//         index: true,
//       },
//     ],

//     // expertise: [
//     //   {
//     //     type: String,
//     //     trim: true,
//     //     index: true,
//     //   },
//     // ],

//     // bio: {
//     //   type: String,
//     //   maxlength: 1000,
//     // },

//     // socialLinks: {
//     //   linkedinUrl: String,
//     //   githubUrl: String,
//     //   portfolioUrl: String,
//     //   twitterUrl: String,
//     //   personalWebsite: String,
//     // },

//     // mentorshipPreferences: {
//     //   availableForMentorship: {
//     //     type: Boolean,
//     //     default: false,
//     //   },

//     //   availableForReferral: {
//     //     type: Boolean,
//     //     default: false,
//     //   },

//     //   availableForMockInterviews: {
//     //     type: Boolean,
//     //     default: false,
//     //   },

//     //   availableForNetworking: {
//     //     type: Boolean,
//     //     default: true,
//     //   },
//     // },

//     education: {
//       degree: {
//         type: String,
//         trim: true,
//       },

//       department: {
//         type: String,
//         trim: true,
//         index: true,
//       },

//       graduationYear: {
//         type: Number,
//         index: true,
//       },
//     },

//     searchKeywords: [
//       {
//         type: String,
//         lowercase: true,
//         trim: true,
//         index: true,
//       },
//     ],

//     visibilityControls: {
//       profileVisibility: {
//         type: String,
//         enum: ["Public", "AlumniOnly", "Private"],
//         default: "Public",
//       },

//       showEmail: {
//         type: Boolean,
//         default: false,
//       },

//       showPhone: {
//         type: Boolean,
//         default: false,
//       },

//       allowDirectMessages: {
//         type: Boolean,
//         default: true,
//       },
//     },

//     // verification: {
//     //   companyEmailVerified: {
//     //     type: Boolean,
//     //     default: false,
//     //   },

//     //   linkedinVerified: {
//     //     type: Boolean,
//     //     default: false,
//     //   },

//     //   isVerifiedProfessional: {
//     //     type: Boolean,
//     //     default: false,
//     //   },
//     // },
//   },
//   {
//     timestamps: true,
//   },
// );

// alumniProfessionalProfileSchema.pre("save", function (next) {
//   // Normalize current company
//   if (this.currentCompany) {
//     this.currentCompanyLower = this.currentCompany.toLowerCase();
//   }

//   // Normalize experience companies
//   if (this.experience?.length) {
//     this.experience.forEach((exp) => {
//       if (exp.companyName) {
//         exp.companyNameLower = exp.companyName.toLowerCase();
//       }
//     });
//   }

//   // Auto-generate search keywords
//   const keywords = new Set();

//   // Current company & role
//   if (this.currentCompany)
//     keywords.add(this.currentCompany.toLowerCase().trim());

//   if (this.currentRole) keywords.add(this.currentRole.toLowerCase().trim());

//   // Skills
//   this.skills?.forEach((skill) => {
//     keywords.add(skill.toLowerCase().trim());
//   });

//   // Expertise
//   // this.expertise?.forEach((item) => {
//   //   keywords.add(item.toLowerCase().trim());
//   // });

//   // Previous companies
//   this.experience?.forEach((exp) => {
//     if (exp.companyName) {
//       keywords.add(exp.companyName.toLowerCase().trim());
//     }

//     if (exp.role) {
//       keywords.add(exp.role.toLowerCase().trim());
//     }
//   });

//   this.searchKeywords = [...keywords];

//   next();
// });

// // THIS IS CRITICAL
// // Enables powerful searching

// // alumniProfessionalProfileSchema.index({
// //   currentCompany: "text",
// //   currentRole: "text",
// //   skills: "text",
// //   expertise: "text",
// //   searchKeywords: "text",
// //   "experience.companyName": "text",
// //   "experience.role": "text",
// // });

// alumniProfessionalProfileSchema.index({
//   currentCompanyLower: 1,
//   "education.graduationYear": 1,
// });

// alumniProfessionalProfileSchema.index({
//   currentCompanyLower: 1,
//   currentRole: 1,
// });

// export const AlumniProfessionalProfile = mongoose.model(
//   "AlumniProfessionalProfile",
//   alumniProfessionalProfileSchema,
// );

const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    // Internal normalized field for searching
    companyNameLower: {
      type: String,
      lowercase: true,
      trim: true,
      select: false,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: [
        "Full-time",
        "Internship",
        "Part-time",
        "Freelance",
        "Contract",
        "Founder",
      ],
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite"],
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,

      validate: {
        validator: function (value) {
          if (!value || !this.startDate) return true;

          return value >= this.startDate;
        },

        message: "End date cannot be before start date",
      },
    },

    currentlyWorking: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    skillsUsed: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    _id: false,
  },
);

// Prevent invalid state
// Example:
// currentlyWorking = true + endDate exists

experienceSchema.pre("validate", function (next) {
  if (this.currentlyWorking && this.endDate) {
    return next(new Error("Currently working experience cannot have endDate"));
  }

  next();
});

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    achievementType: {
      type: String,
      enum: [
        "Award",
        "Promotion",
        "Certification",
        "Hackathon",
        "Research Paper",
        "Patent",
        "Speaker",
        "Leadership",
        "Startup",
        "Open Source",
        "Other",
      ],
    },

    date: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const alumniProfessionalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Better flexibility for future
    professionalStatus: {
      type: String,

      enum: [
        "Working",
        "Higher Studies",
        "Entrepreneur",
        "Seeking Opportunities",
        "Career Break",
      ],

      default: "Working",
    },

    currentCompany: {
      type: String,
      trim: true,
      index: true,
    },

    // Internal normalized field
    currentCompanyLower: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      select: false,
    },

    currentRole: {
      type: String,
      trim: true,
    },

    currentLocation: {
      type: String,
      trim: true,
      sparse: true,
    },

    industry: {
      type: String,
      trim: true,
      sparse: true,
    },

    employmentType: {
      type: String,

      enum: [
        "Full-time",
        "Internship",
        "Part-time",
        "Freelance",
        "Contract",
        "Founder",
      ],
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite"],
    },

    experience: {
      type: [experienceSchema],

      validate: [(arr) => arr.length <= 20, "Maximum 20 experiences allowed"],
    },

    achievements: {
      type: [achievementSchema],

      validate: [(arr) => arr.length <= 20, "Maximum 20 achievements allowed"],
    },

    skills: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],

      validate: [(arr) => arr.length <= 30, "Maximum 30 skills allowed"],
    },

    education: {
      degree: {
        type: String,
        trim: true,
      },

      department: {
        type: String,
        trim: true,
        index: true,
      },

      graduationYear: {
        type: Number,
        min: 1950,
        max: 2100,
        index: true,
      },
    },

    // Support field for future search/recommendation systems
    searchKeywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
        select: false,
      },
    ],

    visibilityControls: {
      profileVisibility: {
        type: String,

        enum: ["Public", "AlumniOnly", "Private"],

        default: "Public",
      },

      showEmail: {
        type: Boolean,
        default: false,
      },

      showPhone: {
        type: Boolean,
        default: false,
      },

      allowDirectMessages: {
        type: Boolean,
        default: true,
      },
    },

    // Useful later for ranking & onboarding
    profileCompleteness: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

// ================================
// PRE SAVE HOOK
// ================================

alumniProfessionalProfileSchema.pre("save", function (next) {
  // Normalize current company

  if (this.currentCompany) {
    this.currentCompanyLower = this.currentCompany.toLowerCase().trim();
  }

  // Normalize experience companies

  if (this.experience?.length) {
    this.experience.forEach((exp) => {
      if (exp.companyName) {
        exp.companyNameLower = exp.companyName.toLowerCase().trim();
      }
    });
  }

  // Generate search keywords

  const keywords = new Set();

  // Current company

  if (this.currentCompany) {
    keywords.add(this.currentCompany.toLowerCase().trim());
  }

  // Current role

  if (this.currentRole) {
    keywords.add(this.currentRole.toLowerCase().trim());
  }

  // Skills

  this.skills?.forEach((skill) => {
    keywords.add(skill.toLowerCase().trim());
  });

  // Experience companies + roles

  this.experience?.forEach((exp) => {
    if (exp.companyName) {
      keywords.add(exp.companyName.toLowerCase().trim());
    }

    if (exp.role) {
      keywords.add(exp.role.toLowerCase().trim());
    }
  });

  this.searchKeywords = [...keywords];

  // ==================================
  // PROFILE COMPLETENESS
  // ==================================

  let completeness = 0;

  if (this.currentCompany) completeness += 20;

  if (this.currentRole) completeness += 20;

  if (this.skills?.length) completeness += 20;

  if (this.experience?.length) completeness += 20;

  if (this.education?.graduationYear) completeness += 20;

  this.profileCompleteness = completeness;

  next();
});

// INDEXES

// Company + Graduation Year
alumniProfessionalProfileSchema.index({
  currentCompanyLower: 1,
  "education.graduationYear": 1,
});

// Company + Role
alumniProfessionalProfileSchema.index({
  currentCompanyLower: 1,
  currentRole: 1,
});

// Skills search
alumniProfessionalProfileSchema.index({
  skills: 1,
});

// Department search
alumniProfessionalProfileSchema.index({
  "education.department": 1,
});

// Industry search
alumniProfessionalProfileSchema.index({
  industry: 1,
});

// Search keyword lookup
alumniProfessionalProfileSchema.index({
  searchKeywords: 1,
});

const AlumniProfessionalProfile = mongoose.model(
  "AlumniProfessionalProfile",
  alumniProfessionalProfileSchema,
);

module.exports = AlumniProfessionalProfile;
