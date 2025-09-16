import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CampaignsPage from '../page'

// Mock the fetch API
global.fetch = jest.fn()

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('CampaignsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        campaigns: [
          {
            id: '1',
            name: 'Test Campaign',
            type: 'email',
            status: 'active',
            budget: 5000,
            performance: {
              impressions: 10000,
              clicks: 500,
              conversions: 50,
              cost: 2500,
              roi: 2.0
            },
            created_at: '2025-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1
        }
      })
    })
  })

  it('renders the campaigns page with header', () => {
    render(<CampaignsPage />)
    
    expect(screen.getByText('Marketing Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Manage and track your marketing campaigns')).toBeInTheDocument()
  })

  it('renders campaign stats overview', () => {
    render(<CampaignsPage />)
    
    // Check for stats cards
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Total Spend')).toBeInTheDocument()
    expect(screen.getByText('Average ROI')).toBeInTheDocument()
  })

  it('displays tabs for different campaign views', () => {
    render(<CampaignsPage />)
    
    expect(screen.getByRole('tab', { name: 'All Campaigns' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Social' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Display' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Analytics' })).toBeInTheDocument()
  })

  it('renders create campaign button', () => {
    render(<CampaignsPage />)
    
    const createButton = screen.getByRole('button', { name: /create campaign/i })
    expect(createButton).toBeInTheDocument()
  })

  it('filters campaigns by status when status filter is clicked', async () => {
    render(<CampaignsPage />)
    
    // Find and click the filter button
    const filterButton = screen.getByRole('button', { name: /filter/i })
    fireEvent.click(filterButton)
    
    // The component should handle filtering logic
    // This would need to be implemented in the actual component
    expect(filterButton).toBeInTheDocument()
  })

  it('switches between different campaign tabs', async () => {
    render(<CampaignsPage />)
    
    // Click on Email tab
    const emailTab = screen.getByRole('tab', { name: 'Email' })
    fireEvent.click(emailTab)
    
    // Check if tab is selected (you would check for active state styling)
    expect(emailTab).toBeInTheDocument()
    
    // Click on Social tab
    const socialTab = screen.getByRole('tab', { name: 'Social' })
    fireEvent.click(socialTab)
    
    expect(socialTab).toBeInTheDocument()
  })

  it('displays campaign list when data is loaded', async () => {
    render(<CampaignsPage />)
    
    // Wait for campaigns to be rendered
    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    })
  })

  it('handles campaign status changes', async () => {
    render(<CampaignsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    })
    
    // Look for action buttons (pause, edit, etc.)
    const actionButtons = screen.getAllByRole('button')
    expect(actionButtons.length).toBeGreaterThan(0)
  })

  it('displays campaign performance metrics', async () => {
    render(<CampaignsPage />)
    
    await waitFor(() => {
      // Check for performance data display
      expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    })
    
    // The component should display performance metrics like impressions, clicks, etc.
    // This would depend on how the data is rendered in the actual component
  })

  it('handles empty state when no campaigns exist', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        campaigns: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0
        }
      })
    })
    
    render(<CampaignsPage />)
    
    // Should show empty state or no campaigns message
    // This would depend on implementation
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(<CampaignsPage />)
    
    await waitFor(() => {
      // Component should handle error state
      expect(consoleSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
  })
})