"use client";

import React from "react";

export default function WhatsAppWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
      <div className="hidden md:group-hover:flex items-center bg-white border border-luxury-gold/40 px-3 py-1.5 rounded-full shadow-lg text-[11px] font-bold text-luxury-charcoal uppercase tracking-wider animate-fadeIn">
        Chat on WhatsApp
      </div>
      <a
        href="https://wa.me/918608847513?text=Hi%20Vector%20Labels%20Team%2C%20I%20want%20to%20discuss%20clothing%20labels%20for%20my%20brand."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-white"
      >
        <svg
          className="w-7 h-7 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.183 0-5.767 2.584-5.767 5.767 0 1.018.266 1.972.73 2.802l-.775 2.83 2.902-.762c.792.433 1.706.685 2.677.685 3.183 0 5.767-2.584 5.767-5.767 0-3.183-2.584-5.767-5.767-5.767zm3.35 8.163c-.146.411-.849.782-1.178.831-.318.048-.718.072-2.164-.501-1.831-.735-3.027-2.592-3.12-2.716-.093-.124-.746-.993-.746-1.896 0-.903.473-1.347.64-1.531.168-.184.364-.23.486-.23.122 0 .243.001.348.011.111.01.261-.042.408.312.147.355.503 1.23.547 1.319.044.089.073.193.01.311-.063.118-.094.193-.187.303-.093.11-.196.246-.281.33-.092.091-.188.19-.08.374.108.184.48 0.795 1.03 1.288.708.631 1.305.826 1.489.917.184.091.292.077.402-.047.11-.124.473-.549.6-.739.127-.19.254-.159.429-.094.175.065 1.113.525 1.304.62.19.095.318.143.364.221.047.078.047.452-.099.863z"/>
        </svg>
      </a>
    </div>
  );
}
