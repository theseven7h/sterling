export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export interface CartItem {
    id: number;
    userId: string;
    productId: number;
    product: Product;
    quantity: number;
}
