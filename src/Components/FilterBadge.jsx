import React from "react";

const FilterBadge = ({ label, onRemove }) => {
  return (
    <span
      onClick={onRemove}
      className="
        flex items-center gap-1 cursor-pointer
        bg-[#D6C2A3] text-[#4A3B2C]
        px-3 py-1 rounded-full text-xs font-medium
        hover:bg-[#CBBBA0] transition
      "
    >
      {label} ✕
    </span>
  );
};

export default FilterBadge;
