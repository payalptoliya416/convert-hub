import React, { useState } from "react";
import {
  LockKeyhole,
  Copy,
  Check,
  RefreshCcw,
  Eye,
  EyeOff,
} from "lucide-react";

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);

  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Secure random character
  const getRandomCharacter = (characters: string) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);

    return characters[array[0] % characters.length];
  };

  // Generate password
  const generatePassword = (
    newLength = length,
    newUppercase = uppercase,
    newLowercase = lowercase,
    newNumbers = numbers,
    newSymbols = symbols,
  ) => {
    let availableChars = "";
    let requiredChars = "";

    // Uppercase
    if (newUppercase) {
      availableChars += uppercaseChars;
      requiredChars += getRandomCharacter(uppercaseChars);
    }

    // Lowercase
    if (newLowercase) {
      availableChars += lowercaseChars;
      requiredChars += getRandomCharacter(lowercaseChars);
    }

    // Numbers
    if (newNumbers) {
      availableChars += numberChars;
      requiredChars += getRandomCharacter(numberChars);
    }

    // Symbols
    if (newSymbols) {
      availableChars += symbolChars;
      requiredChars += getRandomCharacter(symbolChars);
    }

    // If no option is selected
    if (!availableChars) {
      setPassword("");
      setCopied(false);
      return;
    }

    let result = requiredChars;

    // Fill remaining characters
    while (result.length < newLength) {
      result += getRandomCharacter(availableChars);
    }

    // Shuffle password
    const passwordArray = result.split("");

    for (let i = passwordArray.length - 1; i > 0; i--) {
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);

      const j = randomArray[0] % (i + 1);

      [passwordArray[i], passwordArray[j]] = [
        passwordArray[j],
        passwordArray[i],
      ];
    }

    setPassword(passwordArray.join(""));
    setCopied(false);
    setShowPassword(true);
  };

  // Copy password
  const copyPassword = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // Reset
  const resetGenerator = () => {
    const defaultLength = 16;
    const defaultUppercase = true;
    const defaultLowercase = true;
    const defaultNumbers = true;
    const defaultSymbols = true;

    setLength(defaultLength);
    setUppercase(defaultUppercase);
    setLowercase(defaultLowercase);
    setNumbers(defaultNumbers);
    setSymbols(defaultSymbols);

    setPassword("");
    setCopied(false);
    setShowPassword(true);
  };

  // Password strength
  const getStrength = () => {
    if (!password) {
      return {
        label: "Not generated",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        width: "35%",
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        width: "65%",
      };
    }

    return {
      label: "Strong",
      width: "100%",
    };
  };

  const strength = getStrength();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-10 text-[var(--text-heading)]">
      <div className="">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
          <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
            <LockKeyhole className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[var(--text-heading)]">
              Password Generator
            </h1>

            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Generate strong and secure passwords instantly with customizable
              options.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="mx-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-60)] p-5 sm:p-7 mt-8">
          {/* Generated Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-heading)]">
              Generated Password
            </label>

            <div className="flex min-h-[58px] items-center gap-2 rounded-xl border border-[var(--border-hover)] bg-[var(--bg-base)] p-2">
              <div className="min-w-0 flex-1 overflow-x-auto px-3 py-2">
                <span className="whitespace-nowrap font-mono text-sm text-[var(--text-primary)] sm:text-base">
                  {password
                    ? showPassword
                      ? password
                      : "•".repeat(password.length)
                    : "Click Generate Password"}
                </span>
              </div>

              {password && (
                <>
                  {/* Show / Hide */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-heading)]"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                  {/* Copy */}
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-[var(--text-heading)] transition hover:bg-violet-500"
                    title="Copy password"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Password Strength */}
          {password && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Password Strength
                </span>

                <span className="text-xs font-semibold text-violet-400">
                  {strength.label}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          )}

          {/* Password Length */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-[var(--text-heading)]">
                Password Length
              </label>

              <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-400">
                {length}
              </span>
            </div>

            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => {
                const newLength = Number(e.target.value);

                setLength(newLength);

                // Regenerate password when length changes
                if (password) {
                  generatePassword(
                    newLength,
                    uppercase,
                    lowercase,
                    numbers,
                    symbols,
                  );
                }
              }}
              className="w-full cursor-pointer accent-violet-500"
            />

            <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          {/* Password Options */}
         <div className="mt-8">
  <h2 className="mb-4 text-sm font-semibold text-[var(--text-heading)]">
    Password Options
  </h2>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {/* Uppercase */}
    <label className="flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 transition hover:border-[var(--border-hover)]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
          Uppercase Letters
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">A-Z</p>
      </div>

      <input
        type="checkbox"
        checked={uppercase}
        onChange={(e) => {
          const value = e.target.checked;

          if (!value && !lowercase && !numbers && !symbols) {
            return;
          }

          setUppercase(value);

          if (password) {
            generatePassword(
              length,
              value,
              lowercase,
              numbers,
              symbols
            );
          }
        }}
        className="h-5 w-5 shrink-0 cursor-pointer accent-violet-600"
      />
    </label>

    {/* Lowercase */}
    <label className="flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 transition hover:border-[var(--border-hover)]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
          Lowercase Letters
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">a-z</p>
      </div>

      <input
        type="checkbox"
        checked={lowercase}
        onChange={(e) => {
          const value = e.target.checked;

          if (!value && !uppercase && !numbers && !symbols) {
            return;
          }

          setLowercase(value);

          if (password) {
            generatePassword(
              length,
              uppercase,
              value,
              numbers,
              symbols
            );
          }
        }}
        className="h-5 w-5 shrink-0 cursor-pointer accent-violet-600"
      />
    </label>

    {/* Numbers */}
    <label className="flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 transition hover:border-[var(--border-hover)]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
          Numbers
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">0-9</p>
      </div>

      <input
        type="checkbox"
        checked={numbers}
        onChange={(e) => {
          const value = e.target.checked;

          if (!value && !uppercase && !lowercase && !symbols) {
            return;
          }

          setNumbers(value);

          if (password) {
            generatePassword(
              length,
              uppercase,
              lowercase,
              value,
              symbols
            );
          }
        }}
        className="h-5 w-5 shrink-0 cursor-pointer accent-violet-600"
      />
    </label>

    {/* Symbols */}
    <label className="flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-4 transition hover:border-[var(--border-hover)]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
          Symbols
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">!@#$%^&*</p>
      </div>

      <input
        type="checkbox"
        checked={symbols}
        onChange={(e) => {
          const value = e.target.checked;

          if (!value && !uppercase && !lowercase && !numbers) {
            return;
          }

          setSymbols(value);

          if (password) {
            generatePassword(
              length,
              uppercase,
              lowercase,
              numbers,
              value
            );
          }
        }}
        className="h-5 w-5 shrink-0 cursor-pointer accent-violet-600"
      />
    </label>
  </div>
</div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => generatePassword()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-[var(--text-heading)] shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500"
            >
              <RefreshCcw className="h-5 w-5" />
              Generate Password
            </button>

            <button
              type="button"
              onClick={resetGenerator}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-hover)] px-6 py-3.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-slate-600 hover:text-[var(--text-heading)]"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
