import React, { useState, useMemo } from 'react';
import { OFFICIAL_RULEBOOK_TEXT } from '../services/rulebookData';
import { parseRulebook } from '../services/rulebookParser';
import { Search, BookOpen, Hash, ChevronDown, ChevronUp, ExternalLink, Sparkles, Loader2, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePlay } from '../services/apiService';

const FIBA_ARTICLE_URLS: Record<string, string> = {
  '1': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=7',
  '2': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=9',
  '4': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=15',
  '8': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=20',
  '9': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=21',
  '10': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=22',
  '11': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=22',
  '12': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=23',
  '13': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=24',
  '14': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=25',
  '15': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=25',
  '16': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=26',
  '17': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=27',
  '18': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=28',
  '22': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=33',
  '23': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=34',
  '24': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=35',
  '25': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=36',
  '26': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=38',
  '27': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=38',
  '28': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=39',
  '29': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=39',
  '30': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=40',
  '31': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=41',
  '32': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=43',
  '33': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=44',
  '34': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=47',
  '35': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=48',
  '36': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=49',
  '37': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=51',
  '38': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=52',
  '40': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=55',
  '41': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=56',
  '43': 'https://www.fiba.basketball/documents/rules/basketball-rules-2024.pdf#page=58',
};

interface AiExplanation {
  simple_definition: string;
  detailed_explanation: string;
  key_criteria: string[];
  penalty: string;
}

const RuleCard: React.FC<{ rule: { article: string; title: string; content: string; fullContent: string } }> = ({ rule }) => {
  const [expanded, setExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AiExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const fibaUrl = FIBA_ARTICLE_URLS[rule.article];

  const handleExpand = () => {
    setExpanded(prev => !prev);
  };

  const handleAiExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiExplanation) return; // already fetched

    setAiLoading(true);
    setAiError(null);
    try {
      const query = `Explain Article ${rule.article} – ${rule.title} from the FIBA basketball rulebook.`;
      const response = await analyzePlay(query);
      const data = response.data;

      if (data.type === 'explanation') {
        setAiExplanation({
          simple_definition: data.simple_definition,
          detailed_explanation: data.detailed_explanation,
          key_criteria: data.key_criteria || [],
          penalty: data.penalty,
        });
      } else {
        setAiError("Could not generate an AI explanation for this article.");
      }
    } catch (err: any) {
      setAiError(err.response?.data?.error || "Failed to generate AI explanation.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-[24px] border shadow-sm transition-all duration-300 overflow-hidden
                ${expanded ? 'border-orange-300 shadow-xl shadow-orange-100' : 'border-gray-100 hover:shadow-md hover:border-orange-100'}`}
    >
      {/* Card Header — always visible, click to expand */}
      <button
        onClick={handleExpand}
        className="w-full text-left p-6 flex items-start gap-4 group"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-colors
                    ${expanded ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'}`}>
          {rule.article}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-black text-base leading-tight transition-colors mb-1 ${expanded ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-600'}`}>
            {rule.title}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{rule.content}</p>
        </div>
        <div className={`flex-shrink-0 transition-transform duration-300 ${expanded ? 'rotate-0' : ''}`}>
          {expanded
            ? <ChevronUp className="w-5 h-5 text-orange-600" />
            : <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-orange-400" />
          }
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-gray-50 pt-4">
              {/* Full Rule Text */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookMarked className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Official Rule Text</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed font-medium">{rule.fullContent}</p>
              </div>

              {/* AI Explanation */}
              {!aiExplanation && !aiLoading && (
                <button
                  onClick={handleAiExplain}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Explain this Rule with AI
                </button>
              )}

              {aiLoading && (
                <div className="flex items-center justify-center gap-3 py-4 text-orange-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-bold">Generating AI explanation...</span>
                </div>
              )}

              {aiError && (
                <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-2xl border border-red-100">{aiError}</p>
              )}

              {/* AI Explanation Result */}
              {aiExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-orange-600 p-1.5 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">AI Referee Explanation</span>
                  </div>

                  {/* Simple Definition */}
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <p className="text-orange-900 font-bold text-sm leading-relaxed">{aiExplanation.simple_definition}</p>
                  </div>

                  {/* Detailed Explanation */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed font-medium whitespace-pre-line">{aiExplanation.detailed_explanation}</p>
                  </div>

                  {/* Key Criteria */}
                  {aiExplanation.key_criteria?.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Key Criteria</p>
                      <ul className="space-y-2">
                        {aiExplanation.key_criteria.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            <p className="text-gray-700 text-sm font-medium leading-snug">{c}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Penalty */}
                  {aiExplanation.penalty && (
                    <div className="bg-black text-white rounded-2xl p-4 flex items-start gap-3">
                      <div className="bg-orange-600 rounded-xl p-1.5 flex-shrink-0 mt-0.5">
                        <Hash className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-1">Penalty</p>
                        <p className="text-gray-300 text-sm font-medium leading-relaxed">{aiExplanation.penalty}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Official FIBA Link */}
              {/* {fibaUrl && (
                <a
                  href={fibaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:border-orange-600 hover:text-orange-600 transition-all active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Official FIBA Article {rule.article}
                </a>
              )} */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RuleBook: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const rules = useMemo(() => parseRulebook(OFFICIAL_RULEBOOK_TEXT), []);

  const filteredRules = rules.filter(rule =>
    rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.article.includes(searchQuery) ||
    rule.fullContent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-black p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen className="w-32 h-32 text-orange-600" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4 mb-2">
            <BookOpen className="w-10 h-10 text-orange-600" />
            Official Rulebook
          </h2>
          <p className="text-gray-400 font-medium max-w-md">
            Click any article to expand its full text. Use the AI button for an in-depth referee explanation.
          </p>
        </div>

        <div className="mt-8 relative z-10">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, titles, or rules..."
              className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder-gray-500 focus:bg-white focus:text-black focus:border-orange-600 outline-none transition-all font-bold text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredRules.map((rule) => (
            <RuleCard key={rule.article} rule={rule} />
          ))}
        </AnimatePresence>
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-20 opacity-30">
          <Search className="w-20 h-20 mx-auto mb-4" />
          <p className="text-2xl font-black uppercase">No Results Found</p>
          <p>Try searching for different keywords.</p>
        </div>
      )}
    </div>
  );
};

export default RuleBook;