import React from 'react';

export default function FormSuccess({ message }: { message: string }) {
  return (
    <p className="mt-2 text-sm text-green-600" role="status">
      {message}
    </p>
  );
}
