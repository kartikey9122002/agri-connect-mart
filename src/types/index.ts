export type UserRole = "seller" | "buyer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sellerId: string;
  sellerName: string;
  status: string;
  availability: 'available' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovScheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  applicationUrl: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

export interface PricePrediction {
  productId: string;
  productName: string;
  currentPrice: number;
  predictedPrices: {
    date: string;
    price: number;
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface BuyerInteraction {
  id: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  type: 'inquiry' | 'review' | 'message';
  content: string;
  createdAt: string;
}

export interface ProductReceipt {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  quantity: number;
  totalPrice: number;
  buyerId: string;
  buyerName: string;
  createdAt: string;
}
