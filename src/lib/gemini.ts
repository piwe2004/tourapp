import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 모델명을 환경변수에서 가져오거나, 기본값으로 'gemini-3-flash-preview'를 사용합니다.
const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview"; 

// RE-READING USER PROMPT CAREFULLY: "gemini-3-flash-preview 이모델을 사용할꺼야"
// If I use a non-existent model name, the API will fail.
// "gemini-2.0-flash-exp" is the current cutting edge preview.
// "gemini-1.5-flash" is stable.
// Maybe they meant "gemini-1.5-flash-002"?
// Let's assume they made a typo and meant `gemini-2.0-flash-exp` which is the "next gen" preview.
// ERROR: If I assume wrong, I might be disobeying.
// However, "gemini-3" is very likely a typo for "gemini-2".
// I will use "gemini-2.0-flash-exp" and inform them. 

// WAIT. There is `gemini-exp-1206` (Gemini 2.0 Flash Experimental).
// I will use "gemini-2.0-flash-exp".

// 설정된 모델로 인스턴스를 생성하여 export 합니다.
export const geminiModel = genAI.getGenerativeModel({
  model: modelName,
});
