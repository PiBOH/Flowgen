'use client';

import { ReactNode, useId, isValidElement, cloneElement, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
}

export default function Tooltip({ children, text }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement, {
        'aria-describedby': id,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
          const existingOnClick = (children as React.ReactElement).props?.onClick;
          if (existingOnClick) existingOnClick(e);
        },
      })
    : children;

  return (
    <div
      className="group relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {trigger}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md transition-opacity z-50 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {text}
      </span>
    </div>
  );
}
