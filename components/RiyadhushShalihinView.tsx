
import React, { useState, useEffect } from 'react';
import { RIYADHUSH_SHALIHIN_DATA } from '../data/riyadhushShalihinData';
import { Book, ChevronRight, Bookmark, Search, Star, X, Zap, Smartphone, LifeBuoy } from 'lucide-react';
import { BookChapter } from '../types';

export const RiyadhushShalihinView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<BookChapter>(RIYADHUSH_SHALIHIN_DATA[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Search States
  const [chapterSearch, setChapterSearch] = useState("");
  const [hadithSearch, setHadithSearch] = useState("");

  // Filter Chapters based on search
  const filteredChapters = RIYADHUSH_SHALIHIN_DATA.filter(chapter => 
    chapter.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    (chapter.arabicTitle && chapter.arabicTitle.includes(chapterSearch)) ||
    chapter.id.toString().includes(chapterSearch)
  );

  // Filter Hadiths within active chapter based on search
  const filteredHadiths = activeChapter.hadiths.filter(hadith => 
    hadith.translation.toLowerCase().includes(hadithSearch.toLowerCase()) ||
    hadith.arabic.includes(hadithSearch) ||
    hadith.narrator.toLowerCase().includes(hadithSearch) ||
    hadith.number.toString().includes(hadithSearch) ||
    (hadith.faidah && hadith.faidah.some(f => f.toLowerCase().includes(hadithSearch.toLowerCase()))) ||
    (hadith.modernImplementation && hadith.modernImplementation.some(m => m.toLowerCase().includes(hadithSearch.toLowerCase())))
  );

  // Reset hadith search when chapter changes
  useEffect(() => {
    setHadithSearch("");
  }, [activeChapter]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 -mt-10 relative z-20">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[80vh]">
        
        {/* Sidebar (Chapter List) */}
        <div className={`w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col ${isSidebarOpen ? 'fixed inset-0 z-50' : 'relative'}`}>
          <div className="p-6 bg-emerald-700 text-white sticky top-0 z-10 shadow-sm">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-1">
              <Book size={20} />
              Daftar Bab
            </h2>
            <p className="text-emerald-200 text-xs mb-4">Imam An-Nawawi</p>
            
            {/* Chapter Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari Bab..." 
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-emerald-800/50 border border-emerald-600 rounded-lg text-sm text-white placeholder-emerald-300 focus:outline-none focus:bg-emerald-800 focus:border-emerald-400 transition-colors"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" />
              {chapterSearch && (
                <button 
                  onClick={() => setChapterSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredChapters.length > 0 ? (
              filteredChapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    setActiveChapter(chapter);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${
                    activeChapter.id === chapter.id
                      ? 'bg-white shadow-sm border border-emerald-100 text-emerald-700'
                      : 'hover:bg-slate-200/50 text-slate-600'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Bab {chapter.id}</div>
                    <div className="font-medium text-sm truncate">{chapter.title}</div>
                  </div>
                  {activeChapter.id === chapter.id && <ChevronRight size={16} className="text-emerald-500 flex-shrink-0" />}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">
                Bab tidak ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Main Content (Hadith Reader) */}
        <div className="flex-1 bg-white relative flex flex-col h-full overflow-hidden">
          
          {/* Mobile Header Toggle */}
          <div className="md:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <span className="font-bold text-slate-700 truncate pr-4">{activeChapter.title}</span>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-emerald-600 text-sm font-medium whitespace-nowrap"
            >
              {isSidebarOpen ? 'Tutup' : 'Ganti Bab'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Chapter Header */}
            <div className="p-8 border-b border-slate-100 bg-emerald-50/30">
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold font-arabic text-emerald-800 mb-2 dir-rtl">
                  {activeChapter.arabicTitle}
                </h1>
                <h2 className="text-xl font-bold text-slate-800">{activeChapter.title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base bg-white p-4 rounded-xl border border-emerald-100 mb-6">
                {activeChapter.description}
              </p>

              {/* Hadith Search Input */}
              <div className="relative max-w-md">
                <input 
                  type="text" 
                  placeholder="Cari (cth: medsos, mental, kerja)..." 
                  value={hadithSearch}
                  onChange={(e) => setHadithSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                {hadithSearch && (
                  <button 
                    onClick={() => setHadithSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Hadiths List */}
            <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-[400px]">
              {filteredHadiths.length > 0 ? (
                filteredHadiths.map((hadith) => (
                  <div key={hadith.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    
                    {/* Hadith Number & Narrator */}
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {hadith.number}
                        </span>
                        <span className="text-sm font-semibold text-slate-600">
                          Dari {hadith.narrator}
                        </span>
                      </div>
                      <Bookmark size={18} className="text-slate-300 hover:text-emerald-500 cursor-pointer transition-colors" />
                    </div>

                    <div className="p-6 md:p-8">
                      {/* Arabic Text */}
                      <div className="mb-6 text-right">
                        <p className="font-arabic text-2xl md:text-3xl leading-[2.2] text-slate-800 dir-rtl highlight-text">
                          {hadith.arabic}
                        </p>
                      </div>

                      {/* Translation */}
                      <div className="mb-6">
                        <p className="text-slate-700 leading-relaxed italic border-l-4 border-emerald-200 pl-4 py-1">
                          "{hadith.translation}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Faidah (Lessons - Classical) */}
                        {hadith.faidah && hadith.faidah.length > 0 && (
                          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 h-full">
                            <h4 className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-3 uppercase tracking-wide">
                              <Star size={16} className="fill-amber-600 text-amber-600" />
                              Faidah (Pelajaran)
                            </h4>
                            <ul className="space-y-2">
                              {hadith.faidah.map((point, idx) => (
                                <li key={idx} className="flex gap-3 text-amber-900/80 text-sm leading-relaxed">
                                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-2"></span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Modern Implementation */}
                        {hadith.modernImplementation && hadith.modernImplementation.length > 0 && (
                          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 h-full">
                            <h4 className="flex items-center gap-2 font-bold text-indigo-800 text-sm mb-3 uppercase tracking-wide">
                              <Zap size={16} className="fill-indigo-600 text-indigo-600" />
                              Relevansi Modern
                            </h4>
                            <ul className="space-y-3">
                              {hadith.modernImplementation.map((point, idx) => (
                                <li key={idx} className="flex gap-3 text-indigo-900/80 text-sm leading-relaxed">
                                  <span className="flex-shrink-0 mt-0.5">
                                    {point.toLowerCase().includes('medsos') || point.toLowerCase().includes('digital') || point.toLowerCase().includes('flexing') ? (
                                      <Smartphone size={14} className="text-indigo-500" />
                                    ) : (
                                      <LifeBuoy size={14} className="text-indigo-500" />
                                    )}
                                  </span>
                                  {/* Render bold markdown-like syntax simply */}
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: point.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-900">$1</strong>') 
                                  }} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                     <Search size={24} />
                   </div>
                   <h3 className="text-slate-600 font-bold mb-2">Hadits tidak ditemukan</h3>
                   <p className="text-slate-400 text-sm max-w-xs mx-auto">
                     Coba cari dengan kata kunci lain (topik modern atau klasik).
                   </p>
                </div>
              )}
              
              {filteredHadiths.length > 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Akhir dari {activeChapter.title} • {filteredHadiths.length} Hadits ditampilkan
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
