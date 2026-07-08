import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to accept base64-encoded food photographs
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Endpoint to analyze food photo
  app.post("/api/analyze", async (req, res) => {
    try {
      let { image, mimeType } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Missing image data in request body." });
      }

      if (!mimeType) {
        mimeType = "image/jpeg";
      }

      // Parse base64 string if it contains the data prefix
      let base64Data = image;
      if (image.startsWith("data:")) {
        const parts = image.split(";base64,");
        if (parts.length === 2) {
          mimeType = parts[0].substring(5); // e.g. "image/png"
          base64Data = parts[1];
        }
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const promptString = 
        "Analyze the food item in this image. First, evaluate whether there is recognizable food or beverage present. " +
        "If there is NO recognizable food or drink in the image, respond strictly with 'Unknown (No Food Detected)' as the foodName, " +
        "confidence 0.0, description 'Please upload a clear image of a food item or meal.', portionSize 'N/A', calories 0, " +
        "empty ingredients array, and zero values for macronutrients.\n\n" +
        "If food is present, perform the following tasks:\n" +
        "1. Identify the name of the dish or food item.\n" +
        "2. Provide your confidence score (0.0 to 1.0).\n" +
        "3. Write a brief, appetizing description of the food item.\n" +
        "4. Estimate the typical portion size (e.g. '1 plate, approx 350g', '1 medium bowl', '2 slices').\n" +
        "5. Estimate the total calories for that portion size.\n" +
        "6. List the recognized ingredients, including their name, estimated individual amounts (e.g. '100g', '1 tsp'), and estimated calories.\n" +
        "7. Estimate the macronutrients: carbohydrates (g), proteins (g), fat (g), fiber (g), and sodium (mg).\n" +
        "8. Give a Health Score (1 to 100) indicating nutritional density.\n" +
        "9. Add appropriate dietary labels (e.g. Vegetarian, Vegan, Gluten-Free, Keto, Low-Carb, Dairy-Free, Halal, Kosher).\n" +
        "10. Provide 2-3 dietary insights or health recommendations tailored to this dish.";

      const textPart = {
        text: promptString,
      };

      console.log("Analyzing food image with Gemini 3.5 Flash...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: {
                type: Type.STRING,
                description: "The identified name of the dish or food item.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence level of identification between 0.0 and 1.0.",
              },
              description: {
                type: Type.STRING,
                description: "A short, engaging description of the identified food.",
              },
              portionSize: {
                type: Type.STRING,
                description: "The estimated portion size (e.g., '1 plate, approx 350g' or '1 medium slice').",
              },
              calories: {
                type: Type.INTEGER,
                description: "Estimated total calories for the portion size.",
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the ingredient." },
                    amount: { type: Type.STRING, description: "Estimated amount (e.g., '50g', '1 tbsp', '1/2 medium')." },
                    calories: { type: Type.INTEGER, description: "Estimated calories for this ingredient portion." }
                  },
                  required: ["name", "amount", "calories"]
                },
                description: "List of ingredients recognized in the food."
              },
              nutritionalBreakdown: {
                type: Type.OBJECT,
                properties: {
                  carbs: { type: Type.NUMBER, description: "Carbohydrates in grams." },
                  protein: { type: Type.NUMBER, description: "Protein in grams." },
                  fat: { type: Type.NUMBER, description: "Fats in grams." },
                  fiber: { type: Type.NUMBER, description: "Fiber in grams." },
                  sodium: { type: Type.NUMBER, description: "Sodium in milligrams." }
                },
                required: ["carbs", "protein", "fat"]
              },
              healthScore: {
                type: Type.INTEGER,
                description: "A healthiness rating from 1 to 100 based on nutritional density and balance."
              },
              dietaryLabels: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Applicable dietary labels, e.g., 'Keto', 'Vegan', 'Gluten-Free', 'Low-Carb', 'High-Protein', etc."
              },
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Nutritional insights, tips, or warning suggestions (e.g. 'High in saturated fat', 'Excellent source of vitamin C')."
              }
            },
            required: [
              "foodName",
              "confidence",
              "description",
              "portionSize",
              "calories",
              "ingredients",
              "nutritionalBreakdown",
              "healthScore",
              "dietaryLabels",
              "insights"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from food recognition AI.");
      }

      console.log("Successfully analyzed image! Returning data.");
      const resultData = JSON.parse(responseText.trim());
      return res.json(resultData);
    } catch (error: any) {
      console.error("Error analyzing food image:", error);
      return res.status(500).json({
        error: "Failed to analyze food image.",
        details: error.message || error,
      });
    }
  });

  // Serve static files or setup Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
