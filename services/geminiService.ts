
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { DistrictRisk, CycloneTrackPoint, AgentResponse } from '../types';
import { getSimulationData } from '../constants';
import { addLog } from './loggingService';

const getClient = () => {
    const apiKey = process.env.API_KEY || ''; 
    return new GoogleGenAI({ apiKey });
}

// --- STANDARD ANALYTICS ---

export const analyzeRisk = async (district: DistrictRisk, currentCycloneStatus: CycloneTrackPoint): Promise<string> => {
  const startTime = Date.now();
  try {
    const ai = getClient();
    
    const prompt = `
      Act as an emergency response expert for the National Disaster Management Authority (NDMA).
      Context: Cyclone Simulation.
      District: ${district.name}, ${district.state}.
      Risk Score: ${district.riskScore}/10.
      Cyclone Status: ${currentCycloneStatus.category}, ${currentCycloneStatus.windSpeedKmph} km/h.

      Task: Generate a concise, 3-bullet point tactical executive summary. Format as Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const duration = Date.now() - startTime;
    addLog({
      endpoint: 'Gemini 2.5 Flash',
      status: 'SUCCESS',
      latencyMs: duration,
      details: `Generated risk report for ${district.name}`
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    const duration = Date.now() - startTime;
    addLog({
      endpoint: 'Gemini 2.5 Flash',
      status: 'FAILURE',
      latencyMs: duration,
      details: `Failed to generate report: ${(error as any).message}`
    });
    console.error("Gemini API Error:", error);
    return "Error generating AI analysis.";
  }
};

// --- AGENT FUNCTION DEFINITIONS (GLOBAL) ---

const getGlobalRiskFunc: FunctionDeclaration = {
  name: 'get_global_risk',
  parameters: {
    type: Type.OBJECT,
    description: 'Get cyclone risk details for a specific region or city globally.',
    properties: {
      basin: {
        type: Type.STRING,
        description: 'The ocean basin (e.g., "north_atlantic", "north_indian", "pacific").',
      },
      country: {
        type: Type.STRING,
        description: 'Target country (e.g., USA, India, Japan).',
      },
      city: {
        type: Type.STRING,
        description: 'Specific city name (e.g., Tampa, Chennai, Miami).',
      }
    },
    required: ['country'],
  },
};

const findSheltersFunc: FunctionDeclaration = {
  name: 'find_shelters',
  parameters: {
    type: Type.OBJECT,
    description: 'Find emergency shelters in a specific administrative region.',
    properties: {
      country: { type: Type.STRING },
      state: { type: Type.STRING },
      radius_km: { type: Type.NUMBER }
    },
    required: ['country', 'state'],
  },
};

const navigateToBasinFunc: FunctionDeclaration = {
  name: 'navigate_to_basin',
  parameters: {
    type: Type.OBJECT,
    description: 'Switch the map view to a specific global basin.',
    properties: {
      basin_id: { 
        type: Type.STRING, 
        description: 'ID of the basin: "na" (North Atlantic/USA), "ni" (North Indian/India), "wp" (West Pacific).' 
      },
    },
    required: ['basin_id'],
  },
};

const generateAlertFunc: FunctionDeclaration = {
  name: 'generate_alert',
  parameters: {
    type: Type.OBJECT,
    description: 'Generate a multi-lingual emergency SMS alert for specific districts.',
    properties: {
      language: { type: Type.STRING, description: 'Target languages (e.g., "en|es|hi")' },
      districts: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'List of district names to target.'
      }
    },
    required: ['language'],
  },
};

// --- AGENT INTERACTION ---

export const getAgentResponse = async (userMessage: string, chatHistory: any[], activeBasinId: string): Promise<AgentResponse> => {
  const startTime = Date.now();
  let action: AgentResponse['action'] = undefined;

  try {
    const ai = getClient();
    
    const tools = [{
      functionDeclarations: [getGlobalRiskFunc, findSheltersFunc, navigateToBasinFunc, generateAlertFunc]
    }];

    // SYSTEM PROMPT: SHIELD PERSONA
    const systemInstruction = `
      You are 'Shield', the AI tactical coordinator for Global Disaster Response.
      Current Active Basin: ${activeBasinId === 'na' ? 'North Atlantic (USA/Florida focus)' : 'North Indian (India/Chennai focus)'}.
      
      CAPABILITIES:
      1. Navigate the map using 'navigate_to_basin' if the user asks for a region outside current view (e.g., "Show Florida").
      2. Analyze risk using 'get_global_risk' for specific cities (e.g., "Deep dive Tampa").
      3. Locate shelters using 'find_shelters'.
      
      DATA CONTEXT:
      - North Indian (ni): Cyclone Ditwah (Chennai/Andhra).
      - North Atlantic (na): Simulated Cat 4 Cyclone approaching Florida (Miami/Tampa).
      
      PROTOCOL:
      - If user asks about a location in a different basin, FIRST navigate there, THEN describe it.
      - Be concise, military style.
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview', 
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: userMessage });
    
    // Handle Function Calls
    const call = result.functionCalls?.[0];
    
    if (call) {
      let functionResponse = { result: "Data not found" };

      // TOOL: NAVIGATE
      if (call.name === 'navigate_to_basin') {
        const bid = (call.args as any).basin_id;
        action = { type: 'NAVIGATE', payload: bid };
        functionResponse = { result: `Acknowledged. Rerouting satellite feed to ${bid.toUpperCase()} basin.` };
      } 
      
      // TOOL: GLOBAL RISK
      else if (call.name === 'get_global_risk') {
        const { basin, country, city } = (call.args as any);
        
        // Dynamic Data Lookup based on requested region
        const targetBasin = (country?.toLowerCase().includes('usa') || basin?.includes('atlantic')) ? 'na' : 'ni';
        const data = getSimulationData(targetBasin);
        
        let riskInfo = "General regional risk is ELEVATED.";
        if (city) {
          const district = data.districts.find(d => d.name.toLowerCase().includes(city.toLowerCase()));
          if (district) {
             riskInfo = `City: ${district.name}, State: ${district.state}. Risk Score: ${district.riskScore}/10. Pop: ${(district.populationAffected/1e6).toFixed(1)}M. Infra at Risk: ${district.criticalInfrastructureCount} units.`;
          } else {
             riskInfo = `City ${city} not found in high-priority impact zone list.`;
          }
        }
        functionResponse = { result: `RISK ASSESSMENT [${country}]: ${riskInfo}` };
      } 
      
      // TOOL: SHELTERS
      else if (call.name === 'find_shelters') {
        const { country, state } = (call.args as any);
        const targetBasin = (country?.toLowerCase().includes('usa')) ? 'na' : 'ni';
        const data = getSimulationData(targetBasin);
        const shelter = data.shelters[0]; // Mock nearest
        functionResponse = { result: `SHELTER OPS [${state}]: Nearest hardened facility is '${shelter.name}' (${shelter.type}). Capacity: ${shelter.occupied}/${shelter.capacity}.` };
      }

      // TOOL: ALERT
      else if (call.name === 'generate_alert') {
         functionResponse = { result: "ALERT GENERATED: 'URGENT: CAT 4 STORM SURGE IMMINENT. EVACUATE ZONE A IMMEDIATELY.' (Broadcast sent to towers)" };
      }

      addLog({
        endpoint: 'Gemini 3 Pro Tool',
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime,
        details: `Tool Executed: ${call.name}`
      });

      // Send function response back
      const finalRes = await chat.sendMessage({
         message: [{
             functionResponse: {
                name: call.name,
                response: functionResponse
             }
         }]
      });
      
      return { text: finalRes.text || "Command executed.", newHistory: await chat.getHistory(), action };
    }
    
    addLog({
      endpoint: 'Gemini 3 Pro Chat',
      status: 'SUCCESS',
      latencyMs: Date.now() - startTime,
      details: `processed message`
    });

    return { text: result.text || "I copy.", newHistory: await chat.getHistory() };

  } catch (error) {
    addLog({
      endpoint: 'Gemini 3 Pro',
      status: 'FAILURE',
      latencyMs: Date.now() - startTime,
      details: `Agent Error: ${(error as any).message}`
    });
    console.error("Agent Error:", error);
    return { text: "Connection to Shield Core interrupted.", newHistory: chatHistory };
  }
};
