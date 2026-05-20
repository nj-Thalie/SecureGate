import React from 'react';

export default function FormError({ message }: { message: string }) {
  return (
    <p className="mt-2 text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}
