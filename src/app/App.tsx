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

  const handleGenerate = async () => {
    if (!prompt.trim() || !apiKey.trim()) {
      setError('Please enter a prompt and your Gemini API key.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedCode('');

    try {
      // 1. Initialize the Google AI client with the user's key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 2. Create a detailed prompt for the Gemini model
    const generationPrompt = `
    You are an expert web developer. Your primary goal is to generate JSON code for a single-page website based on a user's request.

    // --- Forceful first instruction ---
    Your FIRST AND MOST IMPORTANT task is to analyze the user's request to determine if it is a valid request to build a website.

    // --- The "IF NOT" condition ---
    If the user's request is NOT about designing or building a website, app, or webpage, you MUST STOP. Ignore all other instructions and return only the following JSON object and nothing else:
    \`\`\`json
    {
        "error": "The provided prompt is not related to website development."
    }
    \`\`\`

    // --- The "IF YES" condition ---
    ONLY if the request IS a valid request to build a website should you proceed. In that case, you will return a single JSON object with the following keys:
    - "title": A creative string for the website's <title> tag.
    - "html": A string containing the HTML content for the <body> tag.
    - "css": A string containing all necessary CSS code.
    - "javascript": A string containing any necessary JavaScript.

    // --- Explicit negative constraint ---
    Under no circumstances should you create a website based on an off-topic request (e.g., if the user asks for a recipe, do not create a recipe website). Your only job in that case is to return the error JSON.

    **User's Request:**
    "${prompt}"
    `;
      
      // 3. Call the API
      const result = await model.generateContent(generationPrompt);
      const textResponse = result.response.text();

      // 4. Parse the JSON response from the model
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("The AI response was not in the expected JSON format.");
      }

      const parsedValue = JSON.parse(jsonMatch[1]);
      if (parsedValue.error) {
        throw new Error(parsedValue.error);
        console.log("This is not a valid prompt");
      }

    //   if()
      
      const parsedResponse = JSON.parse(jsonMatch[1]);
      const { title, html, css, javascript } = parsedResponse;

      // 5. Assemble the final HTML document
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  //Function to open the preview in a new tab
  const handleFullScreenPreview = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

             {/* API Key Input */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
             {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Describe Your Website</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Enter your prompt and API key to create a beautiful one page website.
                    </p>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="e.g., 'A modern SaaS landing page with a gradient hero, three feature cards, and a newsletter signup form...'"
                        className="flex-1 w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || !apiKey.trim() || isGenerating}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:from-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Working on it...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-5 w-5" />
                                    <span>Generate with AI</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-emerald-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                    </div>
                    
                    {/* --- NEW --- Button to open preview in a new tab */}
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
                        {isGenerating ? (
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