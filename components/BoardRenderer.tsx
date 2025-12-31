
import React from 'react';
import { BoardType } from '../types';

interface BoardRendererProps {
  type: BoardType;
  text: string;
  color: string;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  boardWidth: number;
  boardHeight: number;
  fileUrl?: string;
  fileType?: string;
}

export const BoardRenderer: React.FC<BoardRendererProps> = ({ 
  type, 
  text, 
  color, 
  fontSize, 
  lineHeight,
  fontFamily,
  boardWidth,
  boardHeight,
  fileUrl, 
  fileType 
}) => {
  const isChalk = type === BoardType.CHALKBOARD;

  const textStyle: React.CSSProperties = {
    color: color || (isChalk ? '#fefefe' : '#1e3a8a'),
    direction: 'rtl',
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
    fontFamily: `${fontFamily}, sans-serif`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    transition: 'all 0.3s ease',
    fontSmooth: 'always',
    WebkitFontSmoothing: 'antialiased',
    padding: '0.5rem', // تقليل الحشو الداخلي للنص للوصول للحواف
    width: '100%',
    textAlign: 'right',
  };

  const boardStyle: React.CSSProperties = {
    width: `${boardWidth}px`,
    height: `${boardHeight}px`,
    maxWidth: '95vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // المحاذاة لليمين (في وضع RTL)
    justifyContent: 'flex-start', // المحاذاة للأعلى
    padding: '1.5rem', // هوامش بسيطة جداً عند حواف الإطار
    transition: 'all 0.5s ease',
    position: 'relative',
    margin: '0 auto'
  };

  // نمط التوقيع الذهبي المزخرف
  const signatureStyle: React.CSSProperties = {
    color: '#FFD700', // لون ذهبي ناصع
    fontFamily: "'Aref Ruqaa', serif", // خط الرقعة المزخرف
    fontSize: '2rem', // حجم أكبر ليكون واضحاً وجميلاً
    fontWeight: 'bold',
    textShadow: isChalk 
      ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255, 215, 0, 0.4)' 
      : '1px 1px 2px rgba(0,0,0,0.3), 0 0 5px rgba(255, 215, 0, 0.2)',
    letterSpacing: '0.02em',
    filter: 'brightness(1.1)',
  };

  const isPdf = fileType?.includes('pdf');

  return (
    <div className="w-full flex justify-center items-start p-6 md:p-12 board-container overflow-x-auto">
      <div 
        id="board-capture-area"
        style={boardStyle}
        className={`relative transition-all duration-500 overflow-hidden ${
          isChalk ? 'chalkboard-bg wood-frame' : 'whiteboard-bg metal-frame'
        }`}
      >
        {/* خلفية اختيارية */}
        {fileUrl && (
          <div className="absolute inset-0 z-0 flex items-center justify-center p-12 opacity-10 pointer-events-none transition-opacity">
            {isPdf ? (
              <embed src={fileUrl} type="application/pdf" className="w-full h-full rounded" />
            ) : (
              <img src={fileUrl} alt="background" className="max-w-full max-h-full object-contain brightness-125" />
            )}
          </div>
        )}

        {/* طبقات الواقعية المكثفة للسبورة الطباشيرية */}
        {isChalk && (
          <>
            <div className="chalk-ghosting-intense"></div>
            <div className="chalk-streaks-realistic"></div>
            
            {/* بقع غبار إضافية في المنتصف والزوايا */}
            <div className="absolute inset-0 opacity-25 pointer-events-none z-1">
               <div className="absolute top-[10%] left-[5%] w-[40%] h-[30%] bg-white/10 blur-[80px]"></div>
               <div className="absolute bottom-[15%] right-[10%] w-[35%] h-[40%] bg-white/15 blur-[90px]"></div>
               <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-[50%] bg-white/5 blur-[100px]"></div>
            </div>
            
            {/* طبقة الحبيبات/الخشونة */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none z-2" 
                 style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')"}}></div>
          </>
        )}
        
        {!isChalk && <div className="whiteboard-gloss opacity-10 bg-gradient-to-br from-white to-transparent absolute inset-0 pointer-events-none"></div>}

        {/* النص الرئيسي يبدأ من الأعلى واليمين */}
        <div 
          id="board-text-content"
          className={`relative z-30 transition-all duration-300 ${isChalk ? 'chalk-text' : 'marker-text'}`}
          style={textStyle}
        >
          {text || (isChalk ? "اكتب هنا بالطباشير..." : "اكتب هنا بقلم السبورة...")}
        </div>

        {/* التوقيع الذهبي المزخرف في أسفل اليسار */}
        <div 
          className={`absolute bottom-6 left-10 z-40 transition-all duration-300 ${isChalk ? 'chalk-text' : 'marker-text'}`}
          style={signatureStyle}
        >
          الأستاذ: حاجي العربي
        </div>
      </div>
    </div>
  );
};
