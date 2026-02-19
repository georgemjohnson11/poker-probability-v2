"use client";

import { cardLabel, type Card } from "../lib/odds";

interface PlayingCardProps {
  card?: Card;
  hidden?: boolean;
}

export default function PlayingCard({ card, hidden = false }: PlayingCardProps) {
  if (hidden || !card) {
    return (
      <div
        className="inline-flex items-center justify-center rounded-lg shadow-lg transition-all hover:shadow-xl"
        style={{
          width: "75px",
          height: "135px",
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%)",
          border: "3px solid #1e40af",
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-white text-3xl font-bold opacity-20">♠</div>
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 10px)",
            }}
          />
        </div>
      </div>
    );
  }

  const isRed = card.suit === "♥" || card.suit === "♦";
  const color = isRed ? "#dc2626" : "#1f2937";
  const rank = cardLabel(card).replace(card.suit, "").trim();

  return (
    <div
      className="inline-flex flex-col rounded-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
      style={{
        width: "75px",
        height: "135px",
        background: "white",
        border: "2px solid #d1d5db",
        padding: "8px",
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex flex-col items-center" style={{ color }}>
          <span className="text-base font-bold leading-tight">{rank}</span>
          <span className="text-xl leading-none">{card.suit}</span>
        </div>
        <div className="flex items-center justify-center flex-1">
          <span className="text-4xl" style={{ color }}>
            {card.suit}
          </span>
        </div>
        <div className="flex flex-col items-center rotate-180" style={{ color }}>
          <span className="text-base font-bold leading-tight">{rank}</span>
          <span className="text-xl leading-none">{card.suit}</span>
        </div>
      </div>
    </div>
  );
}
