import React from 'react';
import { Gavel, BookOpen, AlertCircle, FileText, Scale, Zap } from 'lucide-react';

interface AnalysisResultProps {
  result: {
    situation: string;
    ruleApplied: string;
    article: string;
    decision: string;
    penalty: string;
  };
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Header Section */}
      <div className="bg-black p-8 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Scale className="w-20 h-20 text-orange-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-600 p-2 rounded-xl">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Official Verdict</span>
          </div>
          <h3 className="text-3xl font-black leading-tight tracking-tight uppercase italic">{result.decision}</h3>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Situation */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Situation Analyzed</h4>
          </div>
          <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 italic text-gray-700 font-medium leading-relaxed">
            "{result.situation}"
          </div>
        </section>

        {/* Rule & Article Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-orange-600" />
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Rule Applied</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{result.ruleApplied}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Official Article</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{result.article}</p>
          </div>
        </div>

        {/* Penalty / Result */}
        <section className="bg-orange-600 p-8 rounded-[32px] shadow-lg shadow-orange-600/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-30">
            <Zap className="w-16 h-16 fill-current" />
          </div>
          <div className="relative z-10">
            <h4 className="text-xs font-black text-orange-200 uppercase tracking-widest mb-4">Penalty / Resulting Action</h4>
            <p className="text-2xl font-black leading-relaxed">{result.penalty}</p>
          </div>
        </section>

        {/* Verification Checkmark */}
        <div className="flex items-center justify-center gap-3 pt-4 opacity-30">
          <div className="w-8 h-[2px] bg-gray-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">HoopRef Standard Certified</span>
          <div className="w-8 h-[2px] bg-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;