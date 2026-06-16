import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization of Gemini client to prevent startup crashes when API keys are not set.
let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is defined as empty or missing. Please add your Gemini API key in the Settings > Secrets panel of your workspace.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Primary Server-Side analysis endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const ai = getAiClient();
    const { code, description, systemName, model = "gemini-3.5-flash", useThinking = false } = req.body;
    if (!code && !description) {
      return res.status(400).json({ error: "Code or system description is required for analysis." });
    }

    const systemPrompt = `You are AETHER, the premier visual code intelligence layer and AI CTO.
Analyze the following codebase/architectural overview. 
Produce a comprehensive architectural mapping in strict JSON.
System Name: ${systemName || "Unnamed System"}

Identify structural elements (modules, files, databases, cache layers, external services), trace active operational sequences (e.g. core workflow, API transaction, auth flow), compile architectural conventions, identify concrete technical debts/bottlenecks, and rate system vitals from 1 to 5.

Here is the Code / Project Description:
---
${code || ""}
${description || ""}
---`;

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          systemName: { type: Type.STRING },
          repositoryMemory: {
            type: Type.OBJECT,
            properties: {
              architectureDecisions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    status: { type: Type.STRING }
                  },
                  required: ["title", "reason", "status"]
                }
              },
              conventions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["architectureDecisions", "conventions"]
          },
          architectureRatings: {
            type: Type.OBJECT,
            properties: {
              scalability: { type: Type.INTEGER },
              scalabilityDetails: { type: Type.STRING },
              security: { type: Type.INTEGER },
              securityDetails: { type: Type.STRING },
              maintainability: { type: Type.INTEGER },
              maintainabilityDetails: { type: Type.STRING },
              performance: { type: Type.INTEGER },
              performanceDetails: { type: Type.STRING }
            },
            required: [
              "scalability", "scalabilityDetails", 
              "security", "securityDetails", 
              "maintainability", "maintainabilityDetails", 
              "performance", "performanceDetails"
            ]
          },
          dependencyGraph: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING, description: "Must be 'module', 'file', 'database', 'api', or 'external'" },
                    details: { type: Type.STRING },
                    complexity: { type: Type.STRING, description: "Low, Medium, or High" }
                  },
                  required: ["id", "label", "type", "details", "complexity"]
                }
              },
              links: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ["source", "target", "label"]
                }
              }
            },
            required: ["nodes", "links"]
          },
          sequences: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scenario: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING },
                      message: { type: Type.STRING },
                      details: { type: Type.STRING }
                    },
                    required: ["from", "to", "message", "details"]
                  }
                }
              },
              required: ["scenario", "steps"]
            }
          },
          ctoOverview: {
            type: Type.OBJECT,
            properties: {
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    mitigation: { type: Type.STRING }
                  },
                  required: ["severity", "title", "description", "mitigation"]
                }
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["title", "description", "impact"]
                }
              }
            },
            required: ["risks", "suggestions"]
          },
          predictiveAnalysis: {
            type: Type.OBJECT,
            properties: {
              bottlenecks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    resource: { type: Type.STRING },
                    likelihood: { type: Type.STRING },
                    timeline: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["resource", "likelihood", "timeline", "impact"]
                }
              },
              growthTrajectory: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    expectedComplexity: { type: Type.INTEGER }
                  },
                  required: ["label", "expectedComplexity"]
                }
              }
            },
            required: ["bottlenecks", "growthTrajectory"]
          }
        },
        required: [
          "systemName", 
          "repositoryMemory", 
          "architectureRatings", 
          "dependencyGraph", 
          "sequences", 
          "ctoOverview", 
          "predictiveAnalysis"
        ]
      }
    };

    if (useThinking && model === "gemini-3.1-pro-preview") {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const response = await ai.models.generateContent({
      model,
      contents: systemPrompt,
      config
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response received from analyzer.");
    }
    const analysisResult = JSON.parse(outputText);
    res.json(analysisResult);
  } catch (err: any) {
    console.error("Analysis failed:", err);
    res.status(500).json({ error: err.message || "An unexpected error occurred during codebase analysis." });
  }
});

