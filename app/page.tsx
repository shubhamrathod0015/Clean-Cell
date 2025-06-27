"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Database, Settings, Download, Sparkles } from "lucide-react"
import DataIngestion from "@/components/data-ingestion"
import DataGrid from "@/components/data-grid"
import RuleBuilder from "@/components/rule-builder"
import PrioritizationPanel from "@/components/prioritization-panel"
import ValidationSummary from "@/components/validation-summary"
import NaturalLanguageSearch from "@/components/natural-language-search"
import ExportPanel from "@/components/export-panel"
import { DataProvider } from "@/contexts/data-context"
import AIErrorCorrection from "@/components/ai-error-correction"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ingestion")

  return (
    <DataProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-indigo-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Data Alchemist
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your messy spreadsheets into clean, validated data with AI-powered insights and intelligent rule
              creation
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="secondary">Real-time Validation</Badge>
              <Badge variant="secondary">Natural Language</Badge>
            </div>
          </div>

          {/* Main Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ingestion" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Data Upload
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Grid
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="priorities" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Priorities
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ingestion" className="space-y-6">
              <DataIngestion />
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <DataGrid />
                </div>
                <div className="space-y-4">
                  <ValidationSummary />
                  <NaturalLanguageSearch />
                  <AIErrorCorrection />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <RuleBuilder />
            </TabsContent>

            <TabsContent value="priorities" className="space-y-6">
              <PrioritizationPanel />
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <ExportPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DataProvider>
  )
}
