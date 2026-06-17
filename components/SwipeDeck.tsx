"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import type { PrintModel } from "@/lib/types";

const SWIPE_THRESHOLD = 110;

export default function SwipeDeck({
  models,
  onLike,
  onPass,
  onEmpty,
}: {
  models: PrintModel[];
  onLike: (m: PrintModel) => void;
  onPass: (m: PrintModel) => void;
  onEmpty?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -20], [1, 0]);

  const current = models[index];
  const next = models[index + 1];

  function commit(dir: "left" | "right") {
    if (!current) return;
    if (dir === "right") onLike(current);
    else onPass(current);
    const newIndex = index + 1;
    setIndex(newIndex);
    x.set(0);
    if (newIndex >= models.length) onEmpty?.();
  }

  function fly(dir: "left" | "right") {
    const target = dir === "right" ? 600 : -600;
    animate(x, target, { duration: 0.28, ease: "easeOut" }).then(() => commit(dir));
  }

  if (!current) {
    return (
      <div className="deck">
        <div className="empty">
          <h2>That's the whole pile 🎉</h2>
          <p>You've swiped every print we pulled. Check your saved prints, or come back for a fresh batch.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="deck">
        {/* Card behind for depth */}
        {next && (
          <div className="card" style={{ transform: "scale(0.95) translateY(12px)", filter: "brightness(0.7)" }}>
            <img src={next.thumbnail} alt="" />
          </div>
        )}

        <AnimatePresence>
          <motion.div
            key={current.id}
            className="card"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 600) fly("right");
              else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -600) fly("left");
              else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
            }}
          >
            <img src={current.thumbnail} alt={current.title} />
            <div className="source-badge">{current.source}</div>
            <motion.div className="stamp like" style={{ opacity: likeOpacity }}>
              Like
            </motion.div>
            <motion.div className="stamp pass" style={{ opacity: passOpacity }}>
              Pass
            </motion.div>
            <div className="meta">
              <p className="title">{current.title}</p>
              <p className="creator">by {current.creator}</p>
              {current.tags && current.tags.length > 0 && (
                <div className="tags">
                  {current.tags.slice(0, 4).map((t) => (
                    <span className="tag" key={t}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="controls">
        <button className="btn-round pass" aria-label="Pass" onClick={() => fly("left")}>
          ✕
        </button>
        <a
          className="btn-round info"
          aria-label="View source"
          href={current.sourceUrl}
          target="_blank"
          rel="noreferrer"
          title="Open source page"
        >
          ↗
        </a>
        <button className="btn-round like" aria-label="Like" onClick={() => fly("right")}>
          ♥
        </button>
      </div>
    </>
  );
}
