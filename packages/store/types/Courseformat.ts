export interface CourseFormat {
  _id: string;
  title: string;
  description?: string;
  price: number;
  imageLink: string;
  published: boolean;
  adminId?: string;
  createdAt?: string;
  updatedAt?: string;
}