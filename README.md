# Clonable - AI Site Generator

### Instantly generate single-page websites from a simple text prompt using the power of the Google Gemini API.



## About The Project

Clonable is a web application that bridges the gap between idea and prototype. It allows designers, developers, and creators to quickly visualize website concepts by simply describing them in plain English. This tool leverages the advanced capabilities of the Gemini 1.5 Flash model to generate the complete HTML, CSS, and JavaScript for a modern, responsive webpage on the fly.

This project was built to demonstrate the power of LLMs in front-end development and to provide a useful tool for rapid prototyping.

---
## Key Features

* **✨ AI-Powered Generation:** Describe your desired website in a text prompt, and the AI will generate the full code.
* **🖥️ Live Preview:** Instantly see the generated website rendered in a sandboxed `<iframe>`.
* **🔗 Full-Screen Testing:** Open the complete, functional website in a new tab for a clean, full-screen preview and testing experience.
* **🧠 Smart Prompt Handling:** The AI can detect and reject off-topic prompts that are not related to website development, saving API costs and improving reliability.
* **🔐 Secure API Key Usage:** Your Google Gemini API key is handled client-side and is only used to make direct requests to the Google API.

---
## Built With

This project is built with a modern, type-safe technology stack.

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Google Gemini API** (`gemini-1.5-flash`)
* **Lucide React** (for icons)

---
## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have `npm` (which comes with Node.js) installed on your machine.
* [Install Node.js](https://nodejs.org/)

### Installation

1.  **Navigate to the project directory**
    Once you have the project files, open a terminal in the root folder.
    ```sh
    cd your-repo-name
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Get your API Key**
    You need a Google Gemini API key. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

1.  **Start the development server**
    ```sh
    npm run dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---
## Usage

1.  Paste your Google Gemini API Key into the input field in the header.
2.  In the main text area, describe the website you want to create in as much detail as possible.
3.  Click the "Generate with AI" button.
4.  View the result in the live preview panel or click "Open in New Tab" to test the site in a full-screen environment.
