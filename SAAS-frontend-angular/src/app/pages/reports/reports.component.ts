import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService, ReportStats } from '../../services/reports.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  stats: ReportStats | null = null;

  summaryTiles: Array<{ label: string; value: string; trend: string }> = [];
  cadenceBreakdown: Array<{ label: string; value: number }> = [];
  momentumTimeline: Array<{ day: string; value: number }> = [];

  constructor(
    private readonly reportsService: ReportsService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.currentUser) {
      this.error = 'Please log in to view reports';
      this.loading = false;
      return;
    }

    this.loadReports();
  }

  refresh(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.error = null;

    this.reportsService.getReports().subscribe({
      next: (stats) => {
        console.log('Reports data loaded:', stats);
        this.stats = stats;
        this.updateSummaryTiles(stats);
        this.cadenceBreakdown = stats.cadenceBreakdown;
        this.momentumTimeline = stats.momentumTimeline;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.error = error.message || 'Failed to load reports. Please try again.';
        this.loading = false;
        // Set default empty stats to show something
        this.stats = {
          completionRate: 0,
          averageStreak: 0,
          totalCompleted: 0,
          totalHabits: 0,
          momentumTimeline: [],
          cadenceBreakdown: []
        };
        this.updateSummaryTiles(this.stats);
        this.cadenceBreakdown = [];
        this.momentumTimeline = [];
      }
    });
  }

  private updateSummaryTiles(stats: ReportStats): void {
    this.summaryTiles = [
      {
        label: 'Completion Rate',
        value: `${stats.completionRate}%`,
        trend: 'Last 7 days'
      },
      {
        label: 'Average Streak',
        value: `${stats.averageStreak} days`,
        trend: stats.averageStreak > 0 ? 'Keep it up!' : 'Start building streaks'
      },
      {
        label: 'Total Habits',
        value: `${stats.totalHabits}`,
        trend: stats.totalHabits > 0 ? 'Active habits' : 'No habits yet'
      },
      {
        label: 'Total Completed',
        value: `${stats.totalCompleted}`,
        trend: 'All time completions'
      }
    ];
  }

  trackByTile(index: number, tile: { label: string; value: string; trend: string }): string {
    return tile.label;
  }
}
