import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats, RecentOrder, SalesOverview } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  };
  recentOrders: RecentOrder[] = [];
  salesOverview: SalesOverview[] = [];
  isLoading = true;
  
  // Password change modal
  showPasswordModal = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordLoading = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if password change is required
    if (this.authService.requiresPasswordChange()) {
      this.showPasswordModal = true;
    } else {
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load stats
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        // Set default values if API fails
        this.stats = {
          totalCustomers: 1240,
          totalProducts: 345,
          totalOrders: 89,
          totalRevenue: 45200
        };
      }
    });

    // Load recent orders
    this.dashboardService.getRecentOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
        // Set default mock data if API fails
        this.recentOrders = [
          {
            id: 1,
            orderNumber: '#ORD-7752',
            customerName: 'Marcus Bergson',
            orderDate: new Date('2023-10-24').toISOString(),
            status: 'Pending',
            totalAmount: 450.00
          },
          {
            id: 2,
            orderNumber: '#ORD-7751',
            customerName: 'Sarah Connors',
            orderDate: new Date('2023-10-24').toISOString(),
            status: 'Completed',
            totalAmount: 120.50
          }
        ];
        this.isLoading = false;
      }
    });

    // Load sales overview
    this.dashboardService.getSalesOverview(6).subscribe({
      next: (sales) => {
        this.salesOverview = sales;
      },
      error: (error) => {
        console.error('Error loading sales overview:', error);
        // Set default mock data if API fails
        this.salesOverview = [
          { year: 2023, month: 5, total: 15000 },
          { year: 2023, month: 6, total: 18000 },
          { year: 2023, month: 7, total: 22000 },
          { year: 2023, month: 8, total: 25000 },
          { year: 2023, month: 9, total: 28000 },
          { year: 2023, month: 10, total: 32000 }
        ];
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  getMaxSales(): number {
    if (this.salesOverview.length === 0) return 1;
    return Math.max(...this.salesOverview.map(s => s.total));
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }

  changePassword() {
    this.passwordError = '';
    
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill all fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    this.passwordLoading = true;

    this.authService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.showPasswordModal = false;
        // Update user in localStorage
        const user = this.authService.getUser();
        if (user) {
          user.requiresPasswordChange = false;
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.loadDashboardData();
      },
      error: (error) => {
        this.passwordLoading = false;
        this.passwordError = error.error?.message || 'Failed to change password';
      }
    });
  }
}
