import mongoose, { Document, Schema } from 'mongoose';

export type ItemCategory = 'course' | 'article' | 'video' | 'podcast' | 'book';

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: ItemCategory;
  tags: string[];
  imageUrl?: string;
  author: string;
  duration?: number; // minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['course', 'article', 'video', 'podcast', 'book'],
        message: 'Category must be one of: course, article, video, podcast, book',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Level must be one of: beginner, intermediate, advanced',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ── Indexes ──────────────────────────────────────────────────────────────────
ItemSchema.index({ category: 1 });
ItemSchema.index({ tags: 1 });
ItemSchema.index({ title: 'text', description: 'text' }); // full-text search

export const Item = mongoose.model<IItem>('Item', ItemSchema);
