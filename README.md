# Clean Cell - AI-Powered Resource Allocation Configurator

> Transform messy spreadsheets into clean, validated data with AI-powered insights and intelligent rule creation.

## 🚀 **Live Demo**
- **Deployed Application**: [Coming Soon - Deploy to Vercel]
- **GitHub Repository**: [Your GitHub Link Here]
- **Demo Video**: [Optional - Your Loom/YouTube Link]

## 📋 **Assignment Completion**

### ✅ **Milestone 1 - COMPLETED**
- **Data Ingestion**: CSV/XLSX upload for clients, workers, tasks
- **AI-Enhanced Parsing**: Smart column mapping and data type detection
- **Validation System**: 12+ comprehensive validation rules
- **Real-time Feedback**: Immediate validation on data changes
- **Natural Language Search**: AI-powered data retrieval

### ✅ **Milestone 2 - COMPLETED**
- **Rule Builder UI**: 6 rule types with intuitive interface
- **AI Rule Generation**: Natural language to rules conversion
- **Prioritization System**: Weight-based criteria configuration
- **Export Functionality**: Clean data + rules.json export

### ✅ **Milestone 3 - COMPLETED (Stretch Goals)**
- **AI Error Correction**: Smart suggestions with auto-fix capability
- **Rule Recommendations**: Pattern-based rule suggestions
- **Advanced Validation**: AI-powered quality checks

## 🛠 **Tech Stack**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + useReducer
- **File Processing**: Custom CSV/XLSX parsers
- **AI Features**: Simulated AI processing with realistic workflows


## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
\`\`\`bash
# Clone the repository
git clone [https://github.com/shubhamrathod0015/Clean-Cell.git]
cd data-alchemist

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

### Using Sample Data
1. Navigate to the "Data Upload" tab
2. Upload the provided sample files from `/samples/`:
   - `clients.csv` (50 clients with realistic data)
   - `workers.csv` (30 workers with diverse skills)
   - `tasks.csv` (50 tasks with requirements)

## 📊 **Key Features**

### **AI-Powered Data Processing**
- **Smart Column Mapping**: Handles misnamed or reordered columns
- **Intelligent Validation**: 12+ validation rules with contextual feedback
- **Error Correction**: AI suggests and applies data quality fixes
- **Natural Language Search**: Query data using plain English

### **Business Rules Engine**
- **6 Rule Types**: Co-run, slot restriction, load limit, phase window, pattern match, precedence
- **Visual Rule Builder**: Intuitive drag-and-drop interface
- **AI Rule Generation**: Convert natural language to structured rules
- **Rule Management**: Enable/disable, edit, delete rules

### **Advanced Validation System**
1. **Missing Required Fields** - Detects empty critical data
2. **Duplicate IDs** - Finds duplicate identifiers
3. **Malformed Data** - Validates arrays, JSON, data types
4. **Range Validation** - Ensures values within acceptable ranges
5. **Cross-References** - Validates relationships between entities
6. **Skill Coverage** - Ensures required skills are available
7. **Capacity Checks** - Prevents worker overload
8. **JSON Validation** - Detects malformed JSON vs plain text
9. **Invalid References** - Catches non-existent task IDs (TX, T99, etc.)
10. **Phase Validation** - Validates phase number ranges
11. **Load Distribution** - Checks worker capacity vs assignments
12. **Pattern Recognition** - AI-powered anomaly detection

### **Prioritization & Export**
- **Weight Configuration**: Slider-based priority adjustment
- **Preset Profiles**: Quick configuration templates
- **Clean Data Export**: Validated CSV files
- **Rules Configuration**: Structured JSON export
- **Progress Tracking**: Real-time export progress

## 🧪 **Testing the Application**

### **Complete Workflow Test**
1. **Upload Data**: Use sample CSV files from `/samples/`
2. **Review Validation**: Check validation summary for detected issues
3. **Edit Data**: Try inline editing in the data grid
4. **Search Data**: Use natural language queries
5. **Create Rules**: Build rules manually or with AI
6. **Set Priorities**: Configure weight distribution
7. **Export Package**: Download clean data and rules

### **AI Features Test**
- **Error Correction**: Generate AI suggestions for data quality issues
- **Natural Language Search**: Try queries like "High priority clients"
- **Rule Generation**: Convert plain English to structured rules
- **Smart Validation**: See contextual error messages and suggestions

## 📁 **Project Structure**
\`\`\`
data-alchemist/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── data-ingestion.tsx
│   ├── data-grid.tsx
│   ├── rule-builder.tsx
│   ├── prioritization-panel.tsx
│   └── ai-error-correction.tsx
├── contexts/              # React context providers
├── lib/                   # Utility functions
│   ├── file-parser.ts
│   └── validators.ts
├── samples/               # Sample data files
│   ├── clients.csv
│   ├── workers.csv
│   └── tasks.csv
└── README.md
\`\`\`

## 🎯 **Assignment Requirements Met**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Data Ingestion** | ✅ | CSV/XLSX upload with AI parsing |
| **Validation (12+)** | ✅ | Comprehensive validation suite |
| **Inline Editing** | ✅ | Real-time editable data grid |
| **Natural Language Search** | ✅ | AI-powered query processing |
| **Rule Builder UI** | ✅ | 6 rule types with intuitive interface |
| **AI Rule Generation** | ✅ | Natural language to rules conversion |
| **Prioritization** | ✅ | Weight-based configuration system |
| **Export Functionality** | ✅ | Clean data + rules.json export |
| **AI Error Correction** | ✅ | Smart suggestions with auto-fix |
| **TypeScript** | ✅ | Fully typed codebase |
| **Sample Data** | ✅ | Realistic data with edge cases |

## 🌟 **X-Factor Features**

### **AI Error Correction Engine**
- Automatically detects data quality issues
- Provides actionable fix suggestions with confidence scores
- One-click auto-fix for common problems
- Pattern recognition for optimization opportunities

### **Natural Language Processing**
- Search data using plain English queries
- Convert natural language to structured business rules
- Contextual understanding of data relationships
- Smart query suggestions and examples

### **Advanced Validation Intelligence**
- Goes beyond basic field validation
- Cross-reference validation between entities
- Skill-coverage matrix analysis
- Capacity and load distribution checks

## 🚀 **Deployment**

### **Vercel Deployment**
\`\`\`bash
# Deploy to Vercel
npm run build
vercel --prod
\`\`\`

### **Environment Variables**
No environment variables required for basic functionality.

## 📝 **Assignment Submission**

- **GitHub Repository**: [Your Public Repo URL]
- **Live Deployment**: [Your Vercel URL]
- **Demo Video**: [Optional - Your Video URL]
- **Completion Status**: All milestones completed (100%)

## 🤝 **Contact**
- **Name**: [Shubham Rathod]
- **Email**: [shubhamrathod0015@gmail.com]
- **Phone**: [9370235900]
- **Graduation Year**: [2025]

---

**Built with ❤️ for Digitalyz Software Engineering Intern Assignment**
