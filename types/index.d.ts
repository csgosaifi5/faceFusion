/* eslint-disable no-unused-vars */

// ====== USER PARAMS
declare type CreateUserParams = {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  facefusion?: {
    is_locked?: boolean;
    unlock_time?: Date;
    expiry_time?: Date;
    contractId?: string;
  };
};
declare type createProjectParams = {
  user_id: string;
  title: string;
  description: string;
};

declare type UpdateMsProjectParams = {
  title?: string;
  description?: string;
  objectKey?: string | null;
  downloadUrl?: string | null;
  transcription?: string | null;
};
declare type UpdateUserParams = {
  firstName?: string;
  lastName?: string;
  username?: string;
  photo?: string;
  facefusion?: {
    is_locked?: boolean;
    unlock_time?: Date;
    expiry_time?: Date;
    contract_id?: string;
  };
};
declare type Project = {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  objectKey: string | null;
  downloadUrl: string | null;
  transcription: string | null;
  createdAt: Date;
  updatedAt: Date;
};
// ====== TRANSACTIONS PARAMS
interface ITRANSACTIONS extends Document {
  _id: string;
  razorpayOrderId: string;
  amount?: number;
  plan: string;
  status: string;
  tokens?: number;
  user_id: {
    _id: string;
    firstName: string;
    lastName: string;
  }
  createdAt?: Date;
  updatedAt?: Date;
}
// ====== BLOGS PARAMS

interface SingleBlog {
  // Define the structure of each blog object according to your data
  _id: string;
  title: string;
  description: string;
  image?: string;
  meta_description: string;
  meta_keywords: string;
  meta_title: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
interface AllBlogsProps {
  blogs: SingleBlog[]; // An array of blogs
  count: number; // A number representing the count
}

// ====== IMAGE PARAMS
declare type AddImageParams = {
  image: {
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: any;
    secureURL: string;
    transformationURL: string;
    aspectRatio: string | undefined;
    prompt: string | undefined;
    color: string | undefined;
  };
  userId: string;
  path: string;
};

declare type UpdateImageParams = {
  image: {
    _id: string;
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: any;
    secureURL: string;
    transformationURL: string;
    aspectRatio: string | undefined;
    prompt: string | undefined;
    color: string | undefined;
  };
  userId: string;
  path: string;
};

declare type Transformations = {
  restore?: boolean;
  fillBackground?: boolean;
  remove?: {
    prompt: string;
    removeShadow?: boolean;
    multiple?: boolean;
  };
  recolor?: {
    prompt?: string;
    to: string;
    multiple?: boolean;
  };
  removeBackground?: boolean;
};

// ====== TRANSACTION PARAMS
declare type CheckoutTransactionParams = {
  plan: string;
  credits: number;
  amount: number;
  buyerId: string;
};

declare type CreateOrderParams = {
  amount: number;
  tokens: number;
  plan: string;
  userId: string;
};

declare type TransformationTypeKey = "restore" | "fill" | "remove" | "recolor" | "removeBackground";

// ====== URL QUERY PARAMS
declare type FormUrlQueryParams = {
  searchParams: string;
  key: string;
  value: string | number | null;
};

declare type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

declare type RemoveUrlQueryParams = {
  searchParams: string;
  keysToRemove: string[];
};

declare type SearchParamProps = {
  params: { id: string; type: TransformationTypeKey };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type TransformationFormProps = {
  action: "Add" | "Update";
  userId: string;
  type: TransformationTypeKey;
  creditBalance: number;
  data?: IImage | null;
  config?: Transformations | null;
};

declare type TransformedImageProps = {
  image: any;
  type: string;
  title: string;
  transformationConfig: Transformations | null;
  isTransforming: boolean;
  hasDownload?: boolean;
  setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>;
};

interface UserSession {
  clerkId: string;
}
