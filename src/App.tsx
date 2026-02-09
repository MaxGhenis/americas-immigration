import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip)

// ── DATA ──

const immigrantOrigins = [
  { region: 'Mexico', share: 22, americas: true },
  { region: 'Caribbean', share: 10, americas: true },
  { region: 'Central America', share: 8, americas: true },
  { region: 'South America', share: 8, americas: true },
  { region: 'Canada', share: 2, americas: true },
  { region: 'Asia', share: 27, americas: false },
  { region: 'Europe', share: 10, americas: false },
  { region: 'Sub-Saharan Africa', share: 5, americas: false },
  { region: 'Middle East / N. Africa', share: 4, americas: false },
]

const iceArrests = [
  { country: 'Mexico', arrests: 85363 },
  { country: 'Guatemala', arrests: 31231 },
  { country: 'Honduras', arrests: 24296 },
  { country: 'Venezuela', arrests: 14606 },
  { country: 'El Salvador', arrests: 10487 },
  { country: 'Colombia', arrests: 10194 },
  { country: 'Ecuador', arrests: 8802 },
  { country: 'Other Americas', arrests: 19549 },
  { country: 'Non-Americas', arrests: 16403 },
]

const TOTAL_ICE = 220931
const AMERICAS_ICE = 204528
const AMERICAS_SHARE_ICE = ((AMERICAS_ICE / TOTAL_ICE) * 100).toFixed(1)
const AMERICAS_SHARE_POP = 54

// ── COLORS ──

const TERRACOTTA_RAMP = [
  '#8b3a1a', '#a14424', '#b8502e', '#c4643a', '#d07848',
  '#dc8c58', '#e8a068', '#f0b888',
]
const GREY = '#c8c3ba'

const AMERICAS_DOUGHNUT = [
  '#a14424', '#c4643a', '#d4845e', '#e8a068', '#f0d4b8',
]
const OTHER_DOUGHNUT = ['#9b97a0', '#b5b1b8', '#cccad0', '#e0dfe3']

// ── HELPERS ──

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

function AnimatedBar({ value, max }: { value: number; max: number }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !triggered.current) {
          triggered.current = true
          // Small delay so animation is visible after scroll
          requestAnimationFrame(() => {
            setWidth((value / max) * 100)
          })
          obs.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value, max])

  return (
    <div className="bar-track" ref={ref}>
      <div className="bar-fill" style={{ width: `${width}%` }} />
    </div>
  )
}

// ── SECTIONS ──

function StatStrip() {
  return (
    <div className="stat-strip">
      <div className="stat-card">
        <div className="label">Foreign-born in US</div>
        <div className="value">~51M</div>
        <div className="detail">~54% from the Americas</div>
      </div>
      <div className="stat-card accent">
        <div className="label">ICE arrests (2025)</div>
        <div className="value">220,931</div>
        <div className="detail">92.6% from the Americas</div>
      </div>
      <div className="stat-card">
        <div className="label">Spanish speakers</div>
        <div className="value">43M</div>
        <div className="detail">~13% of US population</div>
      </div>
    </div>
  )
}

