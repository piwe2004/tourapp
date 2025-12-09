import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 모델명을 환경변수에서 가져오거나, 기본값으로 'gemini-1.5-flash'를 사용합니다.
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// 설정된 모델로 인스턴스를 생성하여 export 합니다.
export const geminiModel = genAI.getGenerativeModel({
  model: modelName,
});
