"use client";

import React, { useState } from "react";

export default function ExpandableList({
  children,
  limit = 3,
}: {
  children: React.ReactNode;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = React.Children.toArray(children);
  const visibleItems = expanded ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div key={i} className={!expanded && i >= limit ? "hidden print:block" : "block"}>
            {item}
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 w-full py-2 text-center font-headline text-[13px] font-bold text-primary transition-all hover:text-blue-600 hover:underline no-print"
        >
          {expanded ? "Show less" : `View all ${items.length}`}
        </button>
      )}
    </>
  );
}
