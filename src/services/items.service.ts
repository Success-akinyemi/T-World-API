import mongoose from 'mongoose';
import { Item, IItem } from '../db/models/Item';
import { SavedItem } from '../db/models/SavedItem';
import { AppError } from '../utils/AppError';
import { ItemsQuery, PaginationMeta } from '../types';

interface PaginatedItems {
  items: IItem[];
  meta: PaginationMeta;
}

export const ItemsService = {
    //get items list
  async listItems(query: ItemsQuery): Promise<PaginatedItems> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    // Build filter
    const filter: mongoose.FilterQuery<IItem> = {};
    if (query.category) filter.category = query.category;
    if (query.level) filter.level = query.level;
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [items, total] = await Promise.all([
      Item.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Item.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: items as unknown as IItem[],
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  //get single item
  async getItemById(id: string): Promise<IItem> {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid item ID', 400);
    }
    const item = await Item.findById(id).lean();
    if (!item) throw new AppError('Item not found', 404);
    return item as unknown as IItem;
  },

  //save item
  async saveItem(userId: string, itemId: string): Promise<void> {
    if (!mongoose.isValidObjectId(itemId)) {
      throw new AppError('Invalid item ID', 400);
    }

    const item = await Item.findById(itemId);
    if (!item) throw new AppError('Item not found', 404);

    const alreadySaved = await SavedItem.findOne({ user: userId, item: itemId });
    if (alreadySaved) throw new AppError('Item already saved', 409);

    await SavedItem.create({ user: userId, item: itemId });
  },

  //remove save item by user
  async unsaveItem(userId: string, itemId: string): Promise<void> {
    if (!mongoose.isValidObjectId(itemId)) {
      throw new AppError('Invalid item ID', 400);
    }

    const result = await SavedItem.findOneAndDelete({ user: userId, item: itemId });
    if (!result) throw new AppError('Saved item not found', 404);
  },

  //get saved items list
  async getSavedItems(userId: string): Promise<IItem[]> {
    const saved = await SavedItem.find({ user: userId })
      .populate<{ item: IItem }>('item')
      .sort({ savedAt: -1 })
      .lean();

    return saved.map((s) => s.item).filter(Boolean);
  },
};
