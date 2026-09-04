import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => void;
  className?: string;
}

export default function LogoutButton({ onLogout, className = '' }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className={`flex items-center gap-1.5 ${className}`.trim()}
    >
      <LogOut className="h-4 w-4" />
      Keluar
    </button>
  );
}