function OriginChart() {
  // MPI reports ~54% from the Americas; individual shares are approximate
  const americasTotal = 54

  const colors = immigrantOrigins.map((d, i) =>
    d.americas ? AMERICAS_DOUGHNUT[i] : OTHER_DOUGHNUT[i - 5]
  )

  const data = {
    labels: immigrantOrigins.map(d => d.region),
    datasets: [{
      data: immigrantOrigins.map(d => d.share),
      backgroundColor: colors,
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 6,
    }],
  }

  return (
    <div className="section-card">
      <h3>Where US immigrants come from</h3>
      <p className="source-line">
        Share of ~51M foreign-born · <a href="https://www.migrationpolicy.org/article/frequently-requested-statistics-immigrants-and-immigration-united-states" target="_blank" rel="noopener">MPI</a> analysis of <a href="https://www.census.gov/library/visualizations/interactive/foreign-born-population-2019-2023.html" target="_blank" rel="noopener">ACS 2023</a>
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 200, height: 200, flexShrink: 0 }}>
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              cutout: '52%',
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#1a1a2e',
                  titleFont: { family: "'DM Sans', sans-serif", size: 13 },
                  bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
                  callbacks: {
                    label: ctx => ` ${ctx.label}: ~${ctx.raw}%`,
                  },
                },
              },
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="legend">
            {immigrantOrigins.map((d, i) => (
              <div className="legend-item" key={d.region}>
                <span className="legend-dot" style={{ background: colors[i] }} />
                <span className="legend-label">{d.region}</span>
                <span className="legend-value">~{d.share}%</span>
              </div>
            ))}
          </div>
          <div className="legend-total">
            <span>Americas total</span>
            <span>~{americasTotal}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ICEChart() {
  const data = {
    labels: iceArrests.map(d => d.country),
    datasets: [{
      data: iceArrests.map(d => d.arrests),
      backgroundColor: [...TERRACOTTA_RAMP, GREY],
      borderWidth: 0,
      borderRadius: 3,
    }],
  }

  return (
    <div className="section-card">
      <h3>ICE arrests by nationality</h3>
      <p className="source-line">
        Jan 20 – Oct 15, 2025 · <a href="https://deportationdata.org" target="_blank" rel="noopener">UC Berkeley Deportation Data Project</a> (FOIA)
      </p>
      <div style={{ height: 320 }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1a1a2e',
                titleFont: { family: "'DM Sans', sans-serif", size: 13 },
                bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
                callbacks: {
                  label: ctx => {
                    const v = ctx.raw as number
                    return ` ${v.toLocaleString()} arrests (${((v / TOTAL_ICE) * 100).toFixed(1)}%)`
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(26,26,46,0.04)' },
                ticks: {
                  font: { family: "'DM Sans', sans-serif", size: 11 },
                  color: '#7c7c9a',
                  callback: v => fmt(v as number),
                },
              },
              y: {
                grid: { display: false },
                ticks: {
                  font: { family: "'DM Sans', sans-serif", size: 12 },
                  color: '#3d3d5c',
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

function ComparisonSection() {
  return (
    <div className="section-card">
      <h3>Immigration vs. enforcement</h3>
      <p className="source-line">Share from the Americas</p>
      <div className="comparison-bars">
        <div className="bar-group">
          <div className="bar-header">
            <span className="bar-label">Foreign-born population</span>
            <span className="bar-value">{AMERICAS_SHARE_POP}%</span>
          </div>
          <AnimatedBar value={AMERICAS_SHARE_POP} max={100} />
          <div className="bar-source">ACS 2023 via Migration Policy Institute</div>
        </div>
        <div className="bar-group">
          <div className="bar-header">
            <span className="bar-label">ICE arrests (2025)</span>
            <span className="bar-value">{AMERICAS_SHARE_ICE}%</span>
          </div>
          <AnimatedBar value={parseFloat(AMERICAS_SHARE_ICE)} max={100} />
          <div className="bar-source">UC Berkeley Deportation Data Project (FOIA)</div>
        </div>
      </div>
      <div className="callout">
        54% of the foreign-born population comes from the Americas, but {AMERICAS_SHARE_ICE}% of ICE arrests in this period involved people from the Americas. A <a href="https://knowledge.luskin.ucla.edu/wp-content/uploads/2025/10/Unseen_Latino-Ice-Arrests-Surge-Under-Trump_20251027.pdf" target="_blank" rel="noopener" style={{ color: 'var(--terracotta)' }}>UCLA Luskin study</a> found ~90% of arrests targeted "Latinos" — defined as individuals from Latin American countries, using the same FOIA data.
      </div>
    </div>
  )
}

function MetroSurge() {
  return (
    <div className="section-card">
      <h3>Operation Metro Surge</h3>
      <p className="source-line">
        Minneapolis · Dec 2025 – Jan 2026 · <a href="https://www.britannica.com/event/2025-26-Minnesota-ICE-Deployment" target="_blank" rel="noopener">Britannica</a>, <a href="https://www.cbsnews.com/minnesota/live-updates/ice-somali-immigrants-minneapolis-st-paul/" target="_blank" rel="noopener">CBS News</a>, <a href="https://www.dhs.gov/news/2026/01/19/ice-continues-remove-worst-worst-minneapolis-streets-dhs-law-enforcement-marks-3000" target="_blank" rel="noopener">DHS</a>
      </p>
      <div className="mini-stats">
        <div className="mini-stat">
          <div className="ms-value">3,000+</div>
          <div className="ms-label">People arrested</div>
        </div>
        <div className="mini-stat">
          <div className="ms-value">23</div>
          <div className="ms-label">From Somalia</div>
        </div>
        <div className="mini-stat">
          <div className="ms-value">~5%</div>
          <div className="ms-label">With violent records</div>
        </div>
        <div className="mini-stat">
          <div className="ms-value red">2</div>
          <div className="ms-label">US citizens killed</div>
        </div>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--ink-muted)', lineHeight: 1.55 }}>
        The operation was framed around fraud in the Somali-American community. Nationally, 118 of 220,931 ICE arrests (0.05%) in this period involved Somali nationals. Of the ~84,000 Somalis in the Twin Cities, 58% were born in the US, and 87% of foreign-born Somalis in Minnesota are naturalized citizens (<a href="https://www.pbs.org/newshour/nation/5-things-to-know-about-the-somali-community-in-minnesota-after-trumps-attacks" target="_blank" rel="noopener" style={{ color: 'var(--terracotta)' }}>PBS</a>).
      </div>
    </div>
  )
}

// ── MAIN ──

export default function App() {
  useEffect(() => {
    // Enable embed mode if loaded in iframe
    if (window !== window.parent) {
      document.body.classList.add('embed-mode')
    }
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="eyebrow">Data</div>
        <h1>Immigration & enforcement in the Americas</h1>
        <p className="subtitle">
          Data on where US immigrants come from, what languages they speak, and who ICE enforcement targets — compiled from official sources.
        </p>
      </header>

      <StatStrip />

      <div className="chart-grid">
        <OriginChart />
        <ICEChart />
      </div>

      <div className="chart-grid">
        <ComparisonSection />
        <MetroSurge />
      </div>

      <footer className="dashboard-footer">
        <p>
          Sources: <a href="https://www.migrationpolicy.org/article/frequently-requested-statistics-immigrants-and-immigration-united-states" target="_blank" rel="noopener">Migration Policy Institute</a> · <a href="https://www.census.gov/library/visualizations/interactive/foreign-born-population-2019-2023.html" target="_blank" rel="noopener">ACS 2023</a> · <a href="https://www.ice.gov/statistics" target="_blank" rel="noopener">ICE ERO</a> · <a href="https://deportationdata.org" target="_blank" rel="noopener">UC Berkeley Deportation Data Project</a> · <a href="https://knowledge.luskin.ucla.edu/wp-content/uploads/2025/10/Unseen_Latino-Ice-Arrests-Surge-Under-Trump_20251027.pdf" target="_blank" rel="noopener">UCLA Luskin</a>
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="https://github.com/MaxGhenis/americas-immigration" target="_blank" rel="noopener">Source code</a> · Dashboard by Max Ghenis
        </p>
      </footer>
    </div>
  )
}
