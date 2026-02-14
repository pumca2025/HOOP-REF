import React, { useState, useMemo } from 'react';
import { OFFICIAL_RULEBOOK_TEXT } from '../services/rulebookData';
import { parseRulebook } from '../services/rulebookParser';
import { Search, BookOpen, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RuleBook: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const rules = useMemo(() => parseRulebook(OFFICIAL_RULEBOOK_TEXT), []);

  const filteredRules = rules.filter(rule =>
    rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.article.includes(searchQuery) ||
    rule.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-700">
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
            Complete FIBA 2024 standards available offline for instant reference.
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

      <div className="grid gap-6 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredRules.map((rule, idx) => (
            <motion.div
              key={rule.article}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-orange-600 px-3 py-1 rounded-lg text-white font-black text-xs flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {rule.article}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                {rule.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                {rule.content}
              </p>

              <button className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                Read Full Article
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
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