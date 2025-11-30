
export interface Product {
  _id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  createdAt: string
  updatedAt: string
}

//Add Product
export interface CreateProductDto {
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string; 
  stock: number;
}


//Edit Product
export interface UpdateProductDto extends Partial<CreateProductDto> {}
