import React from "react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel = "Search",
}) => {
  return (
    <div
      style={{
        marginTop: "24px",
        marginBottom: "16px",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "10px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#111827",
          outline: "none",
          backgroundColor: "#ffffff",
        }}
      />
    </div>
  );
};

export default SearchBar;
