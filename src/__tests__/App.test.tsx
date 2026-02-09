import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

// Mock chart.js and react-chartjs-2 since jsdom has no canvas
vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  ArcElement: {},
  BarElement: {},
  CategoryScale: {},
  LinearScale: {},
  Tooltip: {},
}))

vi.mock('react-chartjs-2', () => ({
  Doughnut: ({ data }: any) => (
    <div data-testid="doughnut-chart">
      {data.labels?.map((label: string, i: number) => (
        <span key={i}>{label}: {data.datasets[0].data[i]}</span>
      ))}
    </div>
  ),
  Bar: ({ data }: any) => (
    <div data-testid="bar-chart">
      {data.labels?.map((label: string, i: number) => (
        <span key={i}>{label}: {data.datasets[0].data[i]}</span>
      ))}
    </div>
  ),
}))

// Mock HTMLCanvasElement.getContext for any residual canvas usage
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any
})

describe('App dashboard', () => {
  it('renders the dashboard title', () => {
    render(<App />)
    expect(
      screen.getByText('Immigration & enforcement in the Americas')
    ).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<App />)
    expect(
      screen.getByText(/Data on where US immigrants come from/)
    ).toBeInTheDocument()
  })
})

describe('StatStrip', () => {
  it('shows the foreign-born population stat "~50M"', () => {
    render(<App />)
    expect(screen.getByText('~50M')).toBeInTheDocument()
  })

  it('shows the ICE arrests stat "220,931"', () => {
    render(<App />)
    expect(screen.getByText('220,931')).toBeInTheDocument()
  })

  it('shows the Spanish speakers stat "43M"', () => {
    render(<App />)
    expect(screen.getByText('43M')).toBeInTheDocument()
  })

  it('shows stat labels', () => {
    render(<App />)
    expect(screen.getByText('Foreign-born in US')).toBeInTheDocument()
    // "ICE arrests (2025)" appears in both StatStrip and ComparisonSection
    const iceLabels = screen.getAllByText('ICE arrests (2025)')
    expect(iceLabels.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Spanish speakers')).toBeInTheDocument()
  })

  it('shows stat details', () => {
    render(<App />)
    expect(screen.getByText('~53% from the Americas')).toBeInTheDocument()
    expect(screen.getByText('92.6% from the Americas')).toBeInTheDocument()
    expect(screen.getByText('~13% of US population')).toBeInTheDocument()
  })
})

describe('OriginChart section', () => {
  it('renders "Where US immigrants come from" heading', () => {
    render(<App />)
    expect(
      screen.getByText('Where US immigrants come from')
    ).toBeInTheDocument()
  })

  it('shows ACS 2024 source reference', () => {
    render(<App />)
    // "ACS 2024" appears in OriginChart source line and ComparisonSection bar source
    const acsRefs = screen.getAllByText(/ACS 2024/)
    expect(acsRefs.length).toBeGreaterThanOrEqual(1)
  })

  it('shows Americas total of 53%', () => {
    render(<App />)
    // "53%" appears in both OriginChart legend-total and ComparisonSection bar-value
    const values = screen.getAllByText('53%')
    expect(values.length).toBeGreaterThanOrEqual(1)
  })

  it('renders a doughnut chart', () => {
    render(<App />)
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
  })
})

describe('ICEChart section', () => {
  it('renders "ICE arrests by nationality" heading', () => {
    render(<App />)
    expect(
      screen.getByText('ICE arrests by nationality')
    ).toBeInTheDocument()
  })

  it('shows the bar chart', () => {
    render(<App />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})

describe('Toggle buttons', () => {
  it('renders "Berkeley FOIA" toggle', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: 'Berkeley FOIA' })
    ).toBeInTheDocument()
  })

  it('renders "ICE ERO" toggle', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: 'ICE ERO' })
    ).toBeInTheDocument()
  })

  it('renders "Count" toggle', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: 'Count' })
    ).toBeInTheDocument()
  })

  it('renders "% of total" toggle', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: '% of total' })
    ).toBeInTheDocument()
  })
})

describe('ICE ERO source toggle', () => {
  it('clicking "ICE ERO" shows fiscal year selector buttons', () => {
    render(<App />)
    const eroButton = screen.getByRole('button', { name: 'ICE ERO' })
    fireEvent.click(eroButton)

    expect(screen.getByRole('button', { name: 'FY 2021' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FY 2022' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FY 2023' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FY 2024' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FY 2025 Q1' })).toBeInTheDocument()
  })

  it('clicking "ICE ERO" shows ICE ERO source link', () => {
    render(<App />)
    const eroButton = screen.getByRole('button', { name: 'ICE ERO' })
    fireEvent.click(eroButton)

    expect(screen.getByText('ICE ERO official statistics')).toBeInTheDocument()
  })
})

describe('Berkeley FOIA source', () => {
  it('default state shows Berkeley time period', () => {
    render(<App />)
    // Berkeley is the default source, so the time period should be visible
    expect(
      screen.getByRole('button', { name: /Jan 20 – Oct 15, 2025/ })
    ).toBeInTheDocument()
  })

  it('switching to ERO and back shows Berkeley time period', () => {
    render(<App />)

    // Switch to ERO
    fireEvent.click(screen.getByRole('button', { name: 'ICE ERO' }))
    // FY buttons should appear
    expect(screen.getByRole('button', { name: 'FY 2024' })).toBeInTheDocument()

    // Switch back to Berkeley
    fireEvent.click(screen.getByRole('button', { name: 'Berkeley FOIA' }))
    expect(
      screen.getByRole('button', { name: /Jan 20 – Oct 15, 2025/ })
    ).toBeInTheDocument()
  })
})

