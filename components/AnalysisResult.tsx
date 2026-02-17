import React from 'react';
import { Gavel, BookOpen, FileText, Scale, Zap, CheckCircle } from 'lucide-react';

interface AnalysisResultProps {
  result: {
    official_decision: string;
    infraction_type: string;
    situation_summary: string;
    applied_rules: string[];
    detailed_reasoning: string;
    rule_book_references: string[];
    penalty: string;
  };
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Header Section - Official Decision */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Scale className="w-20 h-20 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Official Decision</span>
          </div>
          <h3 className="text-2xl font-bold leading-tight">{result.official_decision}</h3>
          {result.infraction_type && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-bold">{result.infraction_type}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Situation Summary */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Situation Summary</h4>
          </div>
          <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 text-gray-700 font-medium leading-relaxed">
            {result.situation_summary}
          </div>
        </section>

        {/* Applied Rules */}
        {result.applied_rules && result.applied_rules.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-gray-400" />
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Applied Rules</h4>
            </div>
            <div className="space-y-2">
              {result.applied_rules.map((rule, index) => (
                <div key={index} className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-gray-900">{rule}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Detailed Reasoning */}
        {result.detailed_reasoning && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Detailed Reasoning</h4>
            </div>
            <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.detailed_reasoning}
            </div>
          </section>
        )}

        {/* Rule Book References */}
        {result.rule_book_references && result.rule_book_references.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Rule Book References</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.rule_book_references.map((ref, index) => (
                <div key={index} className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                  <span className="text-sm font-bold text-indigo-900">{ref}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Penalty / Result */}
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-[32px] shadow-lg shadow-orange-600/20 text-white relative overflow-hidden">
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