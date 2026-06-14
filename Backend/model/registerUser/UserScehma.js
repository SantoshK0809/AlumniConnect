const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["Teacher", "Admin", "Student", "Alumni"],
      required: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    prn_number: {
      type: String,
      validate: {
        validator: function (v) {
          if (this.role === "Student" || this.role === "Alumni") {
            return v && v.length > 0;
          }
          return true;
        },
        message: "PRN number is required for Student and Alumni",
      },
    },

    emp_id: {
      type: String,
      validate: {
        validator: function (v) {
          if (this.role === "Teacher" || this.role === "Admin") {
            return v && v.length > 0;
          }
          return true;
        },
        message: "Employee ID is required for Teacher and Admin",
      },
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [9, "Password must be at least 9 characters long"],
      validate: {
        validator: function (v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/.test(v);
        },
        message:
          "Password must include uppercase, lowercase, number, and special character",
      },
    },
    
    connectionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
