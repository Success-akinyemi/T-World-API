/**
 * Seed script – populates the `items` collection with sample learning content.
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Item } from '../db/models/Item';
import { config } from '../config';

const sampleItems = [
  {
    title: 'Introduction to Node.js',
    description:
      'A comprehensive beginner course covering Node.js fundamentals: event loop, modules, streams, and building your first server.',
    category: 'course',
    tags: ['node', 'javascript', 'backend', 'beginner'],
    imageUrl: 'https://placehold.co/600x400?text=Node.js',
    author: 'Sarah Johnson',
    duration: 180,
    level: 'beginner',
  },
  {
    title: 'Advanced MongoDB Aggregation Pipelines',
    description:
      'Deep-dive into MongoDB aggregation: $lookup, $unwind, $group, $facet and real-world performance patterns.',
    category: 'article',
    tags: ['mongodb', 'database', 'aggregation', 'advanced'],
    imageUrl: 'https://placehold.co/600x400?text=MongoDB',
    author: 'David Chen',
    duration: 25,
    level: 'advanced',
  },
  {
    title: 'REST API Design Best Practices',
    description:
      'Learn how to design clean, versioned, and well-documented REST APIs that scale with your product.',
    category: 'video',
    tags: ['api', 'rest', 'design', 'http'],
    imageUrl: 'https://placehold.co/600x400?text=REST+API',
    author: 'Emma Williams',
    duration: 45,
    level: 'intermediate',
  },
  {
    title: 'TypeScript for Backend Developers',
    description:
      'Typed JavaScript for Node.js: interfaces, generics, decorators, and integrating TypeScript with Express.',
    category: 'course',
    tags: ['typescript', 'node', 'backend'],
    imageUrl: 'https://placehold.co/600x400?text=TypeScript',
    author: 'Michael Brown',
    duration: 240,
    level: 'intermediate',
  },
  {
    title: 'Building Secure APIs with JWT',
    description:
      'A practical guide to authentication and authorisation using JSON Web Tokens in Node.js applications.',
    category: 'article',
    tags: ['security', 'jwt', 'auth', 'node'],
    imageUrl: 'https://placehold.co/600x400?text=JWT',
    author: 'Amara Osei',
    duration: 20,
    level: 'intermediate',
  },
  {
    title: 'System Design for Beginners',
    description:
      'Understand scalability, caching, load balancing, and database sharding through real-world system design case studies.',
    category: 'podcast',
    tags: ['system-design', 'scalability', 'architecture'],
    imageUrl: 'https://placehold.co/600x400?text=System+Design',
    author: 'Tech Talk Podcast',
    duration: 60,
    level: 'beginner',
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description:
      'Robert C. Martin\'s classic on writing readable, maintainable, and testable code every professional should read.',
    category: 'book',
    tags: ['clean-code', 'best-practices', 'software-engineering'],
    imageUrl: 'https://placehold.co/600x400?text=Clean+Code',
    author: 'Robert C. Martin',
    duration: 600,
    level: 'intermediate',
  },
  {
    title: 'Docker & Kubernetes for Node.js Apps',
    description:
      'Containerise your Node.js applications, write Dockerfiles, and deploy to Kubernetes with confidence.',
    category: 'course',
    tags: ['docker', 'kubernetes', 'devops', 'node'],
    imageUrl: 'https://placehold.co/600x400?text=Docker+%26+K8s',
    author: 'Lena Fischer',
    duration: 300,
    level: 'advanced',
  },
];

/* eslint-disable no-console */
const seed = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  await Item.deleteMany({});
  console.log('Cleared existing items');

  const created = await Item.insertMany(sampleItems);
  console.log(`Seeded ${created.length} items`);

  await mongoose.disconnect();
  console.log('Disconnected. Seeding complete!');
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
