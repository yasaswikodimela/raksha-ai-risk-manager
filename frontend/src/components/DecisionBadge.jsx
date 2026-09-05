import React from 'react';
import clsx from 'clsx';
import { CheckCircle2, Eye, AlertCircle } from 'lucide-react';

function DecisionBadge({ decision }) {
  const normalizedDecision = (decision || 'unknown').toUpperCase();

  const styles = {
    ALLOW: "bg-emerald-100/50 text-emerald-800",
    VERIFY: "bg-blue-100/50 text-blue-800",
    REVIEW: "bg-rose-100/50 text-rose-800",
    UNKNOWN: "bg-slate-100 text-slate-600"
  };

  const icons = {
    ALLOW: CheckCircle2,
    VERIFY: Eye,
    REVIEW: AlertCircle,
    UNKNOWN: AlertCircle
  };

  const currentStyle = styles[normalizedDecision] || styles.UNKNOWN;
  const Icon = icons[normalizedDecision] || icons.UNKNOWN;

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium tracking-wide",
      currentStyle
    )}>
      <Icon className="w-3.5 h-3.5" />
      {normalizedDecision}
    </span>
  );
}

export default DecisionBadge;

