"use client";

import React, { useState } from 'react';
import { Code, Sparkles, Eye, Loader2, Zap, Key, ExternalLink } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- State for Planning Phase ---
  const [usePlan, setUsePlan] = useState(true); // Default to true
  const [plan, setPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [currentState, setCurrentState] = useState("Prompt"); // "Prompt" or "Plan"

  const handleGenerate = async () => {
    if ((currentState === "Prompt" && !prompt.trim()) || !apiKey.trim()) {
      setError('Please enter a prompt and your Gemini API key.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    if (currentState === "Prompt") {
        setGeneratedCode('');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // --- STEP 1: GENERATE PLAN (if enabled) ---
      if (usePlan && currentState === "Prompt") {
        setPlanLoading(true);
        const planningPrompt = `

        You are a Solutions Architect for a web development agency. Your task is to take a user's request and break it down into a structured, hierarchical plan for a single-page website.

        If the request is NOT about designing a website, app, or webpage, you MUST STOP and return only this text:
        "error": "The provided prompt is not related to website development."

        If it IS a valid request, create a human-readable plan using Markdown formatting. The plan should be organized into the following sections, separated by horizontal lines:

        Overall Theme: A main heading for the theme. Under it, use a bulleted list to describe the Color Palette, Font, and Overall Look.

        Website Layout: A main heading for the layout. Under it, use a numbered list to show the exact order of the main sections (e.g., 1. Header, 2. Hero, 3. Features, 4. Footer).

        Component Breakdown: A main heading for the components. Under it, create a subheading for each section from the Website Layout list. For each component, provide a Description and a bulleted list of its key Elements.

        Use bolding for labels to make the document easy to scan.

        User's Request:
        "${prompt}"

        Return the text output in a formated form with paragaphs and proper punctuation.
        `;
        
        const result = await model.generateContent(planningPrompt);
        const textResponse = result.response.text();
        // const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);

        // if (!jsonMatch || !jsonMatch[1]) {
        //     throw new Error("The AI did not return a valid plan in JSON format.");
        // }
        
        // const parsedPlan = JSON.parse(jsonMatch[1]);
        // if (parsedPlan.error) {
        //     throw new Error(parsedPlan.error);
        // }

        setPlan(textResponse);
        setCurrentState("Plan");
        setPlanLoading(false);
        setIsGenerating(false);
        return; // Stop to allow user editing
      }

      // --- STEP 2: GENERATE CODE (from plan or prompt) ---
      let finalGenerationPrompt = '';

      if (usePlan && currentState === "Plan") {
        finalGenerationPrompt = `
        You are an expert web developer. Your task is to generate a complete, single-page website as a single JSON object based on the provided website plan.
        The final JSON object must have these keys: "title", "html", "css", and "javascript".
        For any images use https://placehold.co/WIDTHxHEIGHT with the width and height value filled out.
        
        **Website Plan:**
        \`\`\`json
        ${plan} 
        \`\`\`
        `;
      } else {
        finalGenerationPrompt = `
        You are an expert web developer. Your primary goal is to generate JSON code for a single-page website based on a user's request.
        // ... (rest of your original prompt instructions)
        ONLY if the request IS a valid request to build a website should you proceed. In that case, you will return a single JSON object with the following keys:
        - "title": A creative string for the website's <title> tag.
        - "html": A string containing the HTML content for the <body> tag. For any images use https://placehold.co/WIDTHxHEIGHT with the width and height value filled out.
        - "css": A string containing all necessary CSS code.
        - "javascript": A string containing any necessary JavaScript.

        **User's Request:**
        "${prompt}"
        `;
      }
      
      const result = await model.generateContent(finalGenerationPrompt);
      const textResponse = result.response.text();

      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("The AI response was not in the expected JSON format.");
      }

      const parsedValue = JSON.parse(jsonMatch[1]);
      if (parsedValue.error) {
        throw new Error(parsedValue.error);
      }
      
      const { title, html, css, javascript } = parsedValue;

      const completeHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${javascript}</script>
        </body>
        </html>`;
      
      setGeneratedCode(completeHTML);
      setCurrentState("Prompt"); // Reset for the next run

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      setCurrentState("Prompt"); // Reset on error
    } finally {
      setIsGenerating(false);
      setPlanLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  const handleFullScreenPreview = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Clonable an AI Site Generator</h1>
                <p className="text-sm text-gray-600">Using Gemini APIs</p>
              </div>
            </div>
            <div className="relative w-full max-w-sm">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API Key..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {currentState === "Prompt" ? "Describe Your Website" : "Review & Edit the Plan"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {currentState === "Prompt" 
                          ? "Enter your prompt and API key to create a beautiful one page website."
                          : "Edit the JSON plan below, then generate the final site."}
                    </p>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                    <textarea
                        value={currentState === 'Prompt' ? prompt : plan}
                        onChange={(e) => {
                            if (currentState === 'Prompt') {
                                setPrompt(e.target.value);
                            } else {
                                setPlan(e.target.value);
                            }
                        }}
                        onKeyDown={handleKeyPress}
                        placeholder={
                            currentState === 'Prompt' 
                            ? "e.g., 'A modern SaaS landing page with a gradient hero, three feature cards, and a newsletter signup form...'" 
                            : "You can now edit the generated plan..."
                        }
                        className="flex-1 w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-200">
                        <div className="flex flex-col">
                            <label htmlFor="planning-toggle" className="text-sm font-medium text-gray-900">
                                 Use AI Planning Phase: 
                            </label>
                            <p className="text-s text-gray-500">Get a more accurate site with a 2-step process.</p>
                        </div>
                        <button
                            type="button" id="planning-toggle" onClick={() => setUsePlan(!usePlan)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${usePlan ? 'bg-blue-600' : 'bg-gray-200'}`}
                            role="switch" aria-checked={usePlan}
                        >
                            <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${usePlan ? 'translate-x-5' : 'translate-x-0'}`}/>
                        </button>
                    </div>
                     {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={!apiKey.trim() || isGenerating || planLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:from-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                        >
                            {isGenerating || planLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>{planLoading ? 'Creating Plan...' : 'Working on it...'}</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-5 w-5" />
                                    <span>{usePlan && currentState === 'Prompt' ? 'Generate Plan' : 'Generate with AI'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-emerald-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                    </div>
                    <button
                      onClick={handleFullScreenPreview}
                      disabled={!generatedCode}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Open preview in a new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open in New Tab</span>
                    </button>
                </div>
                <div className="flex-1 p-6">
                    <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-200 relative overflow-hidden">
                        {isGenerating || planLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                                    <p className="font-medium">AI is crafting your website...</p>
                                </div>
                            </div>
                        ) : generatedCode ? (
                            <iframe
                                srcDoc={generatedCode}
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-same-origin"
                                title="Generated Website Preview"
                            />
                        ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <p>Preview will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
         </div>
      </main>
    </div>
  );
}

export default App;