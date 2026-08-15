import React from 'react';

interface HighlightProps {
  text: string;
  wrongWord?: string;
  correctWord?: string;
}

/**
 * Renders question text with:
 * 1. Bold Roman numeral markers: (I), (II), (III), (IV), (V)
 * 2. Red styled underline on numbered phrases
 * 3. Handwritten red pen strikethrough & caret on the target wrong word
 */
export const HighlightedQuestionText: React.FC<HighlightProps> = ({
  text,
  wrongWord,
  correctWord
}) => {
  if (!text) return null;

  const romanRegex = /(\((?:I|II|III|IV|V|VI|VII|VIII|IX|X)\.?\))/gi;
  const parts = text.split(romanRegex);

  if (parts.length <= 1) {
    if (wrongWord && text.toLocaleLowerCase('tr-TR').includes(wrongWord.toLocaleLowerCase('tr-TR'))) {
      const idx = text.toLocaleLowerCase('tr-TR').indexOf(wrongWord.toLocaleLowerCase('tr-TR'));
      const before = text.substring(0, idx);
      const match = text.substring(idx, idx + wrongWord.length);
      const after = text.substring(idx + wrongWord.length);

      return (
        <span>
          {before}
          <del className="struck-word">{match}</del>
          {correctWord && (
            <span className="correction-badge-inline">
              <span className="caret-arrow">^</span>
              <span>{correctWord}</span>
            </span>
          )}
          {after}
        </span>
      );
    }
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, index) => {
        const isRomanMarker = /^\((?:I|II|III|IV|V|VI|VII|VIII|IX|X)\.?\)$/i.test(part.trim());
        
        if (isRomanMarker) {
          return (
            <span
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: 'var(--color-red)',
                backgroundColor: 'var(--color-red-light)',
                padding: '1px 6px',
                borderRadius: '6px',
                margin: '0 4px 0 2px',
                fontSize: '0.82rem',
                border: '1px solid var(--color-red-border)',
                verticalAlign: 'middle'
              }}
            >
              {part}
            </span>
          );
        }

        if (wrongWord && part.toLocaleLowerCase('tr-TR').includes(wrongWord.toLocaleLowerCase('tr-TR'))) {
          const idx = part.toLocaleLowerCase('tr-TR').indexOf(wrongWord.toLocaleLowerCase('tr-TR'));
          const before = part.substring(0, idx);
          const match = part.substring(idx, idx + wrongWord.length);
          const after = part.substring(idx + wrongWord.length);

          return (
            <span key={index}>
              {before}
              <del className="struck-word">{match}</del>
              {correctWord && (
                <span className="correction-badge-inline">
                  <span className="caret-arrow">^</span>
                  <span>{correctWord}</span>
                </span>
              )}
              {after}
            </span>
          );
        }

        const prevPart = parts[index - 1];
        const followsRoman = prevPart && /^\((?:I|II|III|IV|V|VI|VII|VIII|IX|X)\.?\)$/i.test(prevPart.trim());

        if (followsRoman) {
          const matchPhrase = part.match(/^(\s*[^.,!?;:()0-9\n]{1,45})(.*)$/s);
          if (matchPhrase) {
            const targetPhrase = matchPhrase[1];
            const rest = matchPhrase[2];

            return (
              <span key={index}>
                <span
                  style={{
                    textDecoration: 'underline',
                    textDecorationColor: 'var(--color-red)',
                    textUnderlineOffset: '4px',
                    textDecorationThickness: '2px',
                    fontWeight: 600
                  }}
                >
                  {targetPhrase}
                </span>
                {rest}
              </span>
            );
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
