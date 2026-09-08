import queueDataStructureVideo from '../Videos/Queue Data Structure.mp4';
import queueOperationsVideo from '../Videos/Queue Operations.mp4';

export interface EducationalScene {
  id: number;
  timeStart: number;
  timeEnd: number;
  title: string;
  badge: string;
  badgeColor: string;
  narration: string;
  keyConcept: string;
  type: 'concept' | 'array' | 'linkedlist' | 'stack-queue' | 'stack-lifo' | 'queue-fifo' | 'front-rear' | 'enqueue' | 'dequeue' | 'push' | 'peek' | 'pop' | 'overflow' | 'underflow' | 'complexity';
}

export interface LessonData {
  id: number;
  lessonNumber: string;
  title: string;
  description: string;
  chips: string[];
  filename: string;
  videoSrc?: string;
  duration: number; // in seconds
  scenes: EducationalScene[];
}

export const LESSONS_DATA: LessonData[] = [
  {
    id: 1,
    lessonNumber: 'LESSON 01',
    title: 'QUEUE DATA STRUCTURE',
    description: 'Learn what a Queue is, understand the FIFO principle, and master how Enqueue, Dequeue, and Peek operations execute with step-by-step pointer mechanics.',
    chips: ['What is a Queue', 'FIFO Principle', 'Enqueue Step-by-Step', 'Dequeue Step-by-Step', 'Peek & Pointer Safety', 'O(1) Complexity'],
    filename: 'Queue Data Structure.mp4',
    videoSrc: queueDataStructureVideo,
    duration: 101,
    scenes: [
      {
        id: 1,
        timeStart: 0,
        timeEnd: 20,
        title: 'What is a Queue & FIFO Principle',
        badge: 'FIFO PRINCIPLE',
        badgeColor: 'text-indigo-400 bg-indigo-950/80 border-indigo-600/70',
        narration: 'A queue is an essential linear data structure governed by the First In, First Out principle. Just like a line at a ticket counter, elements enter at the rear and exit from the front in strict order.',
        keyConcept: 'First In, First Out (FIFO): The earliest arrived element is always the first to be processed and removed.',
        type: 'queue-fifo',
      },
      {
        id: 2,
        timeStart: 20,
        timeEnd: 46,
        title: 'Primary Queue Operations Overview',
        badge: 'CORE OPERATIONS',
        badgeColor: 'text-cyan-400 bg-cyan-950/80 border-cyan-600/70',
        narration: 'There are three core operations in a queue: Enqueue to add an element at the rear, Dequeue to remove an element from the front, and Peek to inspect the front item without removing it. Boundary checks isEmpty and isFull guard against errors. All three operations run in O(1) constant time.',
        keyConcept: 'Enqueue inserts at rear, Dequeue removes from front, Peek inspects front, and boundary checks guard against underflow and overflow.',
        type: 'concept',
      },
      {
        id: 3,
        timeStart: 46,
        timeEnd: 65,
        title: 'Enqueue Operation (Step-by-Step)',
        badge: 'ENQUEUE(50) → REAR + 1',
        badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-600/70',
        narration: 'To perform an Enqueue, we first verify that the queue is not full to prevent an overflow error. Next, we advance the REAR pointer to the next free slot and insert the new value. Here, enqueuing fifty increments REAR and stores fifty securely at the back in O(1) constant time.',
        keyConcept: 'Step 1: Check overflow. Step 2: Increment REAR pointer. Step 3: Insert new value at queue[rear].',
        type: 'enqueue',
      },
      {
        id: 4,
        timeStart: 65,
        timeEnd: 83,
        title: 'Dequeue Operation (Step-by-Step)',
        badge: 'DEQUEUE() → FRONT + 1',
        badgeColor: 'text-rose-400 bg-rose-950/80 border-rose-600/70',
        narration: 'To perform a Dequeue, we first verify that the queue is not empty to prevent underflow. We then extract the element stored at the FRONT pointer and advance FRONT to the next element. Here, ten is dequeued, and FRONT now points to twenty in O(1) constant time.',
        keyConcept: 'Step 1: Check underflow. Step 2: Retrieve element at queue[front]. Step 3: Increment FRONT pointer.',
        type: 'dequeue',
      },
      {
        id: 5,
        timeStart: 83,
        timeEnd: 101,
        title: 'Peek Operation & Pointer Rules Summary',
        badge: 'PEEK & RECAP: O(1)',
        badgeColor: 'text-blue-400 bg-blue-950/80 border-blue-600/70',
        narration: 'The Peek operation allows us to safely inspect the front element without modifying the queue. Pointers remain unchanged, and the value is returned in O(1) time. Queues provide robust, deterministic order processing for asynchronous workflows.',
        keyConcept: 'Peek provides non-destructive inspection. Pointers strictly advance in O(1) time without shifting elements.',
        type: 'complexity',
      },
    ],
  },
  {
    id: 2,
    lessonNumber: 'LESSON 02',
    title: 'TYPES OF QUEUES AND OPERATIONS',
    description: 'Explore the 4 primary types of queues — Linear Queue, Circular Queue, Priority Queue, and Deque (Double-Ended Queue) — and learn how operations, memory reuse, and pointer mechanics differ in each variant.',
    chips: [
      'Linear Queue',
      'Circular Queue',
      'Priority Queue',
      'Deque (Double-Ended)',
      'False Overflow Fix',
      'Modulo Wraparound',
      'Bi-directional Ends',
    ],
    filename: 'Queue Operations.mp4',
    videoSrc: queueOperationsVideo,
    duration: 99,
    scenes: [
      {
        id: 1,
        timeStart: 0,
        timeEnd: 17,
        title: 'The 4 Types of Queues Overview',
        badge: '4 QUEUE TYPES',
        badgeColor: 'text-cyan-400 bg-cyan-950/80 border-cyan-600/70',
        narration: 'Queues come in four architectural types: Linear Queue, Circular Queue, Priority Queue, and Double-Ended Queue, or Deque. Each variant is engineered to solve specific memory utilization and scheduling challenges.',
        keyConcept: 'Linear for basic FIFO; Circular for 100% memory reuse; Priority for weighted scheduling; Deque for dual-ended operations.',
        type: 'concept',
      },
      {
        id: 2,
        timeStart: 17,
        timeEnd: 39,
        title: 'Linear Queue & False Overflow',
        badge: 'LINEAR QUEUE: FALSE OVERFLOW',
        badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-600/70',
        narration: 'In a standard linear queue, elements enter at the rear and leave from the front. But as items are dequeued, vacant space at the beginning cannot be reused. When the REAR pointer reaches the end of the array, further insertions cause a False Overflow, wasting memory.',
        keyConcept: 'False Overflow occurs when rear equals MAX - 1 even though previous dequeued slots are empty.',
        type: 'array',
      },
      {
        id: 3,
        timeStart: 39,
        timeEnd: 59,
        title: 'Circular Queue Modulo Wraparound',
        badge: 'CIRCULAR QUEUE: (REAR+1)%MAX',
        badgeColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-600/70',
        narration: 'A circular queue completely solves false overflow by connecting the end of the array back to the front using modulo arithmetic. When advancing pointers, the formula rear equals rear plus one modulo capacity wraps around to reclaim freed memory slots in O(1) time.',
        keyConcept: 'Wraparound formula: rear = (rear + 1) % MAX. Enables continuous memory reuse without shifting elements.',
        type: 'front-rear',
      },
      {
        id: 4,
        timeStart: 59,
        timeEnd: 79,
        title: 'Priority Queue Operations',
        badge: 'PRIORITY QUEUE: HEAP-BASED',
        badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-600/70',
        narration: 'In a priority queue, every element is assigned a priority value. During dequeue, the element with the highest priority is extracted first, regardless of when it arrived. Priority queues are typically implemented with binary heaps for fast, efficient scheduling in operating systems.',
        keyConcept: 'Dequeue extracts highest-priority elements first. Critical for OS task scheduling and graph algorithms.',
        type: 'complexity',
      },
      {
        id: 5,
        timeStart: 79,
        timeEnd: 99,
        title: 'Deque (Double-Ended Queue) Operations',
        badge: 'DEQUE: 4-WAY OPERATIONS',
        badgeColor: 'text-purple-400 bg-purple-950/80 border-purple-600/70',
        narration: 'A Double-Ended Queue, or Deque, provides the ultimate flexibility by allowing insertion and deletion from both the front and rear ends. It supports four operations: insertFront, insertRear, deleteFront, and deleteRear, combining the capabilities of both stacks and queues.',
        keyConcept: 'Four core operations in O(1): insertFront, insertRear, deleteFront, deleteRear. Unifies Stack and Queue capabilities.',
        type: 'stack-queue',
      },
    ],
  },
];
