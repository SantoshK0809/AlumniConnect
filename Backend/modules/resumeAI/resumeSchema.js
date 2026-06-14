const mongoose = require("mongoose");

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required."]
    },
    intention: {
        type: String,
        required: [true, "Intention behind the question is required."]
    },
    answer: {
        type: String,
        required: [true, "Answer to the technical question is required."]
    }
},{
    _id: false
});

const behavioralQuestionSchema = new mongoose.Schema({
     question: {
        type: String,
        required: [true, "Technical question is required."]
    },
    intention: {
        type: String,
        required: [true, "Intention behind the question is required."]
    },
    answer: {
        type: String,
        required: [true, "Answer to the technical question is required."]
    }
},{
    _id: false
});

const skillGapSchema = new mongoose.Schema({
    skill : {
        type: String,
        required: [true, "Skill name is required."],
    },
    severity : {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: [true, "Severity level is required."]
    }
}, {
    _id: false
});

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day number is required."],
    },
    focus: {
        type: String,
        required: [true, "Focus area is required."]
    },
    tasks : [{
        type: String,
        required: [true, "Task description is required."]
    }]
},{
    _id: false
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription : {
        type: String,
        required: [true, "Job description is required."]
    },
    resume : {
        type: String,
    },
    selfDescription : {
        type: String
    },
    matchScore : {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Associated user is required."]
    },
    title: {
        type: String,
        required: [true, "Report title is required."],
    }
}, {
    timestamps: true
});

const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = InterviewReport;