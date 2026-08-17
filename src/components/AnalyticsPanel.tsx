import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { UserError } from '../types';

interface AnalyticsPanelProps {
  errors: UserError[];
  theme: 'dark' | 'light';
}

interface DailyPoint {
  label: string;
  count: number;
}

const WEEKDAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MAX_CATEGORIES = 7;
const TREND_WINDOW_DAYS = 14;

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
}

/**
 * Profil analiz panosu: kategori bazlı hata dağılımı, son 14 günlük trend
 * ve "en çok nerede hata yapıyorsun" içgörüsü. Recharts yalnızca bu panel
 * lazy yüklendiği için ana bundle'a girmez.
 */
export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ errors, theme }) => {
  const palette = useMemo(
    () =>
      theme === 'dark'
        ? { accent: '#D6303F', grid: '#2C2C31', axis: '#9E9EA6', tooltipBg: '#1C1C1E', tooltipBorder: '#3A3A40' }
        : { accent: '#D6303F', grid: '#E6E6EB', axis: '#6B6B74', tooltipBg: '#FFFFFF', tooltipBorder: '#D9D9DF' },
    [theme]
  );

  // Kategori dağılımı: sayıya göre azalan, en fazla 7 kategori.
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    errors.forEach((e) => {
      if (e.rule_category) map.set(e.rule_category, (map.get(e.rule_category) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_CATEGORIES);
  }, [errors]);

  // Son 14 günün günlük hata sayıları (bugün dahil).
  const dailyTrend = useMemo<DailyPoint[]>(() => {
    const byDay = new Map<string, number>();
    errors.forEach((e) => {
      if (!e.created_at) return;
      const key = toLocalDateKey(new Date(e.created_at));
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    });

    const points: DailyPoint[] = [];
    const today = new Date();
    for (let i = TREND_WINDOW_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toLocalDateKey(d);
      points.push({ label: `${d.getDate()} ${WEEKDAY_LABELS[d.getDay()]}`, count: byDay.get(key) ?? 0 });
    }
    return points;
  }, [errors]);

  // Bu hafta (son 7 gün) vs geçen hafta (önceki 7 gün) karşılaştırması.
  const weeklyInsight = useMemo(() => {
    const counts = dailyTrend.map((p) => p.count);
    const thisWeek = counts.slice(-7).reduce((a, b) => a + b, 0);
    const lastWeek = counts.slice(-14, -7).reduce((a, b) => a + b, 0);
    return { thisWeek, lastWeek, diff: thisWeek - lastWeek };
  }, [dailyTrend]);

  const topCategory = categoryData[0];
  const topCategoryPct = topCategory && errors.length > 0 ? Math.round((topCategory.count / errors.length) * 100) : 0;

  const TrendIcon = weeklyInsight.diff > 0 ? TrendingUp : weeklyInsight.diff < 0 ? TrendingDown : Minus;

  const tooltipStyle = {
    backgroundColor: palette.tooltipBg,
    border: `1px solid ${palette.tooltipBorder}`,
    borderRadius: '10px',
    fontSize: '0.78rem',
    color: 'var(--text-primary)'
  };

  if (errors.length === 0) {
    return (
      <div className="rule-explanation-card" style={{ padding: '14px 16px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px' }}>
          Gelişim Panosu
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Henüz yeterli hata verisi toplanmadı. Soru ekledikçe kategori dağılımın ve haftalık trendin burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* İçgörü Banner'ı */}
      <div
        className="rule-explanation-card"
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: '1.5px solid var(--color-border)'
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
          Gelişim Panosu
        </h3>

        {topCategory && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            🎯 En çok{' '}
            <strong style={{ color: 'var(--color-red)' }}>{topCategory.name}</strong>{' '}
            kategorisinde hata yapıyorsun: {topCategory.count} hata (tüm hataların %{topCategoryPct}'i).
            Bu konuya ağırlık vererek en hızlı net artışı yakalayabilirsin.
          </p>
        )}

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendIcon size={14} style={{ color: weeklyInsight.diff < 0 ? '#22c55e' : weeklyInsight.diff > 0 ? 'var(--color-red)' : 'var(--text-muted)' }} />
          Bu hafta {weeklyInsight.thisWeek} yeni hata kaydı
          {weeklyInsight.lastWeek > 0
            ? ` (geçen hafta: ${weeklyInsight.lastWeek}${weeklyInsight.diff !== 0 ? `, ${weeklyInsight.diff > 0 ? '+' : ''}${weeklyInsight.diff}` : ''})`
            : ''}
        </p>
      </div>

      {/* Son 14 Gün Trendi */}
      <div className="rule-explanation-card" style={{ padding: '14px 16px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px 0' }}>Son 14 Günlük Hata Trendi</h4>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={dailyTrend} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={palette.accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: palette.axis }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={{ stroke: palette.grid }}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: palette.axis }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} hata`, 'Kayıt'] as [string, string]} />
            <Area type="monotone" dataKey="count" stroke={palette.accent} strokeWidth={2} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Kategori Dağılımı */}
      <div className="rule-explanation-card" style={{ padding: '14px 16px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px 0' }}>Kural Kategorisi Dağılımı</h4>
        <ResponsiveContainer width="100%" height={Math.max(140, categoryData.length * 30)}>
          <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: palette.axis }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 10, fill: palette.axis }}
              tickLine={false}
              axisLine={{ stroke: palette.grid }}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} hata`, 'Adet'] as [string, string]} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
              {categoryData.map((entry, index) => (
                <Cell key={entry.name} fill={index === 0 ? palette.accent : theme === 'dark' ? '#5A5A62' : '#B9B9C2'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {categoryData.length >= MAX_CATEGORIES && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
            Yalnızca en yüksek {MAX_CATEGORIES} kategori gösteriliyor.
          </p>
        )}
      </div>
    </div>
  );
};
