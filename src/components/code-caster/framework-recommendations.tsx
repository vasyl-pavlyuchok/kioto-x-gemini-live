"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Layers, Code2 } from 'lucide-react';
import type { AnalyzeHtmlOutput } from '@/ai/flows/analyze-html-recommend-frameworks';

interface FrameworkRecommendationsProps {
  data: AnalyzeHtmlOutput | null;
  loading: boolean;
}

export function FrameworkRecommendations({ data, loading }: FrameworkRecommendationsProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || !data.recommendations || data.recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg p-8 text-center">
        <Sparkles className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">No recommendations yet</p>
        <p className="text-sm">Paste your HTML and click "Analyze & Preview" to see AI suggestions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {data.recommendations.map((rec, index) => (
        <Card key={index} className="overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rec.framework.toLowerCase().includes('grid') || rec.framework.toLowerCase().includes('flex') ? (
                  <Layers className="h-4 w-4 text-accent" />
                ) : (
                  <Code2 className="h-4 w-4 text-primary" />
                )}
                <CardTitle className="text-lg">{rec.framework}</CardTitle>
              </div>
              <Badge variant="secondary">Suggested</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rec.explanation}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}