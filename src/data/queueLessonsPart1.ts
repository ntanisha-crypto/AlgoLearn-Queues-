import { TheoryLesson } from '../types';

export const QUEUE_LESSONS_PART1: TheoryLesson[] = [
  // =========================================================================
  // CHAPTER 01: WHAT IS A QUEUE?
  // =========================================================================
  {
    id: 1,
    chapterNumber: '01',
    categoryLabel: 'FUNDAMENTALS',
    lessonNumber: 1,
    title: '1. What is a Queue?',
    shortDesc: 'Understand the fundamental definition, structure, and FIFO principle of a Queue.',
    readTime: '2 min read',
    executiveDefinition:
      'A Queue is a linear data structure that follows the First In, First Out (FIFO) principle, where elements are inserted at the back (REAR) and removed from the front (FRONT).',
    criticalSpecifications: [
      'Linear structure: Elements are arranged sequentially in a 1D continuous logical sequence.',
      'Two-ended access: Open at both ends — insertions occur at REAR; deletions occur at FRONT.',
      'FIFO order: The first element added to the queue is guaranteed to be the first one extracted.',
      'No random middle access: You cannot bypass or extract elements from the middle without dequeuing preceding items.',
    ],
    analogy: {
      title: 'Ticket Counter at a Cinema',
      description:
        'When you arrive to buy a movie ticket, you join at the END of the line (REAR). The person who arrived first is at the FRONT, gets served first, and exits the line first. Jumping the queue is strictly forbidden!',
    },
    example: {
      title: 'Sequential Arrival & Departure',
      description:
        'Starting with an empty queue, customer 10 arrives, then 20, then 30. When service starts, 10 leaves first.',
      steps: [
        'Enqueue(10) → Queue: [10] (FRONT = 10, REAR = 10)',
        'Enqueue(20) → Queue: [10, 20] (FRONT = 10, REAR = 20)',
        'Enqueue(30) → Queue: [10, 20, 30] (FRONT = 10, REAR = 30)',
        'Dequeue() → Returns 10! Remaining Queue: [20, 30] (FRONT = 20, REAR = 30)',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Standard FIFO Queue Architecture',
      notes: 'Open at both ends: elements enter at REAR and depart from FRONT.',
      diagramText: `  DEQUEUE (Exit)                                           ENQUEUE (Entry)
  ◄─────────────                                            ◄────────────
   FRONT                                                            REAR
  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
  │     10      │     20      │     30      │     40      │     50      │
  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
     Index 0       Index 1       Index 2       Index 3       Index 4
    (Oldest)                                                (Newest)`,
    },
    codeSnippet: {
      python: `# Python Queue implementation using collections.deque
from collections import deque

q = deque()
q.append(10)   # Enqueue at rear
q.append(20)
q.append(30)

print("Front element:", q[0])  # 10
first_out = q.popleft()        # Dequeue from front -> 10
print("Dequeued:", first_out)
print("Remaining queue:", list(q)) # [20, 30]`,
      java: `// Java Queue using LinkedList
import java.util.LinkedList;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        Queue<Integer> q = new LinkedList<>();
        q.offer(10); // Enqueue at rear
        q.offer(20);
        q.offer(30);

        System.out.println("Front: " + q.peek()); // 10
        System.out.println("Dequeued: " + q.poll()); // 10
        System.out.println("New Front: " + q.peek()); // 20
    }
}`,
      cpp: `// C++ Queue using std::queue
#include <iostream>
#include <queue>

int main() {
    std::queue<int> q;
    q.push(10); // Enqueue at rear
    q.push(20);
    q.push(30);

    std::cout << "Front: " << q.front() << std::endl; // 10
    q.pop(); // Dequeue from front
    std::cout << "New Front: " << q.front() << std::endl; // 20
    return 0;
}`,
      c: `// C Queue using standard fixed array
#include <stdio.h>
#define SIZE 5

int queue[SIZE], front = -1, rear = -1;

void enqueue(int val) {
    if (rear == SIZE - 1) return; // Overflow
    if (front == -1) front = 0;
    queue[++rear] = val;
}

int dequeue() {
    if (front == -1 || front > rear) return -1; // Underflow
    return queue[front++];
}

int main() {
    enqueue(10);
    enqueue(20);
    printf("Dequeued: %d\\n", dequeue()); // 10
    return 0;
}`,
    },
    timeComplexity: 'O(1) Enqueue and O(1) Dequeue',
    spaceComplexity: 'O(N) where N is the number of stored elements',
    keyTakeaway:
      'A Queue is a linear data structure governed by FIFO (First In, First Out). The first element added is always the first one removed.',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 02: BASIC STRUCTURE OF A QUEUE
  // =========================================================================
  {
    id: 2,
    chapterNumber: '02',
    categoryLabel: 'FUNDAMENTALS',
    lessonNumber: 2,
    title: '2. Basic Structure of a Queue',
    shortDesc: 'Anatomy of FRONT and REAR pointers, buffer indexing, and boundaries.',
    readTime: '2 min read',
    executiveDefinition:
      'The anatomy of a queue is governed by two essential pointers: FRONT (referencing the oldest element ready to exit) and REAR (referencing the newest element added).',
    criticalSpecifications: [
      'FRONT Pointer: Points to the position of the element at the head of the line (index 0 initially).',
      'REAR Pointer: Points to the position of the last inserted element at the tail of the line.',
      'Capacity / Bound: The maximum allocated slots in a fixed-size array queue.',
      'Size / Count: The actual number of elements currently present in the queue (rear - front + 1 in linear queues).',
    ],
    analogy: {
      title: 'Assembly Line Conveyor Belt',
      description:
        'On an industrial conveyor belt, raw materials enter at the Loading Bay (REAR pointer) and finished packaged boxes leave at the Shipping Gate (FRONT pointer). The conveyor length is the Capacity.',
    },
    example: {
      title: 'Tracking Pointers in Array[5]',
      description:
        'Observing how FRONT and REAR values evolve as elements arrive and depart.',
      steps: [
        'Queue Empty: FRONT = -1, REAR = -1',
        'Enqueue(10): FRONT = 0, REAR = 0 (Element at Index 0)',
        'Enqueue(20): FRONT = 0, REAR = 1 (Elements at Indices 0, 1)',
        'Enqueue(30): FRONT = 0, REAR = 2 (Elements at Indices 0, 1, 2)',
        'Dequeue(): FRONT moves to Index 1. REAR stays at Index 2.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Pointer Tracking in an Array Buffer',
      notes: 'FRONT tracks departure point; REAR tracks insertion point.',
      diagramText: `          FRONT = 0                           REAR = 2
              ↓                                   ↓
        ┌───────────┬───────────┬───────────┬───────────┬───────────┐
  Index │     0     │     1     │     2     │     3     │     4     │
  Value │    10     │    20     │    30     │   [EMPTY] │   [EMPTY] │
        └───────────┴───────────┴───────────┴───────────┴───────────┘
         Current Size = 3, Max Capacity = 5`,
    },
    codeSnippet: {
      python: `# Structuring a Queue class with explicit pointers
class Queue:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = -1
        self.rear = -1
        self.size = 0`,
      java: `// Structuring a Queue class in Java
public class ArrayQueue {
    private int[] data;
    private int front;
    private int rear;
    private int size;
    private int capacity;

    public ArrayQueue(int capacity) {
        this.capacity = capacity;
        this.data = new int[capacity];
        this.front = 0;
        this.rear = -1;
        this.size = 0;
    }
}`,
      cpp: `// Structuring a Queue class in C++
class ArrayQueue {
    int* arr;
    int front;
    int rear;
    int capacity;
    int count;
public:
    ArrayQueue(int cap) {
        capacity = cap;
        arr = new int[cap];
        front = 0;
        rear = -1;
        count = 0;
    }
};`,
      c: `// Structuring Queue in C
struct Queue {
    int items[100];
    int front;
    int rear;
    int capacity;
};`,
    },
    timeComplexity: 'O(1) pointer updates',
    spaceComplexity: 'O(capacity) contiguous memory',
    keyTakeaway:
      'A Queue operates by orchestrating two pointers: FRONT (where items leave) and REAR (where items enter).',
    interactiveDemoType: 'queue-pointers',
  },

  // =========================================================================
  // CHAPTER 03: HOW DOES A QUEUE WORK?
  // =========================================================================
  {
    id: 3,
    chapterNumber: '03',
    categoryLabel: 'FUNDAMENTALS',
    lessonNumber: 3,
    title: '3. How Does a Queue Work?',
    shortDesc: 'Step-by-step lifecycle of items entering at REAR and departing at FRONT.',
    readTime: '3 min read',
    executiveDefinition:
      'A Queue works by strictly maintaining the timeline order of incoming events: elements enter in chronological order and are serviced in that exact sequence.',
    criticalSpecifications: [
      'Monotonic Arrival: Each new enqueue operation places the element behind all previously enqueued elements.',
      'Protected Order: No item can jump ahead of an earlier item (unless using a Priority Queue).',
      'Continuous Pipeline: When the item at FRONT is serviced, the next oldest item automatically becomes FRONT.',
      'Symmetric Balance: What goes in first, comes out first — preserving temporal ordering perfectly.',
    ],
    analogy: {
      title: 'Supermarket Checkout Line',
      description:
        'Customer Alice puts her groceries down first. Customer Bob puts his groceries down next. The cashier will never scan Bob’s groceries before Alice is completely checked out and paid for.',
    },
    example: {
      title: 'Full Lifecycle Trace',
      description: 'Follow 3 elements through arrival, inspection, and departure.',
      steps: [
        'Arrival: Enqueue(10), Enqueue(20), Enqueue(30)',
        'State Check: Peek() returns 10 (Front is inspected without removal)',
        'Departure 1: Dequeue() returns 10 (First in is First out)',
        'Departure 2: Dequeue() returns 20 (Second in is Second out)',
        'Departure 3: Dequeue() returns 30 (Last in is Last out)',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'The Complete FIFO Flow Cycle',
      notes: 'Arrival Order: 10 → 20 → 30. Departure Order: 10 → 20 → 30.',
      diagramText: `  Phase 1: Three Items Enqueued
  [FRONT] 10  ◄──  20  ◄──  30 [REAR]

  Phase 2: Dequeue 10
  (10 Exits) ◄── [FRONT] 20  ◄──  30 [REAR]

  Phase 3: Dequeue 20
  (20 Exits) ◄── [FRONT] 30 [REAR]

  Phase 4: Dequeue 30
  (30 Exits) ◄── [Queue is now EMPTY]`,
    },
    codeSnippet: {
      python: `# Complete lifecycle trace in Python
q = []

# Enqueue phase
q.append("Alice")
q.append("Bob")
q.append("Charlie")

# FIFO Processing phase
while q:
    served = q.pop(0)
    print(f"Now serving: {served}")
# Output: Alice, then Bob, then Charlie`,
      java: `// Complete lifecycle trace in Java
import java.util.LinkedList;
import java.util.Queue;

Queue<String> line = new LinkedList<>();
line.offer("Alice");
line.offer("Bob");
line.offer("Charlie");

while (!line.isEmpty()) {
    System.out.println("Now serving: " + line.poll());
}`,
      cpp: `// Complete lifecycle trace in C++
#include <iostream>
#include <queue>
#include <string>

std::queue<std::string> line;
line.push("Alice");
line.push("Bob");
line.push("Charlie");

while (!line.empty()) {
    std::cout << "Now serving: " << line.front() << std::endl;
    line.pop();
}`,
      c: `// Complete lifecycle in C
// Enqueue Alice, Bob, Charlie -> Dequeue Alice, Bob, Charlie in exact sequence.`,
    },
    timeComplexity: 'O(1) per lifecycle operation',
    spaceComplexity: 'O(N) storage',
    keyTakeaway:
      'The queue lifecycle is deterministic: Departure order is an identical copy of arrival order.',
    interactiveDemoType: 'queue-fifo',
  },

  // =========================================================================
  // CHAPTER 04: BASIC QUEUE OPERATIONS (ENQUEUE)
  // =========================================================================
  {
    id: 4,
    chapterNumber: '04',
    categoryLabel: 'OPERATIONS',
    lessonNumber: 4,
    title: '4. Basic Queue Operations (Enqueue)',
    shortDesc: 'Adding elements at the REAR pointer with boundary validation.',
    readTime: '2 min read',
    executiveDefinition:
      'Enqueue is the primary mutation operation that appends a new element to the back (REAR) of the queue in O(1) constant time.',
    criticalSpecifications: [
      'Safety Precondition: Must check isFull() before inserting in a fixed-size queue to prevent Overflow.',
      'First Item Initialization: If the queue is empty, FRONT must be transitioned from -1 to 0.',
      'REAR Increment: REAR pointer advances by 1 (or wraps modulo in circular queues).',
      'Value Assignment: Data is stored at array[REAR].',
    ],
    analogy: {
      title: 'Car Joining a Drive-Thru',
      description:
        'When you pull your car into a drive-thru lane, you always stop behind the last car (REAR). You never pull up to the payment window ahead of waiting cars.',
    },
    example: {
      title: 'Enqueue Step-by-Step Algorithm',
      description: 'Adding value 45 to a queue with elements [10, 20].',
      steps: [
        'Check isFull(): Capacity is 5, current size is 2 → Not full.',
        'Advance REAR: REAR was 1, now increments to 2.',
        'Assign Value: queue[2] = 45.',
        'Increment Size: Size becomes 3. FRONT remains unchanged at 0.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Enqueue(45) at REAR',
      notes: 'REAR increments from 1 to 2; FRONT remains unchanged.',
      diagramText: `  BEFORE ENQUEUE:
  FRONT = 0               REAR = 1
     ↓                       ↓
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │    10    │    20    │ [EMPTY]  │ [EMPTY]  │ [EMPTY]  │
  └──────────┴──────────┴──────────┴──────────┴──────────┘

  AFTER ENQUEUE(45):
  FRONT = 0                          REAR = 2
     ↓                                  ↓
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │    10    │    20    │    45    │ [EMPTY]  │ [EMPTY]  │
  └──────────┴──────────┴──────────┴──────────┴──────────┘`,
    },
    codeSnippet: {
      python: `def enqueue(queue, item, capacity):
    if len(queue) >= capacity:
        raise OverflowError("Queue Overflow!")
    queue.append(item)
    print(f"Enqueued {item} at REAR")`,
      java: `public void enqueue(int value) {
    if (isFull()) {
        throw new IllegalStateException("Queue Overflow!");
    }
    if (front == -1) front = 0;
    rear++;
    data[rear] = value;
    size++;
}`,
      cpp: `void enqueue(int value) {
    if (isFull()) {
        std::cerr << "Queue Overflow!\\n";
        return;
    }
    if (front == -1) front = 0;
    arr[++rear] = value;
    count++;
}`,
      c: `void enqueue(int queue[], int *rear, int *front, int val, int capacity) {
    if (*rear == capacity - 1) {
        printf("Queue Overflow!\\n");
        return;
    }
    if (*front == -1) *front = 0;
    queue[++(*rear)] = val;
}`,
    },
    timeComplexity: 'O(1) Constant Time',
    spaceComplexity: 'O(1) Auxiliary Space',
    keyTakeaway:
      'Enqueue adds an element to the REAR. Always verify that the queue is not full before enqueueing.',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 05: DEQUEUE
  // =========================================================================
  {
    id: 5,
    chapterNumber: '05',
    categoryLabel: 'OPERATIONS',
    lessonNumber: 5,
    title: '5. Dequeue',
    shortDesc: 'Removing and returning the element at the FRONT pointer.',
    readTime: '2 min read',
    executiveDefinition:
      'Dequeue is the extraction operation that removes and returns the oldest element residing at the front (FRONT) of the queue in O(1) constant time.',
    criticalSpecifications: [
      'Safety Precondition: Must verify isEmpty() before dequeueing to prevent Underflow.',
      'Value Capture: Retrieve the item residing at array[FRONT].',
      'FRONT Increment: FRONT advances forward by 1 (or wraps modulo in circular queues).',
      'Empty Reset: If all items are dequeued, reset both FRONT and REAR back to -1.',
    ],
    analogy: {
      title: 'Doctor Calling the Next Patient',
      description:
        'The doctor opens the consultation door and calls the next patient who has been waiting longest in the lobby (FRONT). That patient enters the exam room and leaves the waiting queue.',
    },
    example: {
      title: 'Dequeue Step-by-Step Algorithm',
      description: 'Removing from a queue holding [10, 20, 30].',
      steps: [
        'Check isEmpty(): Current size is 3 → Safe to proceed.',
        'Capture Front: Item 10 is at index 0.',
        'Advance FRONT: FRONT shifts from 0 to index 1.',
        'Return Item: Value 10 is returned to caller. New FRONT is 20.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Dequeue() from FRONT',
      notes: 'FRONT advances from 0 to 1; Element 10 is extracted.',
      diagramText: `  BEFORE DEQUEUE:
  FRONT = 0               REAR = 2
     ↓                       ↓
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │    10    │    20    │    30    │ [EMPTY]  │ [EMPTY]  │
  └──────────┴──────────┴──────────┴──────────┴──────────┘

  AFTER DEQUEUE() → Returns 10:
             FRONT = 1    REAR = 2
                 ↓           ↓
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │ [FREED]  │    20    │    30    │ [EMPTY]  │ [EMPTY]  │
  └──────────┴──────────┴──────────┴──────────┴──────────┘`,
    },
    codeSnippet: {
      python: `def dequeue(queue):
    if not queue:
        raise IndexError("Queue Underflow!")
    # O(1) when using collections.deque popleft()
    return queue.popleft()`,
      java: `public int dequeue() {
    if (isEmpty()) {
        throw new NoSuchElementException("Queue Underflow!");
    }
    int value = data[front];
    front++;
    size--;
    if (size == 0) {
        front = -1;
        rear = -1;
    }
    return value;
}`,
      cpp: `int dequeue() {
    if (isEmpty()) {
        std::cerr << "Queue Underflow!\\n";
        return -1;
    }
    int val = arr[front++];
    count--;
    return val;
}`,
      c: `int dequeue(int queue[], int *front, int rear) {
    if (*front == -1 || *front > rear) {
        printf("Queue Underflow!\\n");
        return -1;
    }
    return queue[(*front)++];
}`,
    },
    timeComplexity: 'O(1) Constant Time',
    spaceComplexity: 'O(1) Auxiliary Space',
    keyTakeaway:
      'Dequeue removes the element at FRONT. Always verify isEmpty() first to guard against Underflow.',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 06: PEEK / FRONT
  // =========================================================================
  {
    id: 6,
    chapterNumber: '06',
    categoryLabel: 'OPERATIONS',
    lessonNumber: 6,
    title: '6. Peek / Front',
    shortDesc: 'Inspecting the next element in line without removing it.',
    readTime: '2 min read',
    executiveDefinition:
      'Peek (or Front) inspects and returns the element currently at the FRONT of the queue without modifying queue state or advancing any pointers.',
    criticalSpecifications: [
      'Non-destructive: The queue contents and pointers remain completely unchanged.',
      'Precondition: The queue must not be empty (requires isEmpty() guard).',
      'Time Complexity: Pure O(1) direct memory access.',
      'Purpose: Allows algorithms to make decisions based on the next incoming item before committing to dequeue.',
    ],
    analogy: {
      title: 'Peeking at Caller ID',
      description:
        'Looking at your phone screen to see who is calling before picking up. You see the caller name (Peek), but the call is still ringing until you answer (Dequeue).',
    },
    example: {
      title: 'Peek vs Dequeue Contrast',
      description: 'Queue state: [10, 20, 30]',
      steps: [
        'Call Peek(): Returns 10. Queue remains [10, 20, 30].',
        'Call Peek() again: Still returns 10. Queue remains [10, 20, 30].',
        'Call Dequeue(): Returns 10. Queue becomes [20, 30].',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Peek() Non-Destructive Inspection',
      notes: 'FRONT element read directly; no pointers move.',
      diagramText: `          PEEK Reads Value 10 (Non-Destructive)
              │
              ▼
          FRONT = 0               REAR = 2
              ↓                       ↓
        ┌───────────┬───────────┬───────────┐
        │    10     │    20     │    30     │
        └───────────┴───────────┴───────────┘
         Length after Peek() = 3 (Unchanged)`,
    },
    codeSnippet: {
      python: `def peek(queue):
    if not queue:
        raise IndexError("Queue is empty!")
    return queue[0]  # First element, non-destructive`,
      java: `public int peek() {
    if (isEmpty()) {
        throw new NoSuchElementException("Queue is empty!");
    }
    return data[front];
}`,
      cpp: `int peek() {
    if (isEmpty()) {
        std::cerr << "Queue is empty!\\n";
        return -1;
    }
    return arr[front];
}`,
      c: `int peek(int queue[], int front, int rear) {
    if (front == -1 || front > rear) {
        printf("Queue is empty!\\n");
        return -1;
    }
    return queue[front];
}`,
    },
    timeComplexity: 'O(1) Constant Time',
    spaceComplexity: 'O(1) Auxiliary Space',
    keyTakeaway:
      'Peek reads the element at FRONT without removing it. It is safe, non-destructive, and runs in O(1).',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 07: ISEMPTY()
  // =========================================================================
  {
    id: 7,
    chapterNumber: '07',
    categoryLabel: 'OPERATIONS',
    lessonNumber: 7,
    title: '7. isEmpty()',
    shortDesc: 'Condition checking whether any elements remain in the queue.',
    readTime: '1 min read',
    executiveDefinition:
      'isEmpty() is a boolean query function that checks whether the queue contains zero elements.',
    criticalSpecifications: [
      'Evaluation rule in array queue: front == -1 or front > rear (or count == 0).',
      'Evaluation rule in linked list queue: front == null.',
      'Essential precondition guard: Must always be checked before executing Dequeue() or Peek().',
      'Time Complexity: O(1) instant boolean check.',
    ],
    analogy: {
      title: 'Empty Waiting Room',
      description:
        'Before a doctor walks out into the waiting room, they glance through the window to see if any seats are occupied. If empty, they don’t call a name.',
    },
    example: {
      title: 'Guarding Dequeue with isEmpty()',
      description: 'Preventing program crashes and index out of bounds.',
      steps: [
        'Queue holds 0 items.',
        'Call isEmpty() → Returns True.',
        'Attempt Dequeue() without guard → Underflow Exception!',
        'With guard: if (!isEmpty()) dequeue(); else handleEmptyState();',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'isEmpty() Verification',
      notes: 'When FRONT = -1 or size = 0, queue is empty.',
      diagramText: `  EMPTY QUEUE STATE:
  FRONT = -1, REAR = -1
  ┌──────────┬──────────┬──────────┬──────────┐
  │ [EMPTY]  │ [EMPTY]  │ [EMPTY]  │ [EMPTY]  │
  └──────────┴──────────┴──────────┴──────────┘
  isEmpty() === true  ➔  Blocks Underflow!`,
    },
    codeSnippet: {
      python: `def is_empty(queue) -> bool:
    return len(queue) == 0`,
      java: `public boolean isEmpty() {
    return size == 0; // or front == -1 || front > rear
}`,
      cpp: `bool isEmpty() const {
    return count == 0;
}`,
      c: `int isEmpty(int front, int rear) {
    return (front == -1 || front > rear);
}`,
    },
    timeComplexity: 'O(1) Constant Time',
    spaceComplexity: 'O(1) Auxiliary Space',
    keyTakeaway:
      'Always call isEmpty() before calling Dequeue() or Peek() to guarantee crash-free code.',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 08: ISFULL()
  // =========================================================================
  {
    id: 8,
    chapterNumber: '08',
    categoryLabel: 'OPERATIONS',
    lessonNumber: 8,
    title: '8. isFull()',
    shortDesc: 'Determining if a fixed-capacity buffer has reached maximum limit.',
    readTime: '2 min read',
    executiveDefinition:
      'isFull() is a boolean guard function in fixed-size implementations that determines whether all allocated slots in the buffer are currently occupied.',
    criticalSpecifications: [
      'Linear Queue condition: rear == capacity - 1.',
      'Circular Queue condition: (rear + 1) % capacity == front or size == capacity.',
      'Linked List Queue note: Dynamically sized linked lists are never technically full (unless RAM is exhausted).',
      'Essential guard: Must precede any Enqueue operation to prevent Queue Overflow.',
    ],
    analogy: {
      title: 'Full Elevator / Parking Garage',
      description:
        'When a parking garage displays "LOT FULL", the entry gate refuses to lift. No new car can enter until another car leaves through the exit gate.',
    },
    example: {
      title: 'Overflow Prevention Check',
      description: 'Capacity: 3. Items: [10, 20, 30].',
      steps: [
        'Queue: [10, 20, 30] (Size = 3, Capacity = 3)',
        'Check isFull(): returns True.',
        'Enqueue(40) attempt: Aborted safely with an error message.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'isFull() Detection',
      notes: 'All allocated slots filled; REAR reaches capacity - 1.',
      diagramText: `  FULL QUEUE STATE:
  FRONT = 0                           REAR = 3 (Max Index)
     ↓                                   ↓
  ┌──────────┬──────────┬──────────┬──────────┐
  │    10    │    20    │    30    │    40    │
  └──────────┴──────────┴──────────┴──────────┘
  isFull() === true  ➔  Blocks Enqueue Overflow!`,
    },
    codeSnippet: {
      python: `def is_full(queue, capacity: int) -> bool:
    return len(queue) >= capacity`,
      java: `public boolean isFull() {
    return size == capacity;
}`,
      cpp: `bool isFull() const {
    return count == capacity;
}`,
      c: `int isFull(int rear, int capacity) {
    return (rear == capacity - 1);
}`,
    },
    timeComplexity: 'O(1) Constant Time',
    spaceComplexity: 'O(1) Auxiliary Space',
    keyTakeaway:
      'isFull() protects fixed buffers from Overflow. Linked list queues do not need isFull() because they grow dynamically.',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 09: LINEAR QUEUE
  // =========================================================================
  {
    id: 9,
    chapterNumber: '09',
    categoryLabel: 'IMPLEMENTATIONS',
    lessonNumber: 9,
    title: '9. Linear Queue',
    shortDesc: 'Sequential array queue and its fatal "False Overflow" limitation.',
    readTime: '3 min read',
    executiveDefinition:
      'A Linear Queue is an array-based queue where FRONT and REAR monotonically shift forward from left to right.',
    criticalSpecifications: [
      'Simple implementation: Direct indexing via array[rear] and array[front].',
      'The "False Overflow" Flaw: Once REAR reaches the final index, no new elements can be enqueued even if earlier slots were freed up by dequeues!',
      'Memory Wastage: Dequeued elements leave unused empty slots at the beginning of the array.',
      'Remedy: Circular Queue or element shifting (shifting costs O(N) time per dequeue).',
    ],
    analogy: {
      title: 'One-Way Conveyor with Dead End',
      description:
        'Imagine a conveyor belt that can only push forward. Once you fill the rightmost slot, the belt cannot accept new boxes, even if the leftmost half is completely empty!',
    },
    example: {
      title: 'The False Overflow Dilemma',
      description: 'Array size: 4. Enqueue 4 items, then dequeue 2 items.',
      steps: [
        'Enqueue(10), Enqueue(20), Enqueue(30), Enqueue(40) → Queue is FULL.',
        'Dequeue() → 10 leaves. Slot 0 is now EMPTY.',
        'Dequeue() → 20 leaves. Slot 1 is now EMPTY.',
        'Current Queue: Slots 0 and 1 are free! But REAR is still at index 3.',
        'Enqueue(50) attempted → Error: "Queue is Full" (FALSE OVERFLOW)!',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'The False Overflow Problem',
      notes: 'Slots 0 and 1 are empty, yet Enqueue fails because REAR = 3!',
      diagramText: `  FALSE OVERFLOW SCENARIO:
             FRONT = 2    REAR = 3 (End of Array)
                 ↓           ↓
  ┌──────────┬──────────┬──────────┬──────────┐
  │ [EMPTY]  │ [EMPTY]  │    30    │    40    │
  └──────────┴──────────┴──────────┴──────────┘
    Index 0    Index 1    Index 2    Index 3
    ▲ Free!    ▲ Free!
    Enqueue(50) FAILS because rear == capacity - 1!`,
    },
    codeSnippet: {
      python: `# Demonstrating linear queue false overflow
class LinearQueue:
    def __init__(self, cap):
        self.cap = cap
        self.arr = [None] * cap
        self.front = 0
        self.rear = -1

    def enqueue(self, val):
        if self.rear == self.cap - 1:
            # Fails even if front > 0!
            raise OverflowError("False Overflow: rear reached end!")
        self.rear += 1
        self.arr[self.rear] = val`,
      java: `// Linear Queue False Overflow in Java
public class LinearQueue {
    int[] arr;
    int front = 0, rear = -1, capacity;

    public void enqueue(int val) {
        if (rear == capacity - 1) {
            // Cannot insert even if front > 0!
            System.out.println("False Overflow!");
            return;
        }
        arr[++rear] = val;
    }
}`,
      cpp: `// Linear Queue in C++
void enqueue(int val) {
    if (rear == capacity - 1) {
        std::cout << "False Overflow: Memory wasted at indices < front\\n";
        return;
    }
    arr[++rear] = val;
}`,
      c: `// Linear Queue in C
if (rear == MAX - 1) {
    printf("False Overflow: Cannot enqueue!\\n");
}`,
    },
    timeComplexity: 'O(1) Enqueue; O(1) Dequeue (or O(N) if shifting)',
    spaceComplexity: 'O(N) memory with high wastage',
    keyTakeaway:
      'Linear Queues suffer from False Overflow: slots freed at the front cannot be reused. This motivates the Circular Queue.',
    interactiveDemoType: 'queue-pointers',
  },

  // =========================================================================
  // CHAPTER 10: CIRCULAR QUEUE
  // =========================================================================
  {
    id: 10,
    chapterNumber: '10',
    categoryLabel: 'IMPLEMENTATIONS',
    lessonNumber: 10,
    title: '10. Circular Queue',
    shortDesc: 'Eliminating memory wastage using modulo arithmetic wraparound.',
    readTime: '3 min read',
    executiveDefinition:
      'A Circular Queue is an optimized ring buffer where the last position is logically connected back to the first position using modulo arithmetic, completely eliminating False Overflow.',
    criticalSpecifications: [
      'Wraparound Formula: next_index = (current_index + 1) % capacity.',
      'Full condition: (rear + 1) % capacity == front (or count == capacity).',
      'Empty condition: count == 0 (or front == -1).',
      'True O(1) operations: Zero element shifting; 100% memory utilization of all allocated slots.',
    ],
    analogy: {
      title: 'Roundabout Traffic Circle / Clock Face',
      description:
        'A circular traffic roundabout has no dead ends. After passing exit 5, you smoothly wrap around back to exit 0. Just like 12 o’clock on a clock face wraps back to 1 o’clock.',
    },
    example: {
      title: 'Wrap-Around in Action',
      description: 'Capacity: 5. REAR is at index 4. Dequeue has freed index 0.',
      steps: [
        'Queue: [EMPTY, 20, 30, 40, 50] (FRONT = 1, REAR = 4)',
        'Calculate next REAR: (4 + 1) % 5 = 0!',
        'Enqueue(60): Placed at index 0. REAR is now 0.',
        'Result: Space freed by previous dequeue is fully reused!',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Circular Ring Buffer Layout',
      notes: 'Pointers wrap from index 4 back to index 0 using % 5.',
      diagramText: `             [0] ◄── REAR Wraps Here!
           ↗     ↖
        [4]       [1]
         ▲         ▼
        [3] ◄───► [2]

  FORMULA:
  rear = (rear + 1) % CAPACITY
  front = (front + 1) % CAPACITY`,
    },
    codeSnippet: {
      python: `class CircularQueue:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.queue = [None] * capacity
        self.front = -1
        self.rear = -1
        self.size = 0

    def enqueue(self, val):
        if self.size == self.cap:
            raise OverflowError("Circular Queue is Full!")
        if self.front == -1:
            self.front = 0
        self.rear = (self.rear + 1) % self.cap
        self.queue[self.rear] = val
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise IndexError("Circular Queue is Empty!")
        val = self.queue[self.front]
        self.front = (self.front + 1) % self.cap
        self.size -= 1
        return val`,
      java: `public class CircularQueue {
    private int[] data;
    private int front = 0, rear = -1, size = 0, cap;

    public CircularQueue(int capacity) {
        this.cap = capacity;
        this.data = new int[capacity];
    }

    public void enqueue(int val) {
        if (size == cap) throw new IllegalStateException("Queue Full!");
        rear = (rear + 1) % cap;
        data[rear] = val;
        size++;
    }

    public int dequeue() {
        if (size == 0) throw new NoSuchElementException("Queue Empty!");
        int val = data[front];
        front = (front + 1) % cap;
        size--;
        return val;
    }
}`,
      cpp: `class CircularQueue {
    int *arr, front, rear, size, cap;
public:
    CircularQueue(int k) : cap(k), front(0), rear(-1), size(0) {
        arr = new int[k];
    }
    bool enqueue(int value) {
        if (size == cap) return false;
        rear = (rear + 1) % cap;
        arr[rear] = value;
        size++;
        return true;
    }
    int dequeue() {
        if (size == 0) return -1;
        int val = arr[front];
        front = (front + 1) % cap;
        size--;
        return val;
    }
};`,
      c: `void enqueue(int q[], int *rear, int *front, int *size, int val, int cap) {
    if (*size == cap) return; // Full
    *rear = (*rear + 1) % cap;
    q[*rear] = val;
    (*size)++;
}`,
    },
    timeComplexity: 'O(1) Enqueue, O(1) Dequeue',
    spaceComplexity: 'O(N) with zero memory wastage',
    keyTakeaway:
      'Circular Queues wrap pointers using (index + 1) % capacity, achieving O(1) operations with zero wasted memory.',
    interactiveDemoType: 'queue-circular',
  },
];
