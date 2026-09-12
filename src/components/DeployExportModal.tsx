import React, { useState } from 'react';
import { X, Code2, Download, Copy, Check, FileText, Globe } from 'lucide-react';
import { DAZZLE_DENTAL_SYSTEM_PROMPT, JWS_INTERIORS_SYSTEM_PROMPT } from '../data/prompts';

interface DeployExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployExportModal: React.FC<DeployExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github_workflow' | 'index_html' | 'standalone_html' | 'worker_js' | 'wrangler_toml' | 'readme'>('github_workflow');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const githubWorkflowContent = `name: Deploy Aria Demo to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build website with injected GitHub Secrets
        env:
          # =========================================================================
          # GITHUB SECRET PLACEHOLDER:
          # 1. In GitHub, go to: Settings -> Secrets and variables -> Actions
          # 2. Click "New repository secret"
          # 3. Name: GROQ_API_KEY
          # 4. Value: your Groq API key (starts with 'gsk_...')
          # =========================================================================
          VITE_GROQ_API_KEY: \${{ secrets.GROQ_API_KEY }}
          VITE_WORKER_URL: \${{ secrets.WORKER_URL }}
        run: npm run build

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aria — International Patient Concierge</title>
    <!-- 
      GITHUB SECRETS PLACEHOLDER:
      Set GROQ_API_KEY in GitHub Repository Settings -> Secrets and variables -> Actions.
      The GitHub Actions workflow will automatically inject VITE_GROQ_API_KEY into the build.
    -->
    <script>
      window.__GROQ_API_KEY__ = window.__GROQ_API_KEY__ || "";
      window.__WORKER_URL__ = window.__WORKER_URL__ || "";
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  const standaloneIndexHtml = `<!-- Standalone zero-build single-file HTML -->
<!-- Full file is available at /standalone.html in the repo -->
<script>
  // =========================================================================
  // GROQ API KEY PLACEHOLDER
  // =========================================================================
  const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";
  const DEMO_MODE = true;
</script>`;

  const workerJsContent = `// Cloudflare Worker Proxy (worker.js)
// Holds GROQ_API_KEY as an encrypted Cloudflare secret
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { messages, client } = await request.json();
      const apiKey = env.GROQ_API_KEY;

      const systemPrompt = \`${DAZZLE_DENTAL_SYSTEM_PROMPT.replace(/`/g, '\\`')}\`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.4,
          max_completion_tokens: 600
        })
      });

      const data = await groqRes.json();
      const reply = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ reply }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
};`;

  const wranglerTomlContent = `name = "dazzle-dental-concierge-proxy"
main = "worker.js"
compatibility_date = "2024-03-01"

# In production, set secrets via: wrangler secret put GROQ_API_KEY
`;

  const readmeContent = `# Dazzle Dental — "Aria" 24/7 International Patient Concierge

## Architecture
- **Frontend:** Single-file HTML/CSS/JS deployed to GitHub Pages.
- **Backend Proxy:** Cloudflare Worker protecting \`GROQ_API_KEY\`.
- **Inference Engine:** Groq LPU with \`openai/gpt-oss-120b\`.

## 1. Quick Deploy to GitHub Pages
1. Push \`index.html\` to your GitHub repository on \`main\` branch.
2. Go to **Settings** → **Pages** → Source: **Deploy from a branch** (\`main\` / root).

## 2. Deploy Cloudflare Worker Proxy
1. \`cd worker\`
2. \`npm install -g wrangler\`
3. \`wrangler secret put GROQ_API_KEY\` (paste your Groq Key)
4. \`wrangler deploy\`
5. Copy the deployed worker URL and set \`const WORKER_URL = "..."\` inside \`index.html\`.
6. Set \`const DEMO_MODE = false;\` in \`index.html\`.
`;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'github_workflow': return githubWorkflowContent;
      case 'index_html': return indexHtmlContent;
      case 'standalone_html': return standaloneIndexHtml;
      case 'worker_js': return workerJsContent;
      case 'wrangler_toml': return wranglerTomlContent;
      case 'readme': return readmeContent;
      default: return githubWorkflowContent;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filenameMap: Record<string, string> = {
      github_workflow: 'deploy.yml',
      index_html: 'index.html',
      standalone_html: 'standalone.html',
      worker_js: 'worker.js',
      wrangler_toml: 'wrangler.toml',
      readme: 'README.md'
    };
    const blob = new Blob([getActiveContent()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filenameMap[activeTab] || 'export.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#12151a] border border-[#242932] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#161a20] border-b border-[#242932] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#c9a84c]/10 text-[#c9a84c]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f3efe7]">Deploy Artifacts & Repository Files</h3>
              <p className="text-xs text-[#9aa0aa]">GitHub Actions workflow, index.html, & Cloudflare Worker ready for production</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#9aa0aa] hover:text-[#f3efe7] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0e1115] border-b border-[#242932] px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('github_workflow')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'github_workflow'
                ? 'border-[#c9a84c] text-[#f3e2a9]'
                : 'border-transparent text-[#9aa0aa] hover:text-[#f3efe7]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>deploy.yml (GitHub Secrets)</span>
          </button>
          <button
            onClick={() => setActiveTab('index_html')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'index_html'
                ? 'border-[#c9a84c] text-[#f3e2a9]'
                : 'border-transparent text-[#9aa0aa] hover:text-[#f3efe7]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>index.html</span>
          </button>
          <button
            onClick={() => setActiveTab('standalone_html')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'standalone_html'
                ? 'border-[#c9a84c] text-[#f3e2a9]'
                : 'border-transparent text-[#9aa0aa] hover:text-[#f3efe7]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>standalone.html</span>
          </button>
          <button
            onClick={() => setActiveTab('worker_js')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'worker_js'
                ? 'border-[#c9a84c] text-[#f3e2a9]'
                : 'border-transparent text-[#9aa0aa] hover:text-[#f3efe7]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>worker.js</span>
          </button>
          <button
            onClick={() => setActiveTab('wrangler_toml')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'wrangler_toml'
                ? 'border-[#c9a84c] text-[#f3e2a9]'
                : 'border-transparent text-[#9aa0aa] hover:text-[#f3efe7]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>wrangler.toml</span>
          </button>
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'readme'
                ? 'border-[#c9a84c] text-[#f3e2a9]'
                : 'border-transparent text-[#9aa0aa] hover:text-[#f3efe7]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>README.md</span>
          </button>
        </div>

        {/* Code Content View */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#0a0c0e]">
          <pre className="text-xs text-[#f3efe7]/90 font-mono leading-relaxed whitespace-pre-wrap select-all">
            {getActiveContent()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#161a20] border-t border-[#242932] flex justify-between items-center">
          <span className="text-xs text-[#9aa0aa]">
            Production ready with no external build step needed.
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#242932] hover:bg-[#323946] text-xs font-semibold text-[#f3efe7] rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy File'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#e3cd8d] to-[#c9a84c] text-[#12151a] text-xs font-bold rounded-lg hover:brightness-110 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
