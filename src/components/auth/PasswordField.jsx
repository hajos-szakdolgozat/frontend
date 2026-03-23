import { useState } from "react";

const PasswordField = ({ value, onChange, placeholder, autoComplete, error }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="auth-field">
      <div className="auth-field__input-wrap">
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="auth-toggle"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? `Hide ${placeholder}` : `Show ${placeholder}`}
        >
          {isVisible ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 3.3 20.7 22" />
              <path d="M9.5 9.8a3 3 0 0 0 4.7 3.7" />
              <path d="M7.9 6.6A18.8 18.8 0 0 1 12 6c6.4 0 10 6 10 6a16.2 16.2 0 0 1-3.2 4.1" />
              <path d="M14.1 17.4A18.7 18.7 0 0 1 12 18c-6.4 0-10-6-10-6a16 16 0 0 1 3.2-4.1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <span className="auth-error">{error[0]}</span>}
    </div>
  );
};

export default PasswordField;