// CTO Interactive Consultation endpoint
app.post("/api/cto/chat", async (req, res) => {
  try {
    const ai = getAiClient();
    const { 
      message, 
      history, 
      contextData, 
      model = "gemini-3.5-flash", 
      useThinking = false, 
      role = "CTO" 
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Expert specialized roles for Aether
    let roleProps = `operating as a top-tier pragmatic AI CTO and systems architect. 
Possess deep engineering expertise in high-throughput microservices, ledger compliance, database boundaries, and micro-repositories.`;

    if (role === "Security Auditor") {
      roleProps = `operating as a Senior Cybersecurity Risk Specialist & Penetration Architect. 
Prioritize exposing validation faults, injection vulnerabilities, state-management leaks, and CORS issues. Frame actionable hotfixes.`;
    } else if (role === "Systems Architect") {
      roleProps = `operating as a Core Domain Systems Architect. 
Provide domain-driven designs, strict bounded contexts, micro-services, messaging topologies (Pub/Sub), split database strategies (CQRS), and clear file encapsulation maps.`;
    } else if (role === "SRE Specialist") {
      roleProps = `operating as a Database guru and Principal Site Reliability Engineer. 
Provide concrete schemas, transaction scopes, Redis sidecar configurations, indexing optimizations, high-concurrency bottleneck resolutions, and cold node failover paths.`;
    }

    const systemInstruction = `You are AETHER - The Intelligence Layer for Code, ${roleProps}
Your communication style is concise, highly technical, authoritative, and helpful.

Current system context being analyzed:
${JSON.stringify(contextData || {})}

Rulebook for your advice:
1. Ground recommendations in realistic system mechanics (scalability, microservice isolation, performance, caching, proper database transactions).
2. Rate choices honestly. If a developer suggests a bad pattern, kindly explain why and suggest a cleaner, industry-standard pattern (e.g. CQRS, Clean Architecture, Pub/Sub, proper indexing).
3. Do not deliver generic filler text. Give code blocks, specific structural suggestions, or precise structural improvements.
4. Keep answers clean, markdown-formatted, and extremely direct.`;

    // Map history to standard chat role mapping
    const contents: any[] = [];
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const config: any = {
      systemInstruction
    };

    if (useThinking && model === "gemini-3.1-pro-preview") {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      // Secure instruction compliance: Do not set maxOutputTokens
    }

    const chatResponse = await ai.models.generateContent({
      model,
      contents,
      config
    });

    res.json({ text: chatResponse.text });
  } catch (err: any) {
    console.error("CTO Consultation error:", err);
    res.status(500).json({ error: err.message || "Consultation failed." });
  }
});

// AI Blueprint Refactoring / Autogenerating endpoint
app.post("/api/generate/refactor", async (req, res) => {
  try {
    const ai = getAiClient();
    const { 
      prompt, 
      code, 
      description, 
      model = "gemini-3.5-flash", 
      useThinking = false 
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Instruction prompt is required for system refactoring." });
    }

    const refactorPrompt = `You are AETHER's premier Systems Synthesis Layer.
Refactor or generate the design blueprint code (expressed in TS Pseudocode DSL / declarations) and the operational description of dynamic scenario tracing relative to the developer request.

Instruction prompt from user: "${prompt}"

Current Blueprint code:
---
${code || "(empty)"}
---

Current Operational description:
---
${description || "(empty)"}
---

Produce the updated code and updated operational description in a clean JSON object containing both 'code' and 'description' keys. Do not include markdown wraps around the JSON output, follow the response schema strictly. Make sure both fields are updated appropriately to fulfill the request.`;

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["code", "description"]
      }
    };

    if (useThinking && model === "gemini-3.1-pro-preview") {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const response = await ai.models.generateContent({
      model,
      contents: refactorPrompt,
      config
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Refinement returned an empty trace.");
    }

    res.json(JSON.parse(outputText));
  } catch (err: any) {
    console.error("Refinement failed:", err);
    res.status(500).json({ error: err.message || "Refinement processing failed." });
  }
});

// Configure Vite integration for standard development / production environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aether Backend] Running successfully on port ${PORT}`);
  });
}

startServer();

