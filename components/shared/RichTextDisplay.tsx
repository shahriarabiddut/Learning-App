import { getRichTextStyles } from "@/lib/design/richTextStyles";
import React from "react";

interface RichTextDisplayProps {
  content?: string;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const RichTextDisplay = ({
  content,
  className = "",
  maxWidth = "full",
}: RichTextDisplayProps) => {
  if (!content) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <>
      <div
        className={`rich-text-display ${maxWidthClasses[maxWidth]} ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <style dangerouslySetInnerHTML={{ __html: getRichTextStyles() }} />
    </>
  );
};

export default RichTextDisplay;
