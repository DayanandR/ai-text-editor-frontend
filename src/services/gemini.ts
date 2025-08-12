import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not provided");
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const LEGAL_SYSTEM_PROMPT = `You are a legal AI assistant specializing in document analysis. 
Provide clear, accurate, and helpful responses about legal documents. 
Focus on key legal points, precedents, risks, and explanations of legal terms.
Keep responses concise but comprehensive.`;

export const geminiService = {
  async chat(message: string, documentContext?: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const contextualPrompt = documentContext
        ? `${LEGAL_SYSTEM_PROMPT}

Document Context: "${documentContext.substring(0, 2000)}..."

User Question: ${message}

Please provide a helpful response based on the document context.`
        : `${LEGAL_SYSTEM_PROMPT}

User Question: ${message}`;

      const result = await model.generateContent(contextualPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      return "I'm having trouble processing your request right now. Please try again.";
    }
  },

  async chatWithDocument(
    message: string,
    documentContent: string
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      // Extract key information from document for better context
      const documentPreview = documentContent.substring(0, 3000);

      const prompt = `${LEGAL_SYSTEM_PROMPT}

You are analyzing the following document:
${documentPreview}${documentContent.length > 3000 ? "..." : ""}

User Question: ${message}

Instructions:
1. Answer based on the specific document content provided
2. If the question is not related to the document, gently redirect to document-related topics
3. Cite specific sections or clauses when relevant
4. Provide actionable insights when possible
5. If information is not in the document, clearly state that

Please provide a helpful, accurate response:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini chat with document error:", error);
      return "I apologize, but I'm having trouble accessing the document right now. Please try again or rephrase your question.";
    }
  },

  // Document summarization
  async summarizeDocument(content: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Please provide a comprehensive summary of this legal document, highlighting:
1. Main legal issues
2. Key parties involved
3. Important dates and deadlines
4. Critical legal principles
5. Potential implications

Document: "${content}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini summarization error:", error);
      return "Unable to summarize document at this time.";
    }
  },

  // Extract key legal points
  async extractKeyPoints(content: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Analyze this legal document and extract the most important legal points:
1. Legal rights and obligations
2. Key clauses and provisions
3. Deadlines and timelines
4. Potential legal risks
5. Important precedents or references

Format as a numbered list for clarity.

Document: "${content}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini key points error:", error);
      return "Unable to extract key points at this time.";
    }
  },

  // Legal risk analysis
  async analyzeRisks(content: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Perform a legal risk analysis of this document. Identify:
1. Potential legal vulnerabilities
2. Compliance issues
3. Contractual risks
4. Regulatory concerns
5. Recommended actions

Document: "${content}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini risk analysis error:", error);
      return "Unable to perform risk analysis at this time.";
    }
  },

  // Explain legal terms
  async explainTerm(term: string, context: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Explain the legal term "${term}" in simple, clear language. 
Provide the definition, how it's used in legal context, and its significance.

Context from document: "${context.substring(0, 500)}..."`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini term explanation error:", error);
      return `Unable to explain the term "${term}" at this time.`;
    }
  },

  // Advanced document analysis
  async analyzeDocumentStructure(content: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Analyze the structure and organization of this legal document:
1. Document type and purpose
2. Sections and their hierarchy
3. Missing or incomplete sections
4. Formatting and presentation issues
5. Suggestions for improvement

Document: "${content}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini document structure error:", error);
      return "Unable to analyze document structure at this time.";
    }
  },

  // Generate document suggestions
  async generateSuggestions(
    content: string,
    userQuery?: string
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Based on this legal document, provide helpful suggestions for:
1. Content improvements
2. Legal considerations to add
3. Potential issues to address
4. Additional clauses that might be needed
5. Best practices to follow

${userQuery ? `Specific focus: ${userQuery}` : ""}

Document: "${content}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini suggestions error:", error);
      return "Unable to generate suggestions at this time.";
    }
  },

  // Compare documents (if you have multiple documents)
  async compareDocuments(doc1: string, doc2: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Compare these two legal documents and identify:
1. Key differences in content
2. Conflicting clauses or terms
3. Missing elements in either document
4. Recommendations for harmonization
5. Legal implications of differences

Document 1: "${doc1.substring(0, 1500)}"

Document 2: "${doc2.substring(0, 1500)}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini document comparison error:", error);
      return "Unable to compare documents at this time.";
    }
  },

  // Quick legal check
  async quickLegalCheck(content: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${LEGAL_SYSTEM_PROMPT}

Perform a quick legal check of this document:
1. Are there any obvious legal issues?
2. Is the language clear and unambiguous?
3. Are there missing standard clauses?
4. Quick risk assessment (High/Medium/Low)
5. Immediate action items

Provide a concise analysis.

Document: "${content.substring(0, 2000)}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini quick check error:", error);
      return "Unable to perform quick legal check at this time.";
    }
  },
};
