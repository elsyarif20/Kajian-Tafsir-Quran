import React, { useState } from 'react';
import { YASIN_DATA, TAHLIL_DATA } from '../data/tahlilData';
import { ScrollText, BookOpen } from 'lucide-react';

type Tab = 'yasin' | 'tahlil';

export const TahlilView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('yasin');

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 -mt-10 relative z-20">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-emerald-700 p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold font-arabic mb-2">
              {activeTab === 'yasin' ? 'Surat Yasin' : 'Bacaan Tahlil'}
            </h1>
            <p className="text-emerald-100 opacity-90 text-sm">
              {activeTab === 'yasin' ? 'Makkiyah · 83 Ayat' : 'Lengkap dengan Doa Arwah (NU)'}
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute right-0 top-0 transform translate-x-1/3 -translate-y-1/3">
               {activeTab === 'yasin' ? <BookOpen size={300} /> : <ScrollText size={300} />}
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('yasin')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === 'yasin'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Surat Yasin
          </button>
          <button
            onClick={() => setActiveTab('tahlil')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === 'tahlil'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Bacaan Tahlil
          </button>
        </div>

        {/* Content */}
        <div className="bg-white min-h-[500px]">
          {activeTab === 'yasin' ? (
            <div className="divide-y divide-slate-100">
               {/* Bismillah for Yasin */}
               <div className="text-center py-10 bg-slate-50/50">
                  <p className="font-arabic text-3xl text-slate-800">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
               </div>
               
               {YASIN_DATA.map((verse) => (
                 <div key={verse.number} className="p-6 hover:bg-slate-50 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100 flex-shrink-0">
                        {verse.number.toLocaleString('ar-EG')}
                      </div>
                      <div className="flex-1">
                        <p className="font-arabic text-3xl md:text-4xl leading-[2.2] text-right text-slate-800 dir-rtl mb-4">
                          {verse.text}
                        </p>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                          {verse.translation}
                        </p>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {TAHLIL_DATA.items.map((item) => (
                <div key={item.id} className="p-6 md:p-8 hover:bg-slate-50 transition-colors group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {item.id}
                      </span>
                      <h3 className="font-semibold text-slate-700 text-lg">{item.title}</h3>
                    </div>
                    {item.note && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-100">
                        {item.note}
                      </span>
                    )}
                  </div>

                  <div className="text-right mb-5 pl-4 md:pl-20">
                    <p className="font-arabic text-2xl md:text-3xl leading-[2.2] text-slate-800 dir-rtl">
                      {item.arabic}
                    </p>
                  </div>

                  <div className="pl-11 md:pl-0">
                    <p className="text-slate-500 italic text-sm md:text-base leading-relaxed border-l-4 border-slate-200 pl-4">
                      "{item.translation}"
                    </p>
                  </div>
                </div>
              ))}

              {/* Closing Dua */}
              {TAHLIL_DATA.closingDua && (
                <div className="p-8 bg-emerald-50/30">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-emerald-800 mb-2">{TAHLIL_DATA.closingDua.title}</h3>
                    <div className="h-1 w-20 bg-emerald-200 mx-auto rounded-full"></div>
                  </div>
                  
                  <div className="text-right mb-6">
                     <p className="font-arabic text-2xl md:text-3xl leading-[2.2] text-slate-800 dir-rtl">
                       {TAHLIL_DATA.closingDua.arabic}
                     </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
                    <p className="text-slate-600 italic leading-relaxed text-center">
                      "{TAHLIL_DATA.closingDua.translation}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-200 text-xs text-slate-400">
          Konten bersumber dari file referensi (Tradisi NU).
        </div>
      </div>
    </div>
  );
};
