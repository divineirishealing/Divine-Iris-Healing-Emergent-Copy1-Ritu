import React from 'react';
import { HEADING, CONTAINER, applySectionStyle } from '../lib/designTokens';
import { renderMarkdown } from '../lib/renderMarkdown';

const CustomSection = ({ sectionConfig }) => {
  if (!sectionConfig) return null;
  return (
    <section data-testid={`custom-section-${sectionConfig.id}`} className="py-20 bg-white">
      <div className={CONTAINER}>
        <div className="text-center mb-10">
          {sectionConfig.title && (
            <h2 className="mb-3" style={applySectionStyle(sectionConfig.title_style, { ...HEADING, fontSize: 'clamp(1.5rem, 3vw, 2rem)' })}>
              {sectionConfig.title}
            </h2>
          )}
          {sectionConfig.subtitle && (
            <p className="text-gray-500 text-sm max-w-2xl mx-auto" style={applySectionStyle(sectionConfig.subtitle_style, {})}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(sectionConfig.subtitle) }} />
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomSection;
