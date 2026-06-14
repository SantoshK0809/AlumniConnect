const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");
//const { resume, selfDescription, jobDescription } = require("./temp.js");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job description, with 100 being a perfect match and 0 being no match at all.",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The technical question that can be asked during the interview.",
          ),
        intention: z
          .string()
          .describe(
            "The intention of the interviewer behind asking this technical question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this technical question, what points to cover, what approach to take, etc.",
          ),
      }),
    )
    .describe(
      "List of technical questions that can be asked during the interview, along with the intention behind asking those questions and how to answer them.",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The behavioral question that can be asked during the interview.",
          ),
        intention: z
          .string()
          .describe(
            "The intention of the interviewer behind asking this behavioral question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this behavioral question, what points to cover, what approach to take, etc.",
          ),
      }),
    )
    .describe(
      "List of behavioral questions that can be asked during the interview, along with the intention behind asking those questions and how to answer them.",
    ),

  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "The skill that the candidate is lacking and needs to work on.",
          ),
        severity: z
          .enum(["Low", "Medium", "High"])
          .describe(
            "The severity level of the skill gap, indicating how critical it is for the candidate to address this gap.",
          ),
      }),
    )
    .describe(
      "List of skill gaps that the candidate needs to work on, along with the severity level of each skill gap.",
    ),

  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe(
            "The day number in the preparation plan, indicating the sequence of the preparation tasks.",
          ),
        focus: z
          .string()
          .describe(
            "The focus area for that day in the preparation plan, indicating what the candidate should concentrate on.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of specific tasks that the candidate should complete on that day to prepare for the interview.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate, outlining what they should focus on and what tasks they should complete each day leading up to the interview.",
    ),

  title: z
    .string()
    .describe("The title of the job position the candidate is applying for."),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You MUST return STRICT JSON.

Generate:
- 3 to 5 technical questions, intention behind the question, and expected answer based on job description
- 3 behavioral questions, intention behind the question, and expected answer of interviewer
- 3 to 5 skill gaps
- 5 day preparation plan

Each field MUST be fully filled. No null values allowed.

DO NOT leave any field empty.
data should be generated based on - 
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Example:
{
  "matchScore": 85,
  "title": "Software Engineer",
  "technicalQuestions": [
    {
      "question": "Explain REST API principles",
      "intention": "Check backend fundamentals",
      "answer": "Discuss statelessness, CRUD, HTTP methods"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Tell me about a challenge",
      "intention": "Evaluate problem-solving",
      "answer": "Use STAR method"
    }
  ],
  "skillGaps": [
    {
      "skill": "Monitoring Tools",
      "severity": "Medium"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "Backend basics",
      "tasks": ["Revise Node.js", "Practice APIs"]
    }
  ]
}

`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJSONSchema: zodToJsonSchema(interviewReportSchema),
    },
  });
  //console.log(JSON.parse(response.text));
  return JSON.parse(response.text);
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
