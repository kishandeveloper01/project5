import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  BookmarkPlus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Eye,
  FileCheck,
} from 'lucide-react';
import { api } from '../api';
import { FamilyMember, MedicalReport, ReportValueItem } from '../types';

interface ReportAnalysisViewProps {
  familyMembers: FamilyMember[];
  activeMember: FamilyMember | null;
  onSelectMember: (member: FamilyMember) => void;
  savedReports: MedicalReport[];
  onReportSaved: (newReport: MedicalReport) => void;
  selectedHistoricalReport?: MedicalReport | null;
}

export const ReportAnalysisView: React.FC<ReportAnalysisViewProps> = ({
  familyMembers,
  activeMember,
  onSelectMember,
  savedReports,
  onReportSaved,
  selectedHistoricalReport,
}) => {
  const currentMember = activeMember || familyMembers[0];

  const [reportType, setReportType] = useState('Lipid Profile');
  const [reportText, setReportText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalReport | null>(selectedHistoricalReport || null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pre-configured hackathon sample reports
  const sampleReports = [
    {
      id: 'sample-lipid',
      title: 'Lipid Profile (Father - Rajesh Sharma)',
      type: 'Lipid Profile',
      memberId: familyMembers.find((m) => m.relationship === 'Father')?.id || currentMember.id,
      text: `PATIENT: Rajesh Sharma, Age: 58, Gender: Male
TEST: Fasting Lipid Profile
Total Cholesterol: 215 mg/dL (Reference: < 200 mg/dL)
HDL Cholesterol: 52 mg/dL (Reference: > 40 mg/dL)
LDL Cholesterol: 138 mg/dL (Reference: < 100 mg/dL)
Triglycerides: 165 mg/dL (Reference: < 150 mg/dL)
VLDL: 25 mg/dL (Reference: < 30 mg/dL)
Notes: Patient on Metformin for T2D. Fasting for 12 hours prior to draw.`,
    },
    {
      id: 'sample-cbc',
      title: 'Complete Blood Count (CBC) (Kartik)',
      type: 'CBC (Complete Blood Count)',
      memberId: familyMembers.find((m) => m.relationship === 'Self')?.id || currentMember.id,
      text: `PATIENT: Kartik Sharma, Age: 26, Gender: Male
TEST: Complete Blood Count (CBC)
Hemoglobin: 15.2 g/dL (Reference: 13.5 - 17.5 g/dL)
RBC Count: 5.1 mill/uL (Reference: 4.5 - 5.9 mill/uL)
Total WBC Count: 6,800 /uL (Reference: 4,000 - 11,000 /uL)
Platelet Count: 240,000 /uL (Reference: 150,000 - 450,000 /uL)
Hematocrit: 45.1 % (Reference: 41 - 50 %)
Mean Corpuscular Volume (MCV): 88.5 fL (Reference: 80 - 100 fL)
Absolute Neutrophil Count: 4,200 /uL (Reference: 2,000 - 7,000 /uL)`,
    },
    {
      id: 'sample-thyroid',
      title: 'Thyroid & Vitamin D3 (Mother - Sunita)',
      type: 'Thyroid & Vitamin Panel',
      memberId: familyMembers.find((m) => m.relationship === 'Mother')?.id || currentMember.id,
      text: `PATIENT: Sunita Sharma, Age: 54, Gender: Female
TEST: Endocrine & Metabolic Evaluation
TSH (Thyroid Stimulating Hormone): 2.4 uIU/mL (Reference: 0.4 - 4.2 uIU/mL)
Free T4: 1.2 ng/dL (Reference: 0.8 - 1.8 ng/dL)
25-Hydroxy Vitamin D3: 18.4 ng/mL (Reference: 30 - 100 ng/mL)
Vitamin B12: 385 pg/mL (Reference: 200 - 900 pg/mL)
Serum Calcium: 9.2 mg/dL (Reference: 8.5 - 10.2 mg/dL)`,
    },
    {
      id: 'sample-metabolic',
      title: 'Diabetic Blood Sugar & HbA1c Panel',
      type: 'Blood Sugar & Metabolic',
      memberId: familyMembers.find((m) => m.relationship === 'Father')?.id || currentMember.id,
      text: `PATIENT: Rajesh Sharma, Age: 58, Gender: Male
TEST: Glycemic & Renal Function
Fasting Blood Sugar (Glucose): 132 mg/dL (Reference: 70 - 99 mg/dL)
Post-Prandial Glucose (2 hr): 188 mg/dL (Reference: < 140 mg/dL)
HbA1c (Glycated Hemoglobin): 7.1 % (Reference: < 5.7 %, Target for Diabetics: < 7.0 %)
Serum Creatinine: 0.95 mg/dL (Reference: 0.7 - 1.3 mg/dL)
Estimated GFR: > 90 mL/min/1.73m2`,
    },
  ];

  const handleSelectSample = (sample: typeof sampleReports[0]) => {
    setReportType(sample.type);
    setReportText(sample.text);
    setSelectedFileName(null);
    setImageBase64(null);
    setImageMimeType(null);
    const targetMember = familyMembers.find((m) => m.id === sample.memberId);
    if (targetMember) onSelectMember(targetMember);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isBinaryAiDocument = file.type.startsWith('image/') || isPdf;
    if (isBinaryAiDocument) {
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setImageBase64(result);
        setImageMimeType(isPdf ? 'application/pdf' : file.type);
        setReportText('');
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      reader.onload = (uploadEvent) => {
        const text = uploadEvent.target?.result as string;
        setReportText(text || '');
        setImageBase64(null);
        setImageMimeType(null);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a PDF, image, or plain-text report.');
      setSelectedFileName(null);
    }
  };

  const handleAnalyze = async () => {
    if (!currentMember) {
      alert('Please add/select a family member before analyzing a report.');
      return;
    }
    if (!reportText.trim() && !imageBase64) {
      alert('Please enter or select report text or upload a medical report document.');
      return;
    }

    setIsAnalyzing(true);
    setSaveSuccess(false);

    try {
      const response = await api.analyzeReport({
        reportType,
        reportText,
        imageBase64: imageBase64 || undefined,
        imageMimeType: imageMimeType || undefined,
        memberId: currentMember.id,
      });

      const fullReport: MedicalReport = {
        ...response,
        id: `rep-${Date.now()}`,
        userId: currentMember.userId,
        memberId: currentMember.id,
        memberName: currentMember.name,
        reportType,
        title: `${reportType} Analysis`,
        date: new Date().toISOString().split('T')[0],
        laboratory: 'Verified Lab Diagnostics',
      };

      setAnalysisResult(fullReport);
    } catch (err: any) {
      console.error(err);
      alert('Report analysis encountered an issue: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToRecords = async () => {
    if (!analysisResult) return;
    try {
      const saved = await api.saveRecord(analysisResult);
      onReportSaved(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert('Failed to save to health records: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Gemini Medical Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI Medical Report Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Translate complex lab test values into plain language summaries, risk awareness, and questions for your doctor.
          </p>
        </div>

        {/* Family Member Context Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Analyzing for:</span>
          <select
            value={currentMember?.id}
            onChange={(e) => {
              const m = familyMembers.find((item) => item.id === e.target.value);
              if (m) onSelectMember(m);
            }}
            className="text-xs font-bold text-slate-800 bg-transparent outline-hidden cursor-pointer"
          >
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Upload */}
        <div className="lg:col-span-6 space-y-4">
          {/* Quick Demo Preloaded Sample Reports Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Mode: 1-Click Sample Lab Reports</span>
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleReports.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="px-3 py-2 rounded-xl text-left bg-white border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-emerald-800 truncate">
                    {sample.title}
                  </div>
                  <div className="text-[10px] text-slate-400">{sample.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
                >
                  <option value="Lipid Profile">Lipid Profile & Cholesterol</option>
                  <option value="CBC (Complete Blood Count)">Complete Blood Count (CBC)</option>
                  <option value="Blood Sugar & Metabolic">Blood Sugar & HbA1c Panel</option>
                  <option value="Thyroid & Vitamin Panel">Thyroid Function & Vitamins</option>
                  <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                  <option value="Kidney Function Test (KFT)">Kidney Function Test (KFT)</option>
                  <option value="Cardiac Biomarkers">Cardiac Biomarkers</option>
                  <option value="General Lab Report">General Laboratory Panel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload PDF / Lab Image
                </label>
                <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-medium text-slate-600 cursor-pointer transition-colors truncate">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">
                    {selectedFileName || 'Browse file or image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Text / Laboratory Values
              </label>
              <textarea
                rows={6}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Paste the lab test results, reference intervals, or doctor notes here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden resize-none"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Healthyfy AI is analyzing your report with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Report with Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Historical Saved Reports Sidebar */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Recent Family Reports ({savedReports.length})
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Stored in Health Records</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {savedReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setAnalysisResult(report)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  analysisResult?.id === report.id
                    ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-500/20'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {report.title}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {report.date}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-emerald-700">{report.memberName}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Eye className="w-3 h-3" />
                    <span>View Analysis</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analysisResult && (
        <div className="space-y-6 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-5 rounded-2xl shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Clinical Report Evaluation</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">
                {analysisResult.title} — {analysisResult.memberName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToRecords}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{saveSuccess ? 'Saved to Records ✓' : 'Save to Family Records'}</span>
              </button>
            </div>
          </div>

          {/* Urgent Emergency Warning if Present */}
          {analysisResult.isUrgent && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-xs text-rose-900 leading-relaxed shadow-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-rose-800 mb-0.5">
                  Immediate Emergency Warning
                </strong>
                {analysisResult.emergencyWarning ||
                  'The uploaded values indicate potentially urgent clinical markers. We strongly urge you to seek immediate professional medical attention at the nearest emergency department.'}
              </div>
            </div>
          )}

          {/* Report Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Report Summary</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {analysisResult.summary}
            </p>
          </div>

          {/* Important Values Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Evaluated Test Values & Reference Ranges
              </h3>
              <span className="text-[11px] text-slate-500">{analysisResult.values.length} parameters</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Test Name</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Reference Range</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5">Clinical Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysisResult.values.map((item: ReportValueItem, idx: number) => {
                    const isWithin = item.status === 'Within range';
                    const isHigher = item.status === 'Higher than reference range';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-800">{item.testName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                          {item.result} {item.unit || ''}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono tabular-nums">
                          {item.referenceRange}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isWithin
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                : isHigher
                                ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                                : 'bg-blue-50 text-blue-800 border border-blue-200/80'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-600 leading-normal">
                          {item.clinicalSignificance || 'Standard baseline parameter.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Explanation & What It May Indicate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* AI Explanation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Clinical Explanation</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysisResult.aiExplanation}
              </p>
            </div>

            {/* What it May Indicate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>What It May Indicate (Educational Possibilities)</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {analysisResult.possibleIndications.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Questions for Doctor & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Questions to ask doctor */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Suggested Questions for Your Doctor</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.suggestedQuestions.map((q, i) => (
                  <li key={i} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed flex items-start gap-2">
                    <span className="font-bold text-teal-700 shrink-0">Q{i + 1}:</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Next Steps */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Suggested Practical Next Steps</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.nextSteps.map((step, i) => (
                  <li key={i} className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl leading-relaxed flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prominent Medical Disclaimer */}
          <div className="p-4 bg-slate-100/90 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="leading-relaxed">
              <strong>Medical Disclaimer:</strong> {analysisResult.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
