// lib/gemini.service.ts
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// ✅ List of models in order of preference
const MODEL_NAMES = [
  "gemini-3.5-flash",
  "gemini-3.5-pro",
  "gemini-2.5-flash",
];

// Type for AI Insights
export interface AIInsights {
  salaryRanges: Array<{
    role: string;
    min: number;
    max: number;
    median: number;
    location: string;
  }>;
  growthRate: number;
  demandLevel: "HIGH" | "MEDIUM" | "LOW";
  topSkills: string[];
  marketOutlook: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  keyTrends: string[];
  recommendedSkills: string[];
}

/**
 * Try multiple models until one works
 */
async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`🔄 Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      console.log(`✅ Model ${modelName} succeeded!`);
      return response.text();
    } catch (error: any) {
      console.warn(`❌ Model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

/**
 * Generate AI insights for a specific industry
 */
export const generateAIInsights = async (industry: string): Promise<AIInsights> => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "HIGH" | "MEDIUM" | "LOW",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;

  const text = await generateWithFallback(prompt);
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleanedText) as AIInsights;
};

// ============================================================
// COVER LETTER FUNCTIONS
// ============================================================

interface GenerateCoverLetterData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  userIndustry: string;
  userExperience: number;
  userSkills: string[];
  userBio?: string;
}

/**
 * Generate a professional cover letter
 */
export const generateCoverLetter = async (data: GenerateCoverLetterData): Promise<string> => {
  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
    
    About the candidate:
    - Industry: ${data.userIndustry}
    - Years of Experience: ${data.userExperience}
    - Skills: ${data.userSkills?.join(", ")}
    - Professional Background: ${data.userBio || "Not provided"}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown without any additional text or explanations.
  `;

  return generateWithFallback(prompt);
};

// ============================================================
// RESUME FUNCTIONS
// ============================================================

/**
 * Improve resume content with AI
 */
export const improveWithAI = async (
  current: string,
  type: string,
  userIndustry: string
): Promise<string> => {
  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${userIndustry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  return generateWithFallback(prompt);
};

// ============================================================
// QUIZ FUNCTIONS
// ============================================================

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

/**
 * Generate quiz questions for a user based on their industry and skills
 */
export const generateQuizQuestions = async (
  industry: string,
  skills: string[] = []
): Promise<QuizQuestion[]> => {
  const prompt = `
    Generate 10 technical interview questions for a ${industry} professional${skills?.length ? ` with expertise in ${skills.join(", ")}` : ""}.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  const text = await generateWithFallback(prompt);
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  const quiz = JSON.parse(cleanedText);
  return quiz.questions;
};

/**
 * Generate improvement tip based on wrong answers
 */
export const generateImprovementTip = async (
  wrongAnswers: Array<{
    question: string;
    answer: string;
    userAnswer: string;
  }>,
  industry: string
): Promise<string> => {
  const wrongQuestionsText = wrongAnswers.map(
    (q) => `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
  ).join("\n\n");
  
  const prompt = `
    The user got the following ${industry} technical interview questions wrong:
    
    ${wrongQuestionsText}
    
    Based on these mistakes, provide a concise, specific improvement tip.
    Focus on the knowledge gaps revealed by these wrong answers.
    Keep the response under 2 sentences and make it encouraging.
    Don't explicitly mention the mistakes, instead focus on what to learn/practice.
  `;

  return generateWithFallback(prompt);
};

// ============================================================
// EXPORT ALL FUNCTIONS
// ============================================================

export default {
  generateAIInsights,
  generateCoverLetter,
  improveWithAI,
  generateQuizQuestions,
  generateImprovementTip,
};