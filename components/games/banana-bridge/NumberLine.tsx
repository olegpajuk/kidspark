"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";

interface NumberLineProps {
  maxValue: number;
  currentPosition: number;
  targetPosition: number;
  bridgeAt: 10 | 20 | null;
  showBridgeHighlight: boolean;
  droppedFruits: number[];
}

interface DropZoneProps {
  position: number;
  isTarget: boolean;
  isBridge: boolean;
  showHighlight: boolean;
  hasFruit: boolean;
}

function DropZone({ position, isTarget, isBridge, showHighlight, hasFruit }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `zone-${position}`,
    data: { position },
  });

  return (
    <g ref={setNodeRef as React.Ref<SVGGElement>}>
      <motion.circle
        cx={0}
        cy={0}
        r={isOver ? 18 : 14}
        fill={
          hasFruit
            ? "#FFD93D"
            : isOver
            ? "#6BCB77"
            : isTarget
            ? "#FF6B6B"
            : isBridge && showHighlight
            ? "#4ECDC4"
            : "#FFF8E7"
        }
        stroke={isBridge && showHighlight ? "#4ECDC4" : "#333"}
        strokeWidth={isBridge && showHighlight ? 3 : 2}
        animate={{
          scale: isOver ? 1.2 : isBridge && showHighlight ? [1, 1.1, 1] : 1,
        }}
        transition={{
          scale: isBridge && showHighlight
            ? { repeat: Infinity, duration: 1 }
            : { duration: 0.15 },
        }}
      />
      <text
        y={1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
        fill={hasFruit || isOver ? "#fff" : "#333"}
        style={{ pointerEvents: "none" }}
      >
        {position}
      </text>
    </g>
  );
}

export function NumberLine({
  maxValue,
  currentPosition,
  targetPosition,
  bridgeAt,
  showBridgeHighlight,
  droppedFruits,
}: NumberLineProps) {
  const padding = 40;
  const viewBoxWidth = 600;
  const viewBoxHeight = 120;
  const lineY = 60;
  const usableWidth = viewBoxWidth - padding * 2;
  const step = usableWidth / maxValue;

  const getX = (n: number) => padding + n * step;

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="w-full h-auto max-h-[160px]"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        x1={padding}
        y1={lineY}
        x2={viewBoxWidth - padding}
        y2={lineY}
        stroke="#333"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {currentPosition > 0 && (
        <motion.line
          x1={padding}
          y1={lineY}
          x2={getX(currentPosition)}
          y2={lineY}
          stroke="#6BCB77"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ x2: padding }}
          animate={{ x2: getX(currentPosition) }}
          transition={{ type: "spring", damping: 20 }}
        />
      )}

      {bridgeAt && currentPosition < bridgeAt && targetPosition > bridgeAt && showBridgeHighlight && (
        <motion.rect
          x={getX(bridgeAt) - 20}
          y={lineY - 35}
          width={40}
          height={70}
          rx={8}
          fill="#4ECDC4"
          opacity={0.15}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.1, 0.25, 0.1], scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {Array.from({ length: maxValue + 1 }, (_, i) => {
        const x = getX(i);
        const isCurrent = i === currentPosition;
        const isTarget = i === targetPosition;
        const isBridge = bridgeAt !== null && i === bridgeAt;
        const hasFruit = droppedFruits.includes(i);

        return (
          <g key={i} transform={`translate(${x}, ${lineY})`}>
            <DropZone
              position={i}
              isTarget={isTarget}
              isBridge={isBridge}
              showHighlight={showBridgeHighlight && isBridge}
              hasFruit={hasFruit}
            />

            {isCurrent && currentPosition > 0 && (
              <motion.g
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: -28, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <circle cy={-28} r={6} fill="#FF6B6B" />
                <path
                  d="M0,-22 L-5,-12 L5,-12 Z"
                  fill="#FF6B6B"
                />
              </motion.g>
            )}
          </g>
        );
      })}

      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
        </marker>
      </defs>
      <line
        x1={viewBoxWidth - padding}
        y1={lineY}
        x2={viewBoxWidth - padding + 15}
        y2={lineY}
        stroke="#333"
        strokeWidth="3"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
}
