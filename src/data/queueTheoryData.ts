import { TheoryLesson } from '../types';
import { QUEUE_LESSONS_PART1 } from './queueLessonsPart1';
import { QUEUE_LESSONS_PART2 } from './queueLessonsPart2';

export const QUEUE_THEORY_LESSONS: TheoryLesson[] = [
  ...QUEUE_LESSONS_PART1,
  ...QUEUE_LESSONS_PART2,
];

export const QUEUE_THEORY_CATEGORIES = [
  {
    id: '01',
    number: '01',
    title: 'THEORY OF QUEUES & FIFO',
    shortTitle: 'Fundamentals & Principles',
    description: 'Complete 20-chapter comprehensive curriculum on Queues, FIFO, operations, algorithms, implementations, and real-world systems.',
    iconName: 'Layers',
    badge: '20 Chapters',
    lessons: QUEUE_THEORY_LESSONS,
  },
];
