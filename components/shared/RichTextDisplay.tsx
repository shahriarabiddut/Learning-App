import React from "react";

const RichTextDisplay = ({
  content,
  className = "",
}: {
  content?: string;
  className?: string;
}) => {
  if (!content) return null;

  return (
    <div
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        lineHeight: 1.6,
      }}
    />
  );
};

export default RichTextDisplay;
