"use client";

import React, { useState } from 'react';
import { EditorPanel } from '@/components/code-caster/editor-panel';
import { PreviewIframe } from '@/components/code-caster/preview-iframe';
import { FrameworkRecommendations } from '@/components/code-caster/framework-recommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { Layout, Monitor, Sparkles, Wand2 } from 'lucide-react';
import { analyzeHtmlAndRecommendFrameworks, type AnalyzeHtmlOutput } from '@/ai/flows/analyze-html-recommend-frameworks';

export default function CodeCasterPage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [recommendations, setRecommendations] = useState<AnalyzeHtmlOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  const handleProcess = async (html: string) => {
    setHtmlContent(html);
    setIsAnalyzing(true);
    setActiveTab('preview'); // Show preview immediately
    
    try {
      const result = await analyzeHtmlAndRecommendFrameworks({ htmlContent: html });
      setRecommendations(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Layout className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">
            Code Caster
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Monitor className="h-4 w-4" /> Live Preview</span>
          <span className="flex items-center gap-1"><Sparkles className="h-4 w-4" /> AI Recommendations</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Side: Editor */}
        <section className="flex flex-col h-full min-h-[400px]">
          <EditorPanel onProcess={handleProcess} isLoading={isAnalyzing} />
        </section>

        {/* Right Side: Output */}
        <section className="flex flex-col h-full bg-white/50 rounded-xl border border-border p-2 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between px-2 py-1">
              <TabsList className="grid grid-cols-2 w-[300px] h-9">
                <TabsTrigger value="preview" className="text-xs uppercase tracking-wider font-semibold">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                  AI Suggestions
                  {isAnalyzing && <Wand2 className="h-3 w-3 animate-spin" />}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 mt-2 overflow-hidden">
              <TabsContent value="preview" className="h-full m-0 p-0 focus-visible:ring-0">
                {htmlContent ? (
                  <PreviewIframe html={htmlContent} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-white/30">
                    <Monitor className="h-12 w-12 mb-4 opacity-10" />
                    <p className="text-lg font-medium">Preview Area</p>
                    <p className="text-sm">Paste your code to see it rendered safely.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="h-full m-0 focus-visible:ring-0 overflow-y-auto pr-2 custom-scrollbar">
                <FrameworkRecommendations data={recommendations} loading={isAnalyzing} />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </main>

      <Toaster />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}