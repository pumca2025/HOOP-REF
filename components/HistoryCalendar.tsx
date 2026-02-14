import React, { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ChevronRight, Calendar, Trash2, Clock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryEntry {
    _id: string;
    situation: string;
    ruleApplied: string;
    article: string;
    decision: string;
    penalty: string;
    timestamp: string;
}

interface HistoryCalendarProps {
    history: HistoryEntry[];
    onDelete: (id: string) => void;
}

const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ history, onDelete }) => {
    const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

    // Group entries by Date
    const groupedHistory: { [key: string]: HistoryEntry[] } = {};
    history.forEach(entry => {
        const dateObj = new Date(entry.timestamp);
        if (isNaN(dateObj.getTime())) return;
        const date = format(dateObj, 'yyyy-MM-dd');
        if (!groupedHistory[date]) groupedHistory[date] = [];
        groupedHistory[date].push(entry);
    });

    const dates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <Calendar className="w-20 h-20 mb-4" />
                <p className="text-xl font-bold">No History Yet</p>
                <p>Analyze a play to see it here.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-orange-600" />
                History
            </h2>

            <div className="space-y-10">
                {dates.map(date => (
                    <div key={date} className="space-y-4">
                        <div className="sticky top-[70px] bg-gray-100/80 backdrop-blur-md py-2 z-10">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">
                                {format(new Date(date), 'MMMM do, yyyy')}
                            </h3>
                        </div>

                        <div className="grid gap-4">
                            {groupedHistory[date].map((entry) => (
                                <motion.div
                                    key={entry._id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setSelectedEntry(entry)}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 cursor-pointer flex items-center justify-between group transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400">{format(new Date(entry.timestamp), 'hh:mm a')}</p>
                                            <p className="font-bold text-gray-800 line-clamp-1">{entry.situation}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-600 transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {selectedEntry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEntry(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 bg-black text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl">Decision Details</h3>
                                    <p className="text-xs text-gray-400">{format(new Date(selectedEntry.timestamp), 'MMMM do, yyyy • hh:mm a')}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this entry?')) {
                                            onDelete(selectedEntry._id);
                                            setSelectedEntry(null);
                                        }
                                    }}
                                    className="p-3 text-red-500 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <section>
                                    <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Original Situation
                                    </h4>
                                    <p className="text-lg font-medium text-gray-700 leading-relaxed italic">
                                        "{selectedEntry.situation}"
                                    </p>
                                </section>

                                <div className="grid gap-6">
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Rule Applied</h4>
                                        <p className="font-bold text-gray-900">{selectedEntry.ruleApplied}</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Article</h4>
                                        <p className="font-bold text-gray-900">{selectedEntry.article}</p>
                                    </div>
                                    <div className="p-6 bg-orange-600 rounded-2xl shadow-lg text-white">
                                        <h4 className="text-xs font-black text-orange-200 uppercase tracking-widest mb-2">Official Decision</h4>
                                        <p className="text-xl font-bold">{selectedEntry.decision}</p>
                                    </div>
                                    <div className="p-6 bg-gray-900 rounded-2xl shadow-lg text-white">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Penalty / Result</h4>
                                        <p className="text-lg font-medium">{selectedEntry.penalty}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:bg-black transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HistoryCalendar;
