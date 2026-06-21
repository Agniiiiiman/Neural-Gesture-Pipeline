import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral',
  color = 'var(--accent-primary)'
}) => {
  return (
    <div className="glass-panel glass-panel-hover metric-card animate-fade-in">
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div className="icon-wrapper" style={{ backgroundColor: `rgba(from ${color} r g b / 0.1)`, color: color }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="card-body">
        <h3 className="card-value">{value}</h3>
        {trend && (
          <span className={`card-trend ${trendType}`}>
            {trend}
          </span>
        )}
      </div>

      <style jsx>{`
        .metric-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 180px;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--foreground-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-value {
          font-size: 1.8rem;
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--foreground);
        }

        .card-trend {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .card-trend.positive {
          color: var(--success);
        }

        .card-trend.negative {
          color: var(--danger);
        }

        .card-trend.neutral {
          color: var(--foreground-muted);
        }
      `}</style>
    </div>
  );
};
