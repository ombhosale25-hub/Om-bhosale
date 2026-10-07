import { AppItem, DayScreenTime } from '../types';
import { formatMinutes } from './initialData';

export function generateReportHtml(
  totalMinutes: number,
  dailyLimitHours: number,
  breaksCount: number,
  focusScore: number,
  apps: AppItem[],
  weeklyData: DayScreenTime[]
): string {
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const progressPercent = Math.min(Math.round((totalMinutes / (dailyLimitHours * 60)) * 100), 100);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smart Screen Time Report - ${dateStr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 40px 20px; }
    .card-box { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 36px; border: 1px solid #e2e8f0; }
    .header { border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; color: #4338ca; font-size: 24px; }
    .date { color: #64748b; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .stat-title { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #0f172a; font-family: monospace; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
    .progress-fill { height: 100%; width: ${progressPercent}%; background: #4f46e5; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    th { font-size: 12px; text-transform: uppercase; color: #64748b; background: #f8fafc; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .tag-ent { background: #fee2e2; color: #991b1b; }
    .tag-soc { background: #fce7f3; color: #9d174d; }
    .tag-prod { background: #dcfce7; color: #166534; }
    .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card-box">
    <div class="header">
      <div>
        <h1>📱 Smart Screen Time Report</h1>
        <div class="date">${dateStr}</div>
      </div>
      <div>
        <span style="background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 13px;">Archived Preview</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">Screen Time</div>
        <div class="stat-value">${formatMinutes(totalMinutes)}</div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Daily Goal</div>
        <div class="stat-value">${dailyLimitHours}h</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Target ceiling</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Breaks Taken</div>
        <div class="stat-value">${breaksCount}</div>
        <div style="font-size: 11px; color: #16a34a; margin-top: 8px;">Mindful intervals</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Focus Score</div>
        <div class="stat-value">${focusScore}%</div>
        <div style="font-size: 11px; color: #4338ca; margin-top: 8px;">Digital balance</div>
      </div>
    </div>

    <h3>📊 Tracked Applications</h3>
    <table>
      <thead>
        <tr>
          <th>Application</th>
          <th>Category</th>
          <th>Usage Today</th>
          <th>Daily Budget</th>
        </tr>
      </thead>
      <tbody>
        ${apps
          .map(
            (app) => `
          <tr>
            <td><strong>${app.name}</strong></td>
            <td><span class="tag ${app.category === 'productivity' ? 'tag-prod' : app.category === 'social' ? 'tag-soc' : 'tag-ent'}">${app.category}</span></td>
            <td><code>${formatMinutes(app.minutesUsed)}</code></td>
            <td><code>${app.dailyLimitMinutes ? formatMinutes(app.dailyLimitMinutes) : 'None'}</code></td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <h3 style="margin-top: 32px;">📈 7-Day History</h3>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Total Screen Time</th>
          <th>Productive</th>
          <th>Entertainment</th>
        </tr>
      </thead>
      <tbody>
        ${weeklyData
          .map(
            (w) => `
          <tr>
            <td><strong>${w.fullDay}</strong></td>
            <td><code>${w.hours}h ${w.minutes}m</code></td>
            <td>${w.productiveHours}h</td>
            <td>${w.entertainmentHours}h</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      Generated automatically by Smart Screen Time Manager & Saved to Google Drive
    </div>
  </div>
</body>
</html>`;
}
