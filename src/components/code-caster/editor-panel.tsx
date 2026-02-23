"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClipboardPaste, Play, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditorPanelProps {
  onProcess: (html: string) => void;
  isLoading: boolean;
}

export function EditorPanel({ onProcess, isLoading }: EditorPanelProps) {
  const [code, setCode] = useState<string>('');
  const { toast } = useToast();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
      toast({
        title: "Content Pasted",
        description: "Your HTML has been imported from the clipboard.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Paste Failed",
        description: "Could not access clipboard. Please paste manually.",
      });
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Input",
        description: "Please enter or paste some HTML code first.",
      });
      return;
    }
    onProcess(code);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="html-input" className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          HTML Injection
        </Label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePaste} className="flex items-center gap-2">
            <ClipboardPaste className="h-4 w-4" />
            Paste
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} className="flex items-center gap-2 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="relative flex-1">
        <Textarea
          id="html-input"
          className="h-full font-code text-sm resize-none bg-white shadow-inner focus-visible:ring-primary border-2 border-border p-4 leading-relaxed"
          placeholder="<!DOCTYPE html>&#10;<html lang='es'>&#10;<head>&#10;  <title>Your Page</title>&#10;</head>&#10;<body>&#10;  <h1>Hello World</h1>&#10;</body>&#10;</html>"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <Button 
        className="w-full h-12 text-lg font-semibold shadow-md transition-all active:scale-95" 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Wand2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Play className="h-5 w-5 mr-2 fill-current" />
        )}
        {isLoading ? "Analyzing..." : "Analyze & Preview"}
      </Button>
    </div>
  );
}

// Minimal missing icon helper
function Code2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}