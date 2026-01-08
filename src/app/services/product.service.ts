import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum ProductStatus {
  Available = 1,
  OutOfStock = 2,
  Discontinued = 3
}

export interface Product {
  productId?: number;
  productName: string;
  description?: string;
  price: number;
  quantity: number;
  productStatus: ProductStatus;
  createdAt?: string;
  updatedAt?: string | null;
  isDeleted?: boolean;
}

export interface CreateProductRequest {
  productName: string;
  description?: string;
  price: number;
  quantity: number;
  productStatus: ProductStatus;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://localhost:7151/api/Product';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
