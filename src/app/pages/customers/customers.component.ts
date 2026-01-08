import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer, CustomerRequest } from '../../types/customer';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Modal states
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;

  // Form data
  selectedCustomer: Customer | null = null;
  customerForm: CustomerRequest = {
    customerCode: '',
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  // FR-05: Load customer list
  loadCustomers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customers. Please try again.';
        this.isLoading = false;
        console.error('Error loading customers:', error);
      }
    });
  }

  // FR-03: Open add customer modal
  openAddModal() {
    this.customerForm = {
      customerCode: '',
      name: '',
      email: '',
      phone: '',
      address: ''
    };
    this.showAddModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // FR-03: Create new customer
  createCustomer() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.customerService.createCustomer(this.customerForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAddModal = false;
        this.successMessage = 'Customer created successfully!';
        this.loadCustomers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create customer. Please try again.';
        console.error('Error creating customer:', error);
      }
    });
  }

  // FR-04: Open edit customer modal
  openEditModal(customer: Customer) {
    this.selectedCustomer = customer;
    this.customerForm = {
      customerCode: customer.customerCode,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    };
    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // FR-04: Update customer
  updateCustomer() {
    if (!this.validateForm() || !this.selectedCustomer) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.customerService.updateCustomer(this.selectedCustomer.id, this.customerForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.showEditModal = false;
        this.selectedCustomer = null;
        this.successMessage = 'Customer updated successfully!';
        this.loadCustomers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update customer. Please try again.';
        console.error('Error updating customer:', error);
      }
    });
  }

  // FR-06: Open delete confirmation modal
  openDeleteModal(customer: Customer) {
    this.selectedCustomer = customer;
    this.showDeleteModal = true;
    this.errorMessage = '';
  }

  // FR-06: Delete customer
  deleteCustomer() {
    if (!this.selectedCustomer) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.customerService.deleteCustomer(this.selectedCustomer.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.showDeleteModal = false;
        this.selectedCustomer = null;
        this.successMessage = 'Customer deleted successfully!';
        this.loadCustomers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete customer. Please try again.';
        console.error('Error deleting customer:', error);
      }
    });
  }

  // Close modals
  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedCustomer = null;
    this.errorMessage = '';
  }

  // Validate form
  validateForm(): boolean {
    if (!this.customerForm.customerCode || !this.customerForm.customerCode.trim()) {
      this.errorMessage = 'Customer Code is required';
      return false;
    }
    if (!this.customerForm.name || !this.customerForm.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }
    if (this.customerForm.email && !this.isValidEmail(this.customerForm.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }
    return true;
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
