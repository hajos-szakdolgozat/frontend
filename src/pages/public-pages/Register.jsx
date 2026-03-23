import { useState } from "react";
import { Link } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useAuthContext from "../../hooks/useAuthContext";
import PasswordField from "../../components/auth/PasswordField";
import "./css/AuthPages.css";

const phoneRules = {
  hu: {
    localPlaceholder: "30 123 4567",
    localRegex: /^(?:1\d{7}|(?:20|30|31|50|70)\d{7})$/,
    errorText: "Magyar szamhoz 8-9 szamjegy kell, pl: 30 123 4567",
  },
  us: {
    localPlaceholder: "201 555 5555",
    localRegex: /^\d{10}$/,
    errorText: "US szamhoz 10 szamjegy kell, pl: 201 555 5555",
  },
  gb: {
    localPlaceholder: "7700 900123",
    localRegex: /^\d{10}$/,
    errorText: "UK szamhoz 10 szamjegy kell, pl: 7700 900123",
  },
  ro: {
    localPlaceholder: "712 345 678",
    localRegex: /^\d{9}$/,
    errorText: "Roman szamhoz 9 szamjegy kell, pl: 712 345 678",
  },
  de: {
    localPlaceholder: "1512 3456789",
    localRegex: /^\d{10,11}$/,
    errorText: "Nemet szamhoz 10-11 szamjegy kell, pl: 1512 3456789",
  },
  at: {
    localPlaceholder: "664 1234567",
    localRegex: /^\d{9,11}$/,
    errorText: "Osztrak szamhoz 9-11 szamjegy kell, pl: 664 1234567",
  },
  hr: {
    localPlaceholder: "91 123 4567",
    localRegex: /^\d{8,9}$/,
    errorText: "Horvat szamhoz 8-9 szamjegy kell, pl: 91 123 4567",
  },
  rs: {
    localPlaceholder: "60 1234567",
    localRegex: /^\d{8,9}$/,
    errorText: "Szerb szamhoz 8-9 szamjegy kell, pl: 60 1234567",
  },
};

const defaultRule = {
  localPlaceholder: "123 456 789",
  localRegex: /^\d{6,12}$/,
  errorText: "A telefonszam formatuma hibas.",
};

const Register = () => {
  const [name, setName] = useState("");
  // const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneValue, setPhoneValue] = useState("36");
  const [phoneCountry, setPhoneCountry] = useState("hu");
  const [phoneDialCode, setPhoneDialCode] = useState("36");
  const [phoneError, setPhoneError] = useState("");
  const [password_confirmation, setPassword_confirmation] = useState("");
  const { register, errors } = useAuthContext();

  const selectedPhoneRule = phoneRules[phoneCountry] || defaultRule;

  const sanitizePhone = (value) => value.replace(/\D/g, "");

  const handleRegister = async (event) => {
    event.preventDefault();

    const digits = sanitizePhone(phoneValue);
    const normalizedLocalPhone = digits.startsWith(phoneDialCode)
      ? digits.slice(phoneDialCode.length)
      : digits;
    const localRegex = selectedPhoneRule.localRegex || defaultRule.localRegex;
    if (!localRegex.test(normalizedLocalPhone)) {
      setPhoneError(selectedPhoneRule.errorText);
      return;
    }

    setPhoneError("");

    register({
      name,
      email,
      phone_number: `+${phoneDialCode}${normalizedLocalPhone}`,
      password,
      password_confirmation,
    });
  };

  return (
    <section className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Create account</h1>
            <p>Join now to manage bookings and keep your favorite boats close.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First Name"
                autoComplete="name"
              />
              {errors.name && <span className="auth-error">{errors.name[0]}</span>}
            </div>

            <div className="auth-field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
              {errors.email && <span className="auth-error">{errors.email[0]}</span>}
            </div>

            <div className="auth-field">
              <PhoneInput
                country={phoneCountry}
                value={phoneValue}
                onChange={(value, countryData) => {
                  setPhoneValue(value);
                  setPhoneCountry(countryData?.countryCode || "hu");
                  setPhoneDialCode(String(countryData?.dialCode || "36"));
                  if (phoneError) {
                    setPhoneError("");
                  }
                }}
                preferredCountries={["hu", "us", "gb", "ro", "de", "at", "hr", "rs"]}
                enableSearch
                autocompleteSearch
                disableSearchIcon
                inputProps={{
                  name: "phone_number",
                  required: true,
                  autoComplete: "tel",
                  placeholder: selectedPhoneRule.localPlaceholder,
                }}
                containerClass="auth-phone-wrapper"
                buttonClass="auth-phone-flag-btn"
                inputClass="auth-phone-input"
                dropdownClass="auth-phone-dropdown"
                searchClass="auth-phone-search"
                specialLabel=""
              />
              {phoneError && <span className="auth-error">{phoneError}</span>}
              {errors.phone_number && <span className="auth-error">{errors.phone_number[0]}</span>}
            </div>

            <PasswordField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              error={errors.password}
            />

            <PasswordField
              value={password_confirmation}
              onChange={(e) => setPassword_confirmation(e.target.value)}
              placeholder="Password Confirmation"
              autoComplete="new-password"
              error={errors.password_confirmation}
            />

            <button className="auth-button" type="submit">
              Register
            </button>
          </form>

          <div className="auth-card__links">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
