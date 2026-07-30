import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==========================================================
   MIDDLEWARE
========================================================== */

app.use(cors());

app.use(express.json({
    limit: "20mb"
}));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(__dirname));

/* ==========================================================
   GEMINI API KEYS
========================================================== */

const apiKeys = [];

for (let i = 1; i <= 20; i++) {

    const key = process.env[`GEMINI_API_KEY_${i}`];

    if (key && key.trim() !== "") {

        apiKeys.push(key.trim());

    }

}

if (process.env.GEMINI_API_KEY) {

    apiKeys.push(process.env.GEMINI_API_KEY);

}

if (apiKeys.length === 0) {

    console.error("No Gemini API Keys Found.");

    process.exit(1);

}

console.log(`Loaded ${apiKeys.length} Gemini API Key(s).`);

/* ==========================================================
   MODELS
========================================================== */

const MODELS = [
    "gemini-flash-latest"

];

let currentKey = 0;

/* ==========================================================
   GET CLIENT
========================================================== */

function getClient() {

    return new GoogleGenAI({

        apiKey: apiKeys[currentKey]

    });

}

/* ==========================================================
   NEXT KEY
========================================================== */

function nextKey() {

    currentKey++;

    if (currentKey >= apiKeys.length) {

        currentKey = 0;

    }

}

/* ==========================================================
   HOME
========================================================== */

app.get("/", (req, res) => {

    res.sendFile(

        path.join(__dirname, "index.html")

    );

});
/* ==========================================================
   GEMINI CHAT
========================================================== */

app.post("/api/chat", async (req, res) => {

    const { message } = req.body;

    if (!message) {

        return res.status(400).json({

            error: "Message is required."

        });

    }

    let lastError = null;

    const startingKey = currentKey;

    do {

        const client = getClient();

        for (const model of MODELS) {

            try {

                console.log(

                    `Trying ${model} using key ${currentKey + 1}`

                );

                const response =
                    await client.models.generateContent({

                        model,

                        contents: message

                    });

                const text =
                    response.text ||
                    response.candidates?.[0]?.content?.parts?.[0]?.text ||
                    "No response.";

                return res.json({

                    success: true,

                    model,

                    key: currentKey + 1,

                    reply: text

                });

            }

            catch (error) {

                lastError = error;

                const code =
                    error?.status ||
                    error?.code ||
                    500;

                console.log(

                    `Model ${model} failed.`

                );

                console.log(error.message);

                if (

                    code === 429 ||

                    code === 401 ||

                    code === 403

                ) {

                    break;

                }

            }

        }

        nextKey();

    }

    while (currentKey !== startingKey);

    return res.status(500).json({

        success: false,

        error: "All API keys failed.",

        details: lastError?.message ||

            "Unknown error."

    });

});
/* ==========================================================
   WEATHER API
========================================================== */

app.get("/api/weather", async (req, res) => {

    const city = req.query.city;

    if (!city) {

        return res.status(400).json({

            error: "City is required."

        });

    }

    try {

        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {

            return res.status(500).json({

                error: "Weather API key is missing."

            });

        }

        const response = await fetch(

            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`

        );

        const data = await response.json();

        if (!response.ok) {

            return res.status(400).json({

                error: data.message || "City not found."

            });

        }

        res.json({

            city: data.name,

            country: data.sys.country,

            temperature: data.main.temp,

            feelsLike: data.main.feels_like,

            humidity: data.main.humidity,

            wind: data.wind.speed,

            description: data.weather[0].description,

            icon: data.weather[0].icon

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Unable to fetch weather."

        });

    }

});

/* ==========================================================
   HEALTH CHECK
========================================================== */

app.get("/api/health", (req, res) => {

    res.json({

        status: "online",

        uptime: process.uptime(),

        loadedKeys: apiKeys.length,

        currentKey: currentKey + 1,

        models: MODELS,

        timestamp: new Date().toISOString()

    });

});

/* ==========================================================
   404
========================================================== */

app.use((req, res) => {

    res.status(404).json({

        error: "404 Not Found"

    });

});

/* ==========================================================
   ERROR HANDLER
========================================================== */

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        error: "Internal Server Error"

    });

});

/* ==========================================================
   START SERVER
========================================================== */

app.listen(PORT, () => {

    console.log("");

    console.log("====================================");

    console.log(" Galaxy Task Sphere Server Running ");

    console.log("====================================");

    console.log(`Port: ${PORT}`);

    console.log(`Loaded Keys: ${apiKeys.length}`);

    console.log(`Current Key: ${currentKey + 1}`);

    console.log("");

});
