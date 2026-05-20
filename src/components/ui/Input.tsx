import { InputHTMLAttributes } from 'react';

const inputClass = "mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}
