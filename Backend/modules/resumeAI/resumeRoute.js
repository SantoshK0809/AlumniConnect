const express = require('express');
const {verifyToken}  = require("../../middlewares/authMiddleware.js");
const interviewController = require("./resumeController.js");
const upload = require("../../middlewares/multer.js");

const router = express.Router();
router.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.originalUrl);
    next();
});
router.use(verifyToken);
/**
 * @route POST /api/interview/generate-report
 * @desc Generate an interview preparation report based on the candidate's resume, self-description, and the job description.
 * @access Private
 * @body { resume: string, selfDescription: string, jobDescription: string }
 * @returns { matchScore: number, technicalQuestions: Array<{ question: string, intention: string, answer: string }>, behavioralQuestions: Array<{ question: string, intention: string, answer: string }> }
 */
router.post("/", upload.single("resume"), interviewController.generateInterviewReportController);

/**
 * @route GET /api/interviewreport
 * @desc Get all interview reports for the authenticated user.
 * @access Private
 */
router.get("/", interviewController.getAllInterviewReportsController);


/**
 * @route GET /api/interviewreport/:interviewId
 * @desc Get the interview report by interview ID.
 * @access Private
 */
router.get("/report/:interviewId", interviewController.getInterviewReportController);


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
router.post("/pdf/:interviewReportId", interviewController.generateResumePdfController);


module.exports = router;