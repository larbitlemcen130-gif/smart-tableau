
import React, { useState, useEffect, useRef } from 'react';
import { BoardType, BoardState } from './types';
import { BoardRenderer } from './components/BoardRenderer';
import { getBoardSuggestion } from './services/gemini';
import * as htmlToImage from 'html-to-image';

const App: React.FC = () => {
  const [state, setState] = useState<BoardState>({
    type: BoardType.CHALKBOARD,
    text: '',
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 1.1,
    fontFamily: 'Aref Ruqaa',
    boardWidth: 600,
    boardHeight: 400,
  });
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const arabicFonts = [
    { name: 'رقعة (تقليدي)', value: 'Aref Ruqaa', class: 'f-arefruqaa' },
    { name: 'أمييري (كلاسيكي)', value: 'Amiri', class: 'f-amiri' },
    { name: 'كايرو (عصري)', value: 'Cairo', class: 'f-cairo' },
    { name: 'تجول (احترافي)', value: 'Tajawal', class: 'f-tajawal' },
    { name: 'المسيري (فني)', value: 'El Messiri', class: 'f-elmessiri' },
    { name: 'ليمونادة (مرح)', value: 'Lemonada', class: 'f-lemonada' },
  ];

  useEffect(() => {
    if ((window as any).MathJax) {
      (window as any).MathJax.typesetPromise?.();
    }
  }, [state.text, state.fontSize, state.lineHeight, state.type, state.fontFamily]);

  useEffect(() => {
    if (state.type === BoardType.CHALKBOARD) {
      setState(prev => ({ ...prev, color: '#ffffff' }));
    } else {
      setState(prev => ({ ...prev, color: '#1e40af' }));
    }
  }, [state.type]);

  const handleSuggestion = async () => {
    setLoadingSuggestion(true);
    const context = state.text || "حكمة بليغة لسبورة الفصل بالطباشير الأبيض";
    const suggestion = await getBoardSuggestion(context + " (provide a beautiful Arabic educational quote)");
    setState(prev => ({ ...prev, text: suggestion }));
    setLoadingSuggestion(false);
  };

  const handleClear = () => {
    setState(prev => ({ ...prev, text: '', fileUrl: undefined, fileType: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleBoard = () => {
    setState(prev => ({
      ...prev,
      type: prev.type === BoardType.CHALKBOARD ? BoardType.WHITEBOARD : BoardType.CHALKBOARD
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setState(prev => ({ ...prev, fileUrl: url, fileType: file.type }));
    }
  };

  const handleDownload = async () => {
    const boardElement = document.getElementById('board-capture-area');
    if (!boardElement) return;

    setIsDownloading(true);
    try {
      const targetWidth = 3840;
      const currentWidth = boardElement.offsetWidth;
      const pixelRatio = targetWidth / currentWidth;

      // استخدام خيارات محددة لتجنب الأخطاء الشائعة
      const options = {
        pixelRatio: pixelRatio,
        cacheBust: true,
        backgroundColor: state.type === BoardType.CHALKBOARD ? '#1a2a22' : '#ffffff',
        // استبعاد أي عناصر قد تسبب مشاكل (مثل EMBED للـ PDF)
        filter: (node: HTMLElement) => {
          const tagName = node.tagName ? node.tagName.toUpperCase() : '';
          return tagName !== 'EMBED' && tagName !== 'IFRAME' && tagName !== 'OBJECT';
        },
        // إضافة تأخير طفيف لضمان استقرار الأنماط
        canvasWidth: boardElement.offsetWidth * pixelRatio,
        canvasHeight: boardElement.offsetHeight * pixelRatio,
      };

      // محاولة التصدير مع الخطوط أولاً
      let dataUrl;
      try {
        dataUrl = await htmlToImage.toPng(boardElement, options);
      } catch (fontError) {
        console.warn("Retrying without external font processing due to CORS/Access restrictions...");
        // إذا فشل بسبب cssRules، نحاول التصدير مع تخطي معالجة الخطوط الخارجية (ستستخدم المتصفح الافتراضي)
        dataUrl = await htmlToImage.toPng(boardElement, { ...options, skipFonts: true });
      }

      const link = document.createElement('a');
      link.download = `smart-board-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error('Final Download Error:', err);
      alert('تعذر تحميل الصورة بدقة عالية. قد يكون ذلك بسبب قيود الأمان في المتصفح أو تداخل الأنماط الخارجية.');
    } finally {
      setIsDownloading(false);
    }
  };

  const colors = state.type === BoardType.CHALKBOARD 
    ? ['#ffffff', '#fffde7', '#fce4ec', '#f1f8e9', '#e3f2fd', '#fff3e0'] 
    : ['#1e40af', '#dc2626', '#166534', '#111827', '#6b21a8', '#9a3412'];

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 font-sans text-gray-800 transition-all duration-500" dir="rtl">
      <header className="mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 flex items-center justify-center gap-4 font-['Cairo']">
          <span className="bg-[#4e342e] text-amber-50 px-5 py-2 rounded-lg shadow-xl border-b-8 border-black/30">السبورة</span>
          <span className="text-[#1e3329]">الواقعية</span>
        </h1>
        <p className="mt-4 text-slate-600 font-bold font-['Cairo'] text-lg">اكتب بجمال الطباشير الأبيض أو الأقلام الملونة</p>
      </header>

      <BoardRenderer 
        type={state.type} 
        text={state.text} 
        color={state.color} 
        fontSize={state.fontSize}
        lineHeight={state.lineHeight}
        fontFamily={state.fontFamily}
        boardWidth={state.boardWidth}
        boardHeight={state.boardHeight}
        fileUrl={state.fileUrl}
        fileType={state.fileType}
      />

      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl border-t-8 border-emerald-600/20 p-8 md:p-10 mt-12 mb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-black text-emerald-800 uppercase tracking-widest font-['Cairo']">
                  النص المراد كتابته
                </label>
                <button onClick={handleClear} className="text-sm font-bold text-rose-500 hover:text-rose-700 transition-all font-['Cairo'] flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  مسح المحتوى
                </button>
              </div>
              <textarea
                className="w-full h-44 p-6 border-2 border-emerald-50 rounded-[2rem] focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-none bg-slate-50 text-right font-['Cairo'] text-xl shadow-inner outline-none"
                placeholder={state.type === BoardType.CHALKBOARD ? "ابدأ الكتابة بالطباشير الأبيض..." : "ابدأ الكتابة بالقلم..."}
                value={state.text}
                onChange={(e) => setState(prev => ({ ...prev, text: e.target.value }))}
              />
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-slate-500 uppercase font-['Cairo']">حجم الخط</label>
                      <input 
                        type="number" 
                        value={state.fontSize} 
                        onChange={(e) => setState(prev => ({ ...prev, fontSize: Math.max(1, parseInt(e.target.value) || 0) }))}
                        className="w-16 h-8 text-center bg-emerald-50 border-2 border-emerald-100 rounded-lg font-black text-emerald-800 outline-none focus:border-emerald-500 text-sm transition-all"
                      />
                    </div>
                    <input type="range" min="8" max="400" step="1" value={state.fontSize} onChange={(e) => setState(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))} className="w-full accent-emerald-600 h-2 rounded-lg bg-emerald-50" />
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-slate-500 uppercase font-['Cairo']">التباعد</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={state.lineHeight} 
                        onChange={(e) => setState(prev => ({ ...prev, lineHeight: Math.max(0.1, parseFloat(e.target.value) || 0) }))}
                        className="w-16 h-8 text-center bg-emerald-50 border-2 border-emerald-100 rounded-lg font-black text-emerald-800 outline-none focus:border-emerald-500 text-sm transition-all"
                      />
                    </div>
                    <input type="range" min="0.5" max="4.0" step="0.1" value={state.lineHeight} onChange={(e) => setState(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))} className="w-full accent-emerald-600 h-2 rounded-lg bg-emerald-50" />
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-slate-500 uppercase font-['Cairo']">عرض السبورة</label>
                      <input 
                        type="number" 
                        value={state.boardWidth} 
                        onChange={(e) => setState(prev => ({ ...prev, boardWidth: Math.max(100, parseInt(e.target.value) || 0) }))}
                        className="w-16 h-8 text-center bg-emerald-50 border-2 border-emerald-100 rounded-lg font-black text-emerald-800 outline-none focus:border-emerald-500 text-sm transition-all"
                      />
                    </div>
                    <input type="range" min="100" max="2000" step="10" value={state.boardWidth} onChange={(e) => setState(prev => ({ ...prev, boardWidth: parseInt(e.target.value) }))} className="w-full accent-emerald-600 h-2 rounded-lg bg-emerald-50" />
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-slate-500 uppercase font-['Cairo']">طول السبورة</label>
                      <input 
                        type="number" 
                        value={state.boardHeight} 
                        onChange={(e) => setState(prev => ({ ...prev, boardHeight: Math.max(100, parseInt(e.target.value) || 0) }))}
                        className="w-16 h-8 text-center bg-emerald-50 border-2 border-emerald-100 rounded-lg font-black text-emerald-800 outline-none focus:border-emerald-500 text-sm transition-all"
                      />
                    </div>
                    <input type="range" min="100" max="2000" step="10" value={state.boardHeight} onChange={(e) => setState(prev => ({ ...prev, boardHeight: parseInt(e.target.value) }))} className="w-full accent-emerald-600 h-2 rounded-lg bg-emerald-50" />
                 </div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-black text-emerald-800 uppercase tracking-widest font-['Cairo']">نمط السبورة والخط</label>
              <div className="flex bg-slate-100 p-2 rounded-2xl shadow-inner gap-2">
                <button onClick={toggleBoard} className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all font-['Cairo'] flex items-center justify-center gap-2 ${state.type === BoardType.CHALKBOARD ? 'bg-white shadow-lg text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  <div className="w-3 h-3 rounded-full bg-emerald-700"></div>
                  طباشير
                </button>
                <button onClick={toggleBoard} className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all font-['Cairo'] flex items-center justify-center gap-2 ${state.type === BoardType.WHITEBOARD ? 'bg-white shadow-lg text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  أقلام
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {arabicFonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => setState(prev => ({ ...prev, fontFamily: font.value }))}
                    className={`py-2 px-1 rounded-xl border-2 transition-all text-center text-xs ${
                      state.fontFamily === font.value 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-black shadow-sm scale-105' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-emerald-200'
                    } ${font.class}`}
                  >
                    {font.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-black text-emerald-800 uppercase tracking-widest font-['Cairo']">لون الطباشير/القلم</label>
              <div className="flex flex-wrap gap-4">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setState(prev => ({ ...prev, color: c }))}
                    className={`w-11 h-11 rounded-full border-4 transition-all hover:scale-125 ${state.color === c ? 'border-emerald-500 shadow-xl ring-4 ring-emerald-500/10' : 'border-white shadow-md'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-2 font-['Cairo'] text-sm shadow-2xl">
                     خلفية مخصصة
                  </button>
                  <button onClick={handleSuggestion} disabled={loadingSuggestion} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-['Cairo'] text-sm shadow-2xl">
                    {loadingSuggestion ? "جاري التفكير..." : "اقتراح ذكي ✨"}
                  </button>
                </div>
                
                <button 
                  onClick={handleDownload} 
                  disabled={isDownloading} 
                  className={`w-full py-4 ${isDownloading ? 'bg-amber-400' : 'bg-amber-500 hover:bg-amber-600'} text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 font-['Cairo'] text-sm shadow-2xl border-b-4 border-amber-700`}
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      تحميل كصورة 4K بدقة عالية
                    </>
                  )}
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md py-4 text-center border-t border-emerald-100 text-emerald-800/40 text-xs font-black font-['Cairo'] flex items-center justify-center gap-6 z-50">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span>السبورة السحرية المتطورة</span>
        </div>
        <div className="h-4 w-px bg-emerald-100"></div>
        <span>تحكم كامل بالأرقام والقياسات</span>
      </footer>
    </div>
  );
};

export default App;
