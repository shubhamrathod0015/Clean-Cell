"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Table, GanttChart, Sliders, Download, Gem } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6">
          {/* Header - Complete redesign */}
          <div className="text-center mb-10">
            <div className="flex flex-col items-center justify-center mb-5">
              <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-3 rounded-2xl w-fit mb-4">
                <Gem className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Clean Cell
                </span> Studio
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
              Transform raw data into optimized resource plans with AI-powered validation
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  AI Assistant
                </span>
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                One-Click Fixes
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Smart Rules
              </Badge>
            </div>
          </div>

          {/* Main Interface - Redesigned layout */}
          <div className="bg-white dark:bg-gray-850 rounded-xl shadow-lg p-1 border border-gray-200 dark:border-gray-700">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="flex w-full p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TabsTrigger 
                  value="ingestion" 
                  className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:dark:bg-gray-750"
                >
                  <Upload className="h-5 w-5" />
                  <span>Import</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:dark:bg-gray-750"
                >
                  <Table className="h-5 w-5" />
                  <span>Data Editor</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="rules" 
                  className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:dark:bg-gray-750"
                >
                  <GanttChart className="h-5 w-5" />
                  <span>Rules</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="priorities" 
                  className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:dark:bg-gray-750"
                >
                  <Sliders className="h-5 w-5" />
                  <span>Priorities</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="export" 
                  className="flex-1 flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:dark:bg-gray-750"
                >
                  <Download className="h-5 w-5" />
                  <span>Export</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Sections */}
              <div className="px-4 pb-4">
                <TabsContent value="ingestion" className="space-y-6 pt-2">
                  <DataIngestion />
                </TabsContent>

                <TabsContent value="data" className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                      <DataGrid />
                    </div>
                    <div className="lg:col-span-2 space-y-5">
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl">
                        <NaturalLanguageSearch />
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <ValidationSummary />
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-xl">
                        <AIErrorCorrection />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-6 pt-2">
                  <RuleBuilder />
                </TabsContent>

                <TabsContent value="priorities" className="space-y-6 pt-2">
                  <PrioritizationPanel />
                </TabsContent>

                <TabsContent value="export" className="space-y-6 pt-2">
                  <ExportPanel />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Clean Cell Studio • AI-powered data optimization for resource allocation
          </div>
        </div>
      </div>
    </DataProvider>
  )
}