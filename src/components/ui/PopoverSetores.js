import React, { useRef, useState, useEffect } from "react";

export default function PopoverSetores({ setores }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <span className="relative" ref={ref}>
      <span
        className="cursor-pointer text-xs text-blue-600 underline ml-1"
        onClick={e => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        ...
      </span>
      {open && (
        <div
          className="absolute z-50 left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg p-3 animate-fade-in"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="font-semibold mb-1 text-gray-700">Setores:</div>
          <ul className="list-disc pl-4">
            {setores.map((cat, idx) => (
              <li key={cat + idx} className="text-gray-800 text-sm mb-0.5">{cat}</li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
} 