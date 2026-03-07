import React from 'react';
import { BookOpen, Tag, CheckSquare, Lightbulb, BookMarked, ShieldAlert, Layers } from 'lucide-react';

interface ExplanationResultProps {
    result: {
        term: string;
        category: string;
        simple_definition: string;
        detailed_explanation: string;
        key_criteria: string[];
        common_examples: string[];
        rule_book_references: string[];
        penalty: string;
    };
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'Personal Foul': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Technical Foul': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Unsportsmanlike Foul': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Disqualifying Foul': { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
    'Violation': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Rule Concept': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; accent?: string }> = ({ icon, title, children, accent = 'bg-orange-600' }) => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className={`${accent} p-2 rounded-xl text-white`}>{icon}</div>
            <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">{title}</h3>
        </div>
        <div className="px-6 py-4">{children}</div>
    </div>
);

const ExplanationResult: React.FC<ExplanationResultProps> = ({ result }) => {
    const colors = categoryColors[result.category] || categoryColors['Rule Concept'];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Card */}
            <div className="bg-black text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500 to-transparent" />
                <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600 p-3 rounded-2xl shadow-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-1">Rule Encyclopedia</p>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{result.term}</h2>
                            </div>
                        </div>
                        <span className={`${colors.bg} ${colors.text} ${colors.border} border text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full self-start`}>
                            {result.category}
                        </span>
                    </div>

                    {/* Simple Definition */}
                    <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-gray-300 font-medium leading-relaxed text-base">{result.simple_definition}</p>
                    </div>
                </div>
            </div>

            {/* Key Criteria */}
            {result.key_criteria?.length > 0 && (
                <Section icon={<CheckSquare className="w-4 h-4" />} title="Key Criteria to Call This" accent="bg-orange-600">
                    <ul className="space-y-2">
                        {result.key_criteria.map((criterion, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                <p className="text-gray-700 font-medium text-sm leading-relaxed">{criterion}</p>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Detailed Explanation */}
            <Section icon={<Layers className="w-4 h-4" />} title="In-Depth Explanation" accent="bg-black">
                <p className="text-gray-700 font-medium leading-relaxed text-sm whitespace-pre-line">{result.detailed_explanation}</p>
            </Section>

            {/* Common Examples */}
            {result.common_examples?.length > 0 && (
                <Section icon={<Lightbulb className="w-4 h-4" />} title="Common On-Court Examples" accent="bg-orange-600">
                    <div className="space-y-3">
                        {result.common_examples.map((example, i) => (
                            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
                                <span className="text-orange-600 font-black text-sm flex-shrink-0">#{i + 1}</span>
                                <p className="text-gray-700 font-medium text-sm leading-relaxed">{example}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Penalty */}
            {result.penalty && (
                <Section icon={<ShieldAlert className="w-4 h-4" />} title="Penalty & Game Administration" accent="bg-red-600">
                    <p className="text-gray-700 font-medium leading-relaxed text-sm">{result.penalty}</p>
                </Section>
            )}

            {/* Rule Book References */}
            {result.rule_book_references?.length > 0 && (
                <Section icon={<BookMarked className="w-4 h-4" />} title="Rulebook References" accent="bg-black">
                    <div className="flex flex-wrap gap-2">
                        {result.rule_book_references.map((ref, i) => (
                            <span key={i} className="bg-gray-900 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-xl font-mono">
                                {ref}
                            </span>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
};

export default ExplanationResult;
