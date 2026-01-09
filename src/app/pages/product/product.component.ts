import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';        // for [(ngModel)]
import { CommonModule } from '@angular/common';      // for *ngFor
import { ProductService, Product, CreateProductRequest, ProductStatus } from '../../services/product.service';

interface ProductForm extends CreateProductRequest {
  productId?: number;
}

@Component({
  selector: 'app-product',
  standalone: true,               // <-- mark as standalone
  imports: [CommonModule, FormsModule], // <-- import required modules
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  productForm: ProductForm = {
    productName: '',
    description: '',
    price: 0,
    quantity: 0,
    productStatus: ProductStatus.Available
  };
  editMode: boolean = false;
  showForm: boolean = false;
  productStatusOptions = ProductStatus;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res;
        this.applySearch();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        alert('Error loading products: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  applySearch() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredProducts = this.products.filter(product =>
        product.productName?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.productId?.toString().includes(term) ||
        product.price?.toString().includes(term) ||
        product.quantity?.toString().includes(term) ||
        this.getStatusLabel(product.productStatus).toLowerCase().includes(term)
      );
    }
  }

  onSearchChange() {
    this.applySearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applySearch();
  }

  onStatusChange() {
    // If status is set to OutOfStock, automatically set quantity to 0
    if (this.productForm.productStatus === ProductStatus.OutOfStock) {
      this.productForm.quantity = 0;
    }
  }

  onQuantityChange() {
    // If quantity is set to 0, automatically set status to OutOfStock
    if (this.productForm.quantity === 0 || this.productForm.quantity === null) {
      this.productForm.productStatus = ProductStatus.OutOfStock;
    } else if (this.productForm.productStatus === ProductStatus.OutOfStock) {
      // If quantity becomes greater than 0 and status was OutOfStock, set to Available
      this.productForm.productStatus = ProductStatus.Available;
    }
  }

  saveProduct(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    // Validate required fields
    if (!this.productForm.productName || !this.productForm.productName.trim()) {
      alert('Product name is required');
      return;
    }

    if (this.productForm.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    if (this.productForm.quantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    if (this.editMode && this.productForm.productId) {
      // For update, send the complete product object
      const updateRequest: Product = {
        productId: this.productForm.productId,
        productName: this.productForm.productName.trim(),
        description: this.productForm.description?.trim() || '',
        price: this.productForm.price,
        quantity: this.productForm.quantity,
        productStatus: this.productForm.productStatus
      };

      console.log('Updating product:', updateRequest);
      this.productService.updateProduct(this.productForm.productId, updateRequest)
        .subscribe({
          next: (product) => {
            console.log('Product updated successfully:', product);
            alert('Product updated successfully!');
            this.afterSave();
          },
          error: (error) => {
            console.error('Error updating product:', error);
            console.error('Full error:', JSON.stringify(error, null, 2));
            const errorMessage = error.error?.message || error.message || error.statusText || 'Unknown error';
            alert('Error updating product: ' + errorMessage);
          }
        });
    } else {
      // Create new product - remove productId if present
      const createRequest: CreateProductRequest = {
        productName: this.productForm.productName.trim(),
        description: this.productForm.description?.trim() || '',
        price: this.productForm.price,
        quantity: this.productForm.quantity,
        productStatus: this.productForm.productStatus
      };

      console.log('Creating product:', createRequest);
      
      this.productService.createProduct(createRequest)
        .subscribe({
          next: (product) => {
            console.log('Product created successfully:', product);
            alert('Product added successfully!');
            this.afterSave();
          },
          error: (error) => {
            console.error('Error creating product:', error);
            console.error('Full error:', JSON.stringify(error, null, 2));
            
            let errorMessage = 'Unknown error';
            
            if (error.status === 0) {
              errorMessage = 'Connection failed. Please check:\n1. Backend server is running\n2. CORS is configured correctly\n3. SSL certificate is trusted (for HTTPS)';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            } else if (error.statusText) {
              errorMessage = error.statusText;
            }
            
            alert('Error creating product: ' + errorMessage);
          }
        });
    }
  }

  editProduct(product: Product) {
    this.productForm = {
      productId: product.productId,
      productName: product.productName,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      productStatus: product.productStatus
    };
    this.editMode = true;
    this.showForm = true;
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id)
        .subscribe({
          next: () => {
            console.log('Product deleted successfully');
            // Reload products from server to ensure we have the latest data
            // This ensures deleted products (isDeleted=true) are filtered out
            this.loadProducts();
            alert('Product deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            console.error('Full error:', JSON.stringify(error, null, 2));
            const errorMessage = error.error?.message || error.message || error.statusText || 'Unknown error';
            alert('Error deleting product: ' + errorMessage);
            // Reload products anyway to ensure sync
            this.loadProducts();
          }
        });
    }
  }

  showAddForm() {
    this.productForm = {
      productName: '',
      description: '',
      price: 0,
      quantity: 0,
      productStatus: ProductStatus.Available
    };
    this.editMode = false;
    this.showForm = true;
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cancel() {
    this.productForm = {
      productName: '',
      description: '',
      price: 0,
      quantity: 0,
      productStatus: ProductStatus.Available
    };
    this.editMode = false;
    this.showForm = false;
  }

  private afterSave() {
    this.loadProducts();
    this.cancel();
  }

  getStatusLabel(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.Available:
        return 'Available';
      case ProductStatus.OutOfStock:
        return 'Out of Stock';
      case ProductStatus.Discontinued:
        return 'Discontinued';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.Available:
        return 'status-available';
      case ProductStatus.OutOfStock:
        return 'status-outofstock';
      case ProductStatus.Discontinued:
        return 'status-discontinued';
      default:
        return '';
    }
  }
}
