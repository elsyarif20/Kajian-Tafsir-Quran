
import React, { useState } from 'react';
import { RIYADHUSH_SHALIHIN_DATA } from '../data/riyadhushShalihinData';
import { Book, ChevronRight, Bookmark, Search, Star } from 'lucide-react';
import { BookChapter } from '../types';

export const RiyadhushShalihinView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<BookChapter>(RIYADHUSH_SHALIHIN_DATA[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 -mt-10 relative z-20">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[80vh]">
        
        {/* Sidebar (Chapter List) */}
        <div className={`w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col ${isSidebarOpen ? 'fixed inset-0 z-50' : 'relative'}`}>
          <div className="p-6 bg-emerald-700 text-white sticky top-0 z-10">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Book size={20} />
              Daftar Bab
            </h2>
            <p className="text-emerald-200 text-xs mt-1">Imam An-Nawawi</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {RIYADHUSH_SHALIHIN_DATA.map((chapter) => (
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
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Bab {chapter.id}</div>
                  <div className="font-medium text-sm">{chapter.title}</div>
                </div>
                {activeChapter.id === chapter.id && <ChevronRight size={16} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content (Hadith Reader) */}
        <div className="flex-1 bg-white relative flex flex-col">
          
          {/* Mobile Header Toggle */}
          <div className="md:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <span className="font-bold text-slate-700 truncate">{activeChapter.title}</span>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-emerald-600 text-sm font-medium"
            >
              {isSidebarOpen ? 'Tutup' : 'Ganti Bab'}
            </button>
          </div>

          {/* Chapter Header */}
          <div className="p-8 border-b border-slate-100 bg-emerald-50/30">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold font-arabic text-emerald-800 mb-2">
                {activeChapter.arabicTitle}
              </h1>
              <h2 className="text-xl font-bold text-slate-800">{activeChapter.title}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base bg-white p-4 rounded-xl border border-emerald-100">
              {activeChapter.description}
            </p>
          </div>

          {/* Hadiths List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50">
            {activeChapter.hadiths.map((hadith) => (
              <div key={hadith.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                
                {/* Hadith Number & Narrator */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
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
                    <p className="font-arabic text-2xl md:text-3xl leading-[2.2] text-slate-800 dir-rtl">
                      {hadith.arabic}
                    </p>
                  </div>

                  {/* Translation */}
                  <div className="mb-6">
                    <p className="text-slate-700 leading-relaxed italic border-l-4 border-emerald-200 pl-4 py-1">
                      "{hadith.translation}"
                    </p>
                  </div>

                  {/* Faidah (Lessons) */}
                  {hadith.faidah && hadith.faidah.length > 0 && (
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                      <h4 className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-3 uppercase tracking-wide">
                        <Star size={16} className="fill-amber-600 text-amber-600" />
                        Pelajaran (Faidah) Hadits
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
                </div>
              </div>
            ))}
            
            <div className="text-center py-8 text-slate-400 text-xs">
              Akhir dari {activeChapter.title} • {activeChapter.hadiths.length} Hadits
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
