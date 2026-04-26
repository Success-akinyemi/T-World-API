import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedItem extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  savedAt: Date;
}

const SavedItemSchema = new Schema<ISavedItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

// ── Indexes ──────────────────────────────────────────────────────────────────
// Compound unique index: a user can save an item only once
SavedItemSchema.index({ user: 1, item: 1 }, { unique: true });
// Efficient lookup of all items saved by a user
SavedItemSchema.index({ user: 1, savedAt: -1 });

export const SavedItem = mongoose.model<ISavedItem>('SavedItem', SavedItemSchema);
