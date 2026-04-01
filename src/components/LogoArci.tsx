"use client";

import { useId, type SVGProps } from "react";
import { APP_BRAND_NAME } from "@/lib/brand";

const VB_W = 252;
const VB_H = 48;

const sizeMap = {
  /** Компактний (наприклад мобільні обмежені блоки) */
  sm: "h-9 w-auto min-w-[9rem]",
  /** Шапка сайту — помітний розмір */
  md: "h-11 w-auto min-w-[11rem] sm:h-[3.15rem] sm:min-w-[12.5rem]",
  /** Сплеш / промо */
  lg: "h-[5.5rem] w-auto min-w-[13rem] max-w-[94vw] sm:h-24",
} as const;

export type LogoArciSize = keyof typeof sizeMap;

type Props = {
  size?: LogoArciSize;
  className?: string;
  title?: string;
} & Omit<SVGProps<SVGSVGElement>, "viewBox" | "children">;

/**
 * ARCHI HUD wordmark — single fixed style.
 */
export function LogoArci({
  size = "md",
  className = "",
  title = APP_BRAND_NAME,
  ...svg
}: Props) {
  const uid = useId().replace(/:/g, "");
  const fillId = `archi-fill-${uid}`;
  const frameId = `archi-frame-${uid}`;
  const glowId = `archi-glow-${uid}`;

  return (
    <span
      className="inline-flex max-w-full notranslate"
      translate="no"
      data-notranslate-brand
    >
      <svg
        role="img"
        aria-label={title}
        lang="en"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className={`notranslate ${sizeMap[size]} ${className}`.trim()}
        {...svg}
      >
      <defs>
        <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(236 238 226)" stopOpacity="0.98" />
          <stop offset="45%" stopColor="rgb(182 192 158)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(128 145 102)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={frameId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(105 120 78)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="rgb(152 166 128)" stopOpacity="0.35" />
        </linearGradient>
        <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        fill="none"
        stroke={`url(#${frameId})`}
        strokeWidth="0.9"
        d={`M 8 4 L ${VB_W - 8} 4 L ${VB_W - 3} 9 L ${VB_W - 3} ${VB_H - 9} L ${VB_W - 8} ${VB_H - 4} L 8 ${VB_H - 4} L 3 ${VB_H - 9} L 3 9 Z`}
        opacity={0.92}
      />
      <path
        fill="rgb(105 120 78 / 0.45)"
        d={`M 3 9 L 3 3 L 9 3 M ${VB_W - 9} 3 L ${VB_W - 3} 3 L ${VB_W - 3} 9 M ${VB_W - 3} ${VB_H - 9} L ${VB_W - 3} ${VB_H - 3} L ${VB_W - 9} ${VB_H - 3} M 9 ${VB_H - 3} L 3 ${VB_H - 3} L 3 ${VB_H - 9}`}
      />
      <g filter={`url(#${glowId})`} fill={`url(#${fillId})`}>
        <text
          className="notranslate"
          x={VB_W / 2}
          y={VB_H / 2}
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="ui-monospace, 'Cascadia Code', 'Consolas', monospace"
          fontSize="17"
          fontWeight={600}
          letterSpacing="0.22em"
        >
          {APP_BRAND_NAME}
        </text>
      </g>
      <line
        x1={16}
        y1={VB_H - 10}
        x2={VB_W - 16}
        y2={VB_H - 10}
        stroke="rgb(105 120 78 / 0.35)"
        strokeWidth="0.75"
      />
    </svg>
    </span>
  );
}
