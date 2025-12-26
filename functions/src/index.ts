/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex AI
// Note: GCLOUD_PROJECT environment variable is automatically set in Cloud Functions
const project = process.env.GCLOUD_PROJECT;
const location = "us-central1"; // Vertex AI region

const vertex_ai = new VertexAI({
  project: project || "tourapp-a8507",
  location: location,
});

// Instantiate the model
const model = vertex_ai.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export const generateOptimizedRoute = onRequest(
  { timeoutSeconds: 300, region: "us-central1", cors: true },
  async (request, response) => {
    logger.info("generateOptimizedRoute called", { body: request.body });

    try {
      const { places, preferences } = request.body;

      if (!places || !Array.isArray(places) || places.length === 0) {
        response
          .status(400)
          .send({ error: "Invalid input: 'places' array is required." });
        return;
      }

      const prompt = `
            You are an expert travel guide and route optimization engine.
            
            Task: Optimize the visiting order of the provided places to create the most efficient travel route.
            Consider the locations (latitude/longitude) to minimize travel time.
            
            User Preferences: "${preferences || "Efficient route"}"
            
            Input Places:
            ${JSON.stringify(places, null, 2)}
            
            Requirements:
            1. Return the result as a JSON object containing an "optimized_route" array.
            2. The "optimized_route" array must contain the place objects in the optimized order.
            3. Do NOT include any explanations or thinking process. Output ONLY valid JSON.
            4. Ensure all original fields of the place objects are preserved.
            
            Response Format:
            {
                "optimized_route": [ ...sorted places... ]
            }
        `;

      const result = await model.generateContent(prompt);
      const responseContent = result.response;
      const text = responseContent.candidates?.[0].content.parts?.[0].text;

      if (!text) {
        throw new Error("No response from Vertex AI");
      }

      // Parse JSON to ensure validity before sending
      const jsonResponse = JSON.parse(text);

      response.status(200).send(jsonResponse);
    } catch (error: any) {
      logger.error("Error in generateOptimizedRoute", error);
      response.status(500).send({
        error: "Internal Server Error",
        message: error.message,
        details: error.toString(),
      });
    }
  }
);
