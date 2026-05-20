'use client';

interface Props {
  password: string;
}

const calculateStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return score;
};

const strengthLabel = (score: number) => {
  if (score <= 1) return 'Weak';
  if (score <= 3) return 'Fair';
  return 'Strong';
};

export default function PasswordStrengthIndicator({ password }: Props) {
  const strength = calculateStrength(password);
  const label = strengthLabel(strength);

  return (
    <div className="flex items-center gap-2 mt-1" aria-label="password strength indicator">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i < strength ? 'bg-indigo-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}
