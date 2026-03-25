"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export default function BlurImage({ style, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      style={{ ...style, opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
