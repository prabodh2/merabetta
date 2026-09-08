'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  customMessage?: string;
  facilityName?: string;
}

export default function FloatingWhatsApp({
  customMessage,
  facilityName,
}: FloatingWhatsAppProps) {
  const defaultText = facilityName
    ? `Hello MeraBetta Team, I am interested in inquiring about ${facilityName}. Could you share details regarding room availability and assisted care?`
    : `Hello MeraBetta Team, I am looking for a trusted senior living / old age home facility for my family. Please assist me.`;

  const message = encodeURIComponent(customMessage || defaultText);
  const whatsappUrl = `https://wa.me/918999188267?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 bg-white hover:bg-slate-50 text-[#E86A33] border border-slate-200/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        title="Chat on WhatsApp with Senior Care Advisor"
      >
        {/* WhatsApp Green Icon Badge */}
        <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform">
          <MessageCircle className="w-5 h-5 fill-white stroke-none" />
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
            Instant Help
          </span>
          <span className="text-xs font-black text-[#E86A33] mt-0.5 tracking-tight">
            Let&apos;s Connect
          </span>
        </div>
      </a>
    </div>
  );
}
