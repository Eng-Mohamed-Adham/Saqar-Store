
export interface Card {
  _id: string
  title: string
  description: string
  category: string
  image: string
  owner:string
  
  createdAt: string
  updatedAt: string
}

//Add Product
export interface CreateCard {
  title: string;
  owner:string
  description: string;
  category: string;
  image?: string; 
}


// Edit Product
export interface UpdateCard extends Partial<CreateCard> {}
