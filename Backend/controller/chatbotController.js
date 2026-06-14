/**
 * Chatbot Controller
 * Handles AI-like responses for platform help and support.
 */

const getChatResponse = (query) => {
  const q = query.toLowerCase();

  // Basic greetings
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello! I'm your AlumniConnect AI Agent. I can help you with networking, placements, and learning strategies. How can I assist you today?";
  }

  // Placements and Jobs
  if (q.includes("job") || q.includes("placement") || q.includes("internship") || q.includes("hire") || q.includes("career")) {
    return "For placements and jobs, I recommend: \n1. Navigating to the 'Feed' to see latest job postings shared by Alumni. \n2. Going to the 'Directory', filtering for Alumni working in your target companies, and sending them a polite connection request to ask for referrals or guidance. \n3. Make sure your profile skills are updated so our Recommendation System can match you with the right alumni!";
  }

  // Study, Learning, and Mentorship
  if (q.includes("study") || q.includes("learn") || q.includes("prepare") || q.includes("mentor") || q.includes("skills")) {
    return "To enhance your studies and get mentorship: \n1. Check your 'Dashboard' for 'Recommended' matching your department. \n2. Message Teachers via the Directory for academic doubts. \n3. Connect with Alumni who possess the skills you want to learn (e.g., React, Python). They often post tips in the Feed or can provide 1-on-1 mentorship via direct messages.";
  }

  // Connecting and Networking
  if (q.includes("connect") || q.includes("network") || q.includes("message") || q.includes("alumni")) {
    return "Networking is key! Here is how you can connect: \n1. Go to the 'Directory' and search by name or role. \n2. Click 'View Profile' to understand their background. \n3. Click 'Message' to start a direct chat. Remember to introduce yourself professionally!";
  }

  // Profile Management
  if (q.includes("profile") || q.includes("update") || q.includes("edit")) {
    return "To update your profile, click on the 'Profile' link in the sidebar. Remember: a complete profile with your skills, links, and bio significantly improves your networking success and AI recommendations!";
  }

  // Help Menu
  if (q.includes("help") || q.includes("support")) {
    return "I am your AI Agent. Ask me about: \n🎓 'How to study for placements?'\n🤝 'How to connect with alumni?'\n💼 'How to find job postings?'\nI'm here to guide you through the AlumniConnect ecosystem!";
  }

  // Default fallback
  return "That's an interesting question! I am specialized in helping you navigate AlumniConnect for studies, placements, and networking. Could you ask specifically about finding jobs, connecting with mentors, or updating your profile?";
};

exports.handleChatQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const response = getChatResponse(query);
    
    // Simulate thinking delay
    setTimeout(() => {
      res.status(200).json({ response });
    }, 500);

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
