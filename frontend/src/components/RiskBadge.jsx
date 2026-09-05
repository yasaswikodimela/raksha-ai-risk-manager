import React from 'react';
import clsx from 'clsx';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

function RiskBadge({ level, showIcon = true }) {
  const normalizedLevel = (level || 'unknown').toUpperCase();

  const styles = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
    UNKNOWN: "bg-slate-50 text-slate-600 border-slate-200"
  };

  const icons = {
    LOW: ShieldCheck,
    MEDIUM: Shield,
    HIGH: ShieldAlert,
    UNKNOWN: Shield
  };

  const currentStyle = styles[normalizedLevel] || styles.UNKNOWN;
  const Icon = icons[normalizedLevel] || icons.UNKNOWN;

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
      currentStyle
    )}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {normalizedLevel}
    </span>
  );
}

export default RiskBadge;