describe('ComparisonSection', () => {
  it('renders "Immigration vs. enforcement" heading', () => {
    render(<App />)
    expect(
      screen.getByText('Immigration vs. enforcement')
    ).toBeInTheDocument()
  })

  it('shows the share from the Americas subtitle', () => {
    render(<App />)
    expect(
      screen.getByText('Share from the Americas')
    ).toBeInTheDocument()
  })

  it('shows foreign-born population bar label', () => {
    render(<App />)
    expect(
      screen.getByText('Foreign-born population')
    ).toBeInTheDocument()
  })

  it('shows 53% for foreign-born population', () => {
    render(<App />)
    // The comparison section shows "53%" as the Americas share of population
    const values = screen.getAllByText('53%')
    expect(values.length).toBeGreaterThanOrEqual(1)
  })

  it('shows 92.6% for ICE arrests', () => {
    render(<App />)
    // AMERICAS_SHARE_ICE = ((204528 / 220931) * 100).toFixed(1) = "92.6"
    expect(screen.getByText('92.6%')).toBeInTheDocument()
  })
})

describe('MetroSurge section', () => {
  it('renders "Operation Metro Surge" heading', () => {
    render(<App />)
    expect(
      screen.getByText('Operation Metro Surge')
    ).toBeInTheDocument()
  })

  it('shows key stats: 3,000+ arrests', () => {
    render(<App />)
    expect(screen.getByText('3,000+')).toBeInTheDocument()
  })

  it('shows 23 from Somalia', () => {
    render(<App />)
    expect(screen.getByText('23')).toBeInTheDocument()
    expect(screen.getByText('From Somalia')).toBeInTheDocument()
  })

  it('shows ~5% with violent records', () => {
    render(<App />)
    expect(screen.getByText('~5%')).toBeInTheDocument()
  })

  it('shows 2 US citizens killed', () => {
    render(<App />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('US citizens killed')).toBeInTheDocument()
  })

  it('shows Minneapolis source line', () => {
    render(<App />)
    expect(screen.getByText(/Minneapolis/)).toBeInTheDocument()
  })
})

describe('Data integrity', () => {
  it('Americas share in immigrantOrigins sums close to americasTotal (53%)', () => {
    // Replicate the data from App.tsx
    const immigrantOrigins = [
      { region: 'Mexico', share: 22.2, americas: true },
      { region: 'Caribbean', share: 10.5, americas: true },
      { region: 'Central America', share: 9.1, americas: true },
      { region: 'South America', share: 9.6, americas: true },
      { region: 'Canada', share: 1.6, americas: true },
      { region: 'Asia', share: 28.1, americas: false },
      { region: 'Europe', share: 9.7, americas: false },
      { region: 'Sub-Saharan Africa', share: 5.0, americas: false },
      { region: 'Middle East / N. Africa', share: 3.6, americas: false },
    ]

    const americasSum = immigrantOrigins
      .filter(d => d.americas)
      .reduce((sum, d) => sum + d.share, 0)

    const americasTotal = 53

    // The individual shares should sum to approximately 53%
    // (within 1 percentage point, since the shares are rounded)
    expect(Math.abs(americasSum - americasTotal)).toBeLessThan(1)
  })

  it('Berkeley arrest data sums to BERKELEY_TOTAL', () => {
    const berkeleyArrests = [
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

    const sum = berkeleyArrests.reduce((s, d) => s + d.arrests, 0)
    expect(sum).toBe(220931)
  })

  it('Berkeley Americas arrests sum to BERKELEY_AMERICAS', () => {
    const berkeleyArrests = [
      { country: 'Mexico', arrests: 85363 },
      { country: 'Guatemala', arrests: 31231 },
      { country: 'Honduras', arrests: 24296 },
      { country: 'Venezuela', arrests: 14606 },
      { country: 'El Salvador', arrests: 10487 },
      { country: 'Colombia', arrests: 10194 },
      { country: 'Ecuador', arrests: 8802 },
      { country: 'Other Americas', arrests: 19549 },
    ]

    const americasSum = berkeleyArrests.reduce((s, d) => s + d.arrests, 0)
    expect(americasSum).toBe(204528)
  })

  it('AMERICAS_SHARE_ICE computes correctly from Berkeley data', () => {
    const BERKELEY_AMERICAS = 204528
    const BERKELEY_TOTAL = 220931
    const computed = ((BERKELEY_AMERICAS / BERKELEY_TOTAL) * 100).toFixed(1)
    expect(computed).toBe('92.6')
  })
})

describe('Footer', () => {
  it('renders the footer with source links', () => {
    render(<App />)
    expect(screen.getByText(/Dashboard by Max Ghenis/)).toBeInTheDocument()
  })

  it('has a link to the GitHub repo', () => {
    render(<App />)
    const link = screen.getByText('Source code')
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/MaxGhenis/americas-immigration'
    )
  })
})
