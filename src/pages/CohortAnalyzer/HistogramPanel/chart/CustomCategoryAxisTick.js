import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import CustomChartTooltip from './CustomChartTooltip';

const formatCategoryLabel = (raw) => {
  if (raw === 'OtherFew') return 'Other Few';
  if (raw === 'OtherMany') return 'Other Many';
  return raw;
};

const getCharWidth = (fontSize) => {
  if (fontSize <= 8) return 4;
  if (fontSize <= 11) return 5;
  return Math.ceil(fontSize * 0.55);
};

/**
 * Word-wrap category labels within maxWidth; truncate the last line with "..." when needed.
 */
const wrapCategoryLabel = (text, maxWidth, fontSize, maxLines) => {
  const maxChars = Math.max(4, Math.floor(maxWidth / getCharWidth(fontSize)));

  if (text.length <= maxChars) {
    return { lines: [text], isTruncated: false };
  }

  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  const pushCurrent = () => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };

  words.forEach((word) => {
    if (lines.length >= maxLines) {
      return;
    }

    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      pushCurrent();
    }

    if (word.length > maxChars) {
      lines.push(`${word.substring(0, maxChars - 3)}...`);
      current = '';
      return;
    }

    current = word;
  });

  if (lines.length < maxLines && current) {
    lines.push(current);
  } else if (current && lines.length >= maxLines) {
    const lastIndex = maxLines - 1;
    const lastLine = lines[lastIndex] || '';
    const merged = lastLine ? `${lastLine} ${current}` : current;
    if (merged.length <= maxChars) {
      lines[lastIndex] = merged;
    } else {
      lines[lastIndex] = `${merged.substring(0, maxChars - 3)}...`;
    }
  }

  const resultLines = lines.slice(0, maxLines);
  if (resultLines.length === 0) {
    return {
      lines: [`${text.substring(0, maxChars - 3)}...`],
      isTruncated: true,
    };
  }

  const lastLine = resultLines[resultLines.length - 1] || '';
  const isTruncated = lastLine.indexOf('...') >= 0
    || resultLines.join(' ').replace(/\s+/g, ' ').trim().length < text.length;

  return { lines: resultLines, isTruncated };
};

/**
 * Y-axis category labels for horizontal bar charts — word-wrap, truncate, vertically centered on each bar row.
 */
const CustomCategoryAxisTick = ({
  x,
  y,
  payload,
  width = 100,
  fontSize = 10,
  lineHeight = fontSize,
  letterSpacing = 0,
  fill = '#666666',
  fontFamily = 'Nunito',
  fontWeight = 500,
  maxLines = 2,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const payloadValue = payload && payload.value != null ? payload.value : '';
  const fullText = formatCategoryLabel(payloadValue);
  const { lines, isTruncated } = wrapCategoryLabel(fullText, width, fontSize, maxLines);

  const lineGap = 2;
  const blockHeight = lines.length * lineHeight + (lines.length - 1) * lineGap;
  const firstLineY = -(blockHeight / 2) + (lineHeight / 2);

  const handleMouseEnter = (e) => {
    if (!isTruncated) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <g transform={`translate(${x},${y})`}>
        <title>{fullText}</title>
        {isTruncated && (
          <rect
            x={-width}
            y={-(blockHeight / 2) - 2}
            width={width}
            height={blockHeight + 4}
            fill="transparent"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
        {lines.map((line, index) => (
          <text
            key={index}
            x={-6}
            y={firstLineY + index * (lineHeight + lineGap)}
            dy={4}
            textAnchor="end"
            fill={fill}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            style={{
              letterSpacing: `${letterSpacing}px`,
              lineHeight: `${lineHeight}px`,
              pointerEvents: isTruncated ? 'none' : 'auto',
            }}
          >
            <title>{fullText}</title>
            {line}
          </text>
        ))}
      </g>
      {showTooltip && isTruncated && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <CustomChartTooltip active label={fullText} showValue={false} />
        </div>,
        document.body,
      )}
    </>
  );
};

export default CustomCategoryAxisTick;
