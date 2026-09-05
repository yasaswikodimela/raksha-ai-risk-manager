import React from 'react';
import clsx from 'clsx';

function MetricCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Subtle gold accent on hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-raksha-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 mt-2">{subtitle}</p>
          )}
          
          {trend && (
            <p className={clsx("text-xs font-medium mt-2 flex items-center gap-1", trend.isPositive ? "text-emerald-600" : "text-amber-600")}>
              {trend.label}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-raksha-gold transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;