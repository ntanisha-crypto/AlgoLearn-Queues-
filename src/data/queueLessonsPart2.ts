import { TheoryLesson } from '../types';

export const QUEUE_LESSONS_PART2: TheoryLesson[] = [
  // =========================================================================
  // CHAPTER 11: QUEUE USING LINKED LIST
  // =========================================================================
  {
    id: 11,
    chapterNumber: '11',
    categoryLabel: 'IMPLEMENTATIONS',
    lessonNumber: 11,
    title: '11. Queue Using Linked List',
    shortDesc: 'Dynamic memory allocation with Head (FRONT) and Tail (REAR) pointers.',
    readTime: '3 min read',
    executiveDefinition:
      'A Linked List Queue represents each element as an independent heap-allocated node containing data and a next pointer, maintaining a FRONT pointer at the head and a REAR pointer at the tail.',
    criticalSpecifications: [
      'Truly dynamic size: Grows and shrinks on demand; never overflows unless host system runs out of RAM.',
      'Two-pointer mandate: Must maintain both FRONT (head) and REAR (tail) pointers to achieve O(1) performance for both operations.',
      'Enqueue algorithm: Create node -> rear.next = newNode -> rear = newNode (O(1)).',
      'Dequeue algorithm: temp = front -> front = front.next -> free(temp) (O(1)).',
    ],
    analogy: {
      title: 'Train Cars Linked by Couplers',
      description:
        'A train can attach a new cargo car to the rear in seconds (Enqueue) and uncouple the front locomotive to depart (Dequeue). The train can grow to 100 cars without needing to rebuild the tracks.',
    },
    example: {
      title: 'Node Pointers Evolution',
      description: 'Step-by-step chaining of nodes in memory.',
      steps: [
        'Start: FRONT = null, REAR = null',
        'Enqueue(10): Node[10|null]. FRONT and REAR both point to Node 10.',
        'Enqueue(20): Node[10|->20] -> Node[20|null]. REAR moves to Node 20.',
        'Enqueue(30): Node[20|->30] -> Node[30|null]. REAR moves to Node 30.',
        'Dequeue(): FRONT moves to Node 20. Node 10 is deallocated.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Singly Linked List Queue',
      notes: 'FRONT tracks Head (deletion); REAR tracks Tail (insertion).',
      diagramText: `  FRONT (Head)                                           REAR (Tail)
     ↓                                                       ↓
  ┌──────────┬─────┐     ┌──────────┬─────┐     ┌──────────┬─────┐
  │    10    │  •──┼────►│    20    │  •──┼────►│    30    │ NULL│
  └──────────┴─────┘     └──────────┴─────┘     └──────────┴─────┘
    Dequeue here                                  Enqueue here
    front = front.next                            rear.next = newNode; rear = newNode`,
    },
    codeSnippet: {
      python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedListQueue:
    def __init__(self):
        self.front = None
        self.rear = None

    def enqueue(self, val):
        new_node = Node(val)
        if not self.rear:
            self.front = self.rear = new_node
            return
        self.rear.next = new_node
        self.rear = new_node

    def dequeue(self):
        if not self.front:
            raise IndexError("Queue Underflow!")
        val = self.front.val
        self.front = self.front.next
        if not self.front:
            self.rear = None
        return val`,
      java: `class Node {
    int data;
    Node next;
    Node(int d) { data = d; }
}

public class LinkedQueue {
    Node front, rear;

    public void enqueue(int val) {
        Node newNode = new Node(val);
        if (rear == null) {
            front = rear = newNode;
            return;
        }
        rear.next = newNode;
        rear = newNode;
    }

    public int dequeue() {
        if (front == null) throw new NoSuchElementException("Queue Underflow!");
        int val = front.data;
        front = front.next;
        if (front == null) rear = null;
        return val;
    }
}`,
      cpp: `struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

class LinkedQueue {
    Node *front = nullptr, *rear = nullptr;
public:
    void enqueue(int val) {
        Node* node = new Node(val);
        if (!rear) { front = rear = node; return; }
        rear->next = node;
        rear = node;
    }
    int dequeue() {
        if (!front) return -1;
        Node* temp = front;
        int val = temp->data;
        front = front->next;
        if (!front) rear = nullptr;
        delete temp;
        return val;
    }
};`,
      c: `// C Linked List Queue node insertion and deletion in O(1)`,
    },
    timeComplexity: 'O(1) Enqueue and O(1) Dequeue',
    spaceComplexity: 'O(N) with extra pointer overhead per node',
    keyTakeaway:
      'Linked List Queues eliminate size constraints. Both operations remain O(1) provided you maintain both FRONT and REAR pointers.',
    interactiveDemoType: 'queue-linkedlist',
  },

  // =========================================================================
  // CHAPTER 12: DEQUE (DOUBLE-ENDED QUEUE)
  // =========================================================================
  {
    id: 12,
    chapterNumber: '12',
    categoryLabel: 'VARIANTS',
    lessonNumber: 12,
    title: '12. Deque',
    shortDesc: 'Double-ended queue allowing insertions and deletions at both ends.',
    readTime: '3 min read',
    executiveDefinition:
      'A Deque (Double-Ended Queue, pronounced "deck") is a generalized linear sequence that supports inserting and deleting elements at both the FRONT and REAR in O(1) time.',
    criticalSpecifications: [
      'Four Primary Operations: insertFront(), insertRear(), deleteFront(), deleteRear().',
      'Unified Super-Structure: Can function as a FIFO Queue (insertRear + deleteFront) or a LIFO Stack (insertFront + deleteFront).',
      'Implementation: Typically backed by a circular dynamic array or a Doubly-Linked List.',
      'Classic Applications: Sliding Window Maximum, palindrome verification, browser undo-redo history.',
    ],
    analogy: {
      title: 'Double-Ended Highway Tunnel',
      description:
        'A two-way tunnel where cars can enter or exit from either the North portal or the South portal at will.',
    },
    example: {
      title: 'Emulating Stack and Queue with Deque',
      description: 'Demonstrating behavioral versatility.',
      steps: [
        'Queue Mode: insertRear(10), insertRear(20) -> deleteFront() returns 10 (FIFO).',
        'Stack Mode: insertFront(10), insertFront(20) -> deleteFront() returns 20 (LIFO).',
        'Deque Flexibility: insertFront(5), insertRear(25) -> deleteRear() returns 25.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Double-Ended Queue (Deque) Diagram',
      notes: 'Both ends are open for bidirectional insertion and deletion.',
      diagramText: `  insertFront() ──►                      ◄── insertRear()
  deleteFront() ◄──                      ──► deleteRear()
                   FRONT            REAR
                  ┌──────┬──────┬──────┐
                  │  10  │  20  │  30  │
                  └──────┴──────┴──────┘
                  Bidirectional O(1) Access`,
    },
    codeSnippet: {
      python: `from collections import deque

d = deque()
d.append(30)       # insertRear
d.appendleft(20)   # insertFront
d.appendleft(10)   # insertFront -> [10, 20, 30]

print(d.pop())     # deleteRear -> 30
print(d.popleft()) # deleteFront -> 10`,
      java: `import java.util.ArrayDeque;
import java.util.Deque;

Deque<Integer> dq = new ArrayDeque<>();
dq.addFirst(10); // insertFront
dq.addLast(20);  // insertRear
dq.addLast(30);  // insertRear

System.out.println(dq.removeFirst()); // deleteFront -> 10
System.out.println(dq.removeLast());  // deleteRear -> 30`,
      cpp: `#include <iostream>
#include <deque>

int main() {
    std::deque<int> dq;
    dq.push_front(10);
    dq.push_back(20);
    dq.push_back(30);

    dq.pop_front(); // removes 10
    dq.pop_back();  // removes 30
    return 0;
}`,
      c: `// Deque in C using circular array or doubly linked list`,
    },
    timeComplexity: 'O(1) for all four front and rear operations',
    spaceComplexity: 'O(N) storage',
    keyTakeaway:
      'A Deque is a versatile hybrid that supports insertion and deletion at both ends, effortlessly emulating both Stacks and Queues.',
    interactiveDemoType: 'queue-deque',
  },

  // =========================================================================
  // CHAPTER 13: PRIORITY QUEUE
  // =========================================================================
  {
    id: 13,
    chapterNumber: '13',
    categoryLabel: 'VARIANTS',
    lessonNumber: 13,
    title: '13. Priority Queue',
    shortDesc: 'Serving elements based on priority rather than arrival time.',
    readTime: '3 min read',
    executiveDefinition:
      'A Priority Queue is an abstract data type where each element is associated with a priority value: elements with higher priority are dequeued before elements with lower priority, regardless of insertion order.',
    criticalSpecifications: [
      'Priority Over Order: Arrival sequence is overridden by priority rank.',
      'Tie-breaking: Elements with equal priority are typically served FIFO.',
      'Internal Engine: Almost universally implemented using a Binary Heap (Min-Heap or Max-Heap).',
      'Complexities: Enqueue in O(log N), Dequeue (extract min/max) in O(log N), Peek top in O(1).',
    ],
    analogy: {
      title: 'Hospital Emergency Room Triage',
      description:
        'A patient with a minor headache arrives at 8:00 AM. A patient with a severe heart attack arrives at 8:30 AM. Doctors immediately treat the heart attack patient first because life-threat priority overrides arrival time.',
    },
    example: {
      title: 'Triage Queue Execution',
      description: 'Elements inserted: (C, Priority 3), (B, Priority 2), (A, Priority 1).',
      steps: [
        'Enqueue Task C (Priority 3 - Low)',
        'Enqueue Task B (Priority 2 - Medium)',
        'Enqueue Task A (Priority 1 - High / Urgent)',
        'Dequeue() → Extracts Task A first (Priority 1)!',
        'Dequeue() → Extracts Task B second (Priority 2).',
        'Dequeue() → Extracts Task C last (Priority 3).',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Priority Queue (Min-Heap) Reordering',
      notes: 'Priority 1 bubbles to FRONT ahead of Priority 2 and 3.',
      diagramText: `  Incoming: [Task C (P3)] then [Task A (P1)]

  PRIORITY QUEUE FRONT:
  ┌──────────────────┬──────────────────┬──────────────────┐
  │  Task A (P1) ★   │   Task B (P2)    │   Task C (P3)    │
  └──────────────────┴──────────────────┴──────────────────┘
    Next Extracted       Waiting            Waiting
    (Highest Priority Always Exits First)`,
    },
    codeSnippet: {
      python: `import heapq

pq = []
# heapq implements a Min-Heap: (priority, data)
heapq.heappush(pq, (3, "Routine Task"))
heapq.heappush(pq, (1, "CRITICAL ERROR"))
heapq.heappush(pq, (2, "Important Update"))

# Extracts highest priority (lowest number) first
priority, task = heapq.heappop(pq)
print(f"Executed: {task} (Priority {priority})")
# Output: Executed: CRITICAL ERROR (Priority 1)`,
      java: `import java.util.PriorityQueue;

PriorityQueue<Integer> pq = new PriorityQueue<>(); // Min-Heap
pq.add(30);
pq.add(10); // Higher priority (smaller val)
pq.add(20);

System.out.println(pq.poll()); // 10
System.out.println(pq.poll()); // 20
System.out.println(pq.poll()); // 30`,
      cpp: `#include <iostream>
#include <queue>

int main() {
    // Max-Heap by default
    std::priority_queue<int> pq;
    pq.push(10);
    pq.push(30);
    pq.push(20);

    std::cout << pq.top() << std::endl; // 30 (Largest first)
    pq.pop();
    return 0;
}`,
      c: `// Priority Queue in C typically implemented with binary heap array`,
    },
    timeComplexity: 'O(log N) Enqueue, O(log N) Dequeue, O(1) Peek',
    spaceComplexity: 'O(N) heap storage',
    keyTakeaway:
      'In a Priority Queue, urgency takes precedence over arrival order. Elements with the highest priority leave first.',
    interactiveDemoType: 'queue-priority',
  },

  // =========================================================================
  // CHAPTER 14: QUEUE OVERFLOW
  // =========================================================================
  {
    id: 14,
    chapterNumber: '14',
    categoryLabel: 'EDGE CASES',
    lessonNumber: 14,
    title: '14. Queue Overflow',
    shortDesc: 'The critical error condition when inserting into a full queue.',
    readTime: '2 min read',
    executiveDefinition:
      'Queue Overflow is an exception state that triggers when an Enqueue operation is attempted on a queue that has reached its maximum allocated capacity.',
    criticalSpecifications: [
      'Occurs strictly in fixed-size buffers (arrays) when capacity is exhausted.',
      'Precondition guard: Must test isFull() before performing Enqueue.',
      'System risks: Unchecked overflow leads to memory corruption, segmentation faults, or buffer overwrites.',
      'Prevention strategies: Use dynamic resizing arrays (like Java ArrayList/Python deque) or linked lists.',
    ],
    analogy: {
      title: 'Pouring Coffee into a Brim-Full Mug',
      description:
        'If a mug is already filled to the brim (Capacity = 250ml) and you continue pouring coffee, it spills uncontrollably over the desk. In computing, that spill is a buffer overflow.',
    },
    example: {
      title: 'Overflow Interception Example',
      description: 'Capacity: 3. Items present: [10, 20, 30].',
      steps: [
        'Queue: [10, 20, 30] (Size = 3, Max = 3)',
        'User initiates: Enqueue(40)',
        'Guard check: isFull() evaluates to TRUE',
        'Throw error: "Queue Overflow Exception" — Enqueue blocked safely.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Overflow Barrier',
      notes: 'No free slots remain in the buffer.',
      diagramText: `  CAPACITY = 3 (ALL SLOTS OCCUPIED)
  ┌──────────┬──────────┬──────────┐
  │    10    │    20    │    30    │  ◄── Enqueue(40) BLOCKED!
  └──────────┴──────────┴──────────┘
  isFull() === true  ➔  OVERFLOW EXCEPTION`,
    },
    codeSnippet: {
      python: `def safe_enqueue(queue, item, max_cap):
    if len(queue) >= max_cap:
        raise OverflowError("Queue Overflow: Capacity exceeded!")
    queue.append(item)`,
      java: `public void enqueue(int val) {
    if (isFull()) {
        throw new IllegalStateException("Queue Overflow: Buffer is full!");
    }
    data[++rear] = val;
}`,
      cpp: `void enqueue(int val) {
    if (isFull()) {
        throw std::overflow_error("Queue Overflow!");
    }
    arr[++rear] = val;
}`,
      c: `void enqueue(int val) {
    if (rear == MAX - 1) {
        printf("Error: Queue Overflow!\\n");
        return;
    }
    queue[++rear] = val;
}`,
    },
    timeComplexity: 'O(1) overflow check',
    spaceComplexity: 'O(1)',
    keyTakeaway:
      'Queue Overflow occurs when you enqueue into a full buffer. Guard against it by always checking isFull() first.',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 15: QUEUE UNDERFLOW
  // =========================================================================
  {
    id: 15,
    chapterNumber: '15',
    categoryLabel: 'EDGE CASES',
    lessonNumber: 15,
    title: '15. Queue Underflow',
    shortDesc: 'The critical error condition when extracting from an empty queue.',
    readTime: '2 min read',
    executiveDefinition:
      'Queue Underflow is an exception state that triggers when a Dequeue or Peek operation is attempted on a queue that contains zero elements.',
    criticalSpecifications: [
      'Universal edge case: Occurs in ALL queue types (arrays, circular queues, linked lists).',
      'Precondition guard: Must test isEmpty() before every Dequeue() or Peek().',
      'Consequence of neglect: Null pointer dereferences, reading garbage memory, or crash exceptions.',
      'Handling: Return special sentinel (like null or -1) or throw a descriptive exception.',
    ],
    analogy: {
      title: 'Dispensing from an Empty Vending Machine',
      description:
        'You insert money and press the button for a soda that has 0 cans in stock. The spiral spins, but nothing drops. The machine display reads "EMPTY".',
    },
    example: {
      title: 'Underflow Interception Example',
      description: 'Queue holds 0 items (FRONT = -1, REAR = -1).',
      steps: [
        'Queue state: []',
        'User initiates: Dequeue()',
        'Guard check: isEmpty() evaluates to TRUE',
        'Action: Abort operation with "Queue Underflow: Queue is empty!"',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Underflow Barrier',
      notes: 'No elements available to dequeue or peek.',
      diagramText: `  EMPTY QUEUE BUFFER (Size = 0)
  ┌──────────┬──────────┬──────────┐
  │ [EMPTY]  │ [EMPTY]  │ [EMPTY]  │
  └──────────┴──────────┴──────────┘
  Dequeue() ATTEMPTED ➔ BLOCKED!
  isEmpty() === true  ➔  UNDERFLOW EXCEPTION`,
    },
    codeSnippet: {
      python: `def safe_dequeue(queue):
    if not queue:
        raise IndexError("Queue Underflow: Cannot dequeue from empty queue!")
    return queue.pop(0)`,
      java: `public int dequeue() {
    if (isEmpty()) {
        throw new NoSuchElementException("Queue Underflow: Queue is empty!");
    }
    return data[front++];
}`,
      cpp: `int dequeue() {
    if (isEmpty()) {
        throw std::underflow_error("Queue Underflow!");
    }
    return arr[front++];
}`,
      c: `int dequeue() {
    if (front == -1 || front > rear) {
        printf("Error: Queue Underflow!\\n");
        return -1;
    }
    return queue[front++];
}`,
    },
    timeComplexity: 'O(1) underflow check',
    spaceComplexity: 'O(1)',
    keyTakeaway:
      'Queue Underflow occurs when you dequeue from an empty queue. Always check isEmpty() to prevent fatal crashes.',
    interactiveDemoType: 'queue-sandbox',
  },

  // =========================================================================
  // CHAPTER 16: QUEUE APPLICATIONS
  // =========================================================================
  {
    id: 16,
    chapterNumber: '16',
    categoryLabel: 'REAL-WORLD',
    lessonNumber: 16,
    title: '16. Queue Applications',
    shortDesc: 'Real-world software systems and hardware architectures powered by Queues.',
    readTime: '3 min read',
    executiveDefinition:
      'Queues are the foundational data structure for decoupling producers and consumers in operating systems, networking, distributed message brokers, and concurrency.',
    criticalSpecifications: [
      'CPU Scheduling: Ready queues in Operating Systems schedule processes fairly (e.g. Round Robin).',
      'Print Spooling: Multiple print jobs are processed in the strict chronological order they were submitted.',
      'Asynchronous Buffering: Keyboard typing buffers, audio packet streaming, and video buffering.',
      'Distributed Message Brokers: RabbitMQ, Apache Kafka, AWS SQS, and Celery handle asynchronous background tasks.',
    ],
    analogy: {
      title: 'Fast Food Drive-Thru Window Pipeline',
      description:
        'The kitchen staff cooks orders asynchronously. Orders wait on a warming shelf (Queue) and are handed to customers in the exact order they paid.',
    },
    example: {
      title: 'Four Major Engineering Applications',
      description: 'Every modern computing platform depends on Queues.',
      steps: [
        '1. OS Round Robin: Processes take turns in CPU time slices via a circular queue.',
        '2. Print Spooler: Documents from 5 office computers queue up for 1 printer.',
        '3. Keyboard Buffer: Keystrokes are buffered so fast typing is never lost during slow UI renders.',
        '4. Cloud Tasks: Background email jobs queue up in Redis/Kafka for asynchronous workers.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'Producer-Consumer Architecture',
      notes: 'Queue decouples fast producers from slower consumers.',
      diagramText: `  PRODUCERS (Users / Sensors)          FIFO BUFFER QUEUE          CONSUMERS (Workers / Servers)
  ┌───────────────┐                  ┌─────────────────┐        ┌───────────────┐
  │ HTTP Requests │ ── Enqueue ────► │ [Req3][Req2][Req1] ├── Deq──►│ Worker Node 1 │
  │ Print Jobs    │                  └─────────────────┘        │ Worker Node 2 │
  └───────────────┘                                             └───────────────┘`,
    },
    codeSnippet: {
      python: `# Producer-Consumer pattern using Python queue.Queue
import queue
import threading
import time

q = queue.Queue()

def producer():
    for i in range(5):
        q.put(f"Task_{i}")
        print(f"Enqueued Task_{i}")
        time.sleep(0.1)

def consumer():
    while True:
        task = q.get()
        print(f"Processing {task}")
        q.task_done()`,
      java: `// BlockingQueue in Java Concurrent API
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

BlockingQueue<String> printQueue = new ArrayBlockingQueue<>(10);
printQueue.put("Doc1.pdf");
String nextJob = printQueue.take();`,
      cpp: `// std::queue used in task dispatchers
#include <queue>
#include <string>

std::queue<std::string> jobQueue;
jobQueue.push("RenderFrame_1");
jobQueue.push("RenderFrame_2");`,
      c: `// Circular buffer in C embedded systems for UART serial communications`,
    },
    timeComplexity: 'O(1) message pass',
    spaceComplexity: 'O(N) message buffer',
    keyTakeaway:
      'Queues act as asynchronous shock absorbers in software, harmonizing speed differences between producers and consumers.',
    interactiveDemoType: 'queue-real-world',
  },

  // =========================================================================
  // CHAPTER 17: QUEUE AND BFS
  // =========================================================================
  {
    id: 17,
    chapterNumber: '17',
    categoryLabel: 'ALGORITHMS',
    lessonNumber: 17,
    title: '17. Queue and BFS',
    shortDesc: 'Why Breadth-First Search in graphs and trees strictly requires a Queue.',
    readTime: '3 min read',
    executiveDefinition:
      'Breadth-First Search (BFS) is a graph/tree traversal algorithm that visits nodes level-by-level, and its correctness relies strictly on the FIFO property of a Queue.',
    criticalSpecifications: [
      'Level-Order Traversal: All nodes at distance K from root are visited before any node at distance K+1.',
      'Why FIFO is mandatory: When node U is dequeued, its children are enqueued at the REAR. This guarantees all siblings of U are processed before any of U’s children!',
      'Contrast with DFS: DFS uses a Stack (or recursion) to go deep first; BFS uses a Queue to go wide first.',
      'Shortest Path Guarantee: In unweighted graphs, BFS is guaranteed to discover the shortest path.',
    ],
    analogy: {
      title: 'Water Ripple Spreading in a Pond',
      description:
        'When you drop a stone in water, waves expand in concentric rings (Ring 1, then Ring 2, then Ring 3). The ripple never jumps to Ring 3 before covering Ring 2 completely.',
    },
    example: {
      title: 'BFS Step-by-Step with Tree',
      description: 'Tree: A has children B, C. B has children D, E.',
      steps: [
        'Queue: [A] → Dequeue A, Visit A. Enqueue children B, C. Queue: [B, C].',
        'Queue: [B, C] → Dequeue B, Visit B. Enqueue children D, E. Queue: [C, D, E].',
        'Queue: [C, D, E] → Dequeue C, Visit C. (Level 1 fully visited before D and E!).',
        'Queue: [D, E] → Dequeue D, Visit D. Dequeue E, Visit E. BFS Complete!',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'BFS Traversal Order via Queue',
      notes: 'Level 0 (A) → Level 1 (B, C) → Level 2 (D, E, F).',
      diagramText: `        (A)              Level 0: Visited first
       /   \\
     (B)   (C)           Level 1: Enqueued behind A
    /   \\     \\
  (D)   (E)   (F)        Level 2: Enqueued behind B, C

  QUEUE TRACE:
  [A] ──► [B, C] ──► [C, D, E] ──► [D, E, F] ──► []
  VISIT ORDER: A ➔ B ➔ C ➔ D ➔ E ➔ F`,
    },
    codeSnippet: {
      python: `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])

    while queue:
        node = queue.popleft() # Dequeue from FRONT
        print(f"Visited: {node}")

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor) # Enqueue at REAR`,
      java: `public void bfs(Map<Integer, List<Integer>> adj, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> q = new LinkedList<>();

    visited.add(start);
    q.offer(start);

    while (!q.isEmpty()) {
        int u = q.poll();
        System.out.println("Visited: " + u);
        for (int v : adj.get(u)) {
            if (!visited.contains(v)) {
                visited.add(v);
                q.offer(v);
            }
        }
    }
}`,
      cpp: `void bfs(int start, const vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,
      c: `// BFS in C using queue array and adjacency list`,
    },
    timeComplexity: 'O(V + E) where V is vertices and E is edges',
    spaceComplexity: 'O(V) for queue storage',
    keyTakeaway:
      'BFS relies on a FIFO Queue to guarantee level-order exploration and find the shortest path in unweighted graphs.',
    interactiveDemoType: 'queue-bfs',
  },

  // =========================================================================
  // CHAPTER 18: QUEUE COMPLEXITY — QUICK REVISION
  // =========================================================================
  {
    id: 18,
    chapterNumber: '18',
    categoryLabel: 'ANALYSIS',
    lessonNumber: 18,
    title: '18. Queue Complexity — Quick Revision',
    shortDesc: 'Comprehensive asymptotic time and space reference across all implementations.',
    readTime: '2 min read',
    executiveDefinition:
      'A concise master reference comparing the asymptotic time and space complexities of Linear Queue, Circular Queue, Linked List Queue, Deque, and Priority Queue.',
    criticalSpecifications: [
      'Circular Queue: O(1) Enqueue, O(1) Dequeue, O(1) Peek, O(N) Space. Zero memory wastage.',
      'Linked List Queue: O(1) Enqueue, O(1) Dequeue, O(1) Peek, O(N) Space. Dynamic size.',
      'Linear Queue: O(1) Enqueue, O(1) Dequeue (with False Overflow) or O(N) Dequeue (with shifting).',
      'Priority Queue (Heap): O(log N) Enqueue, O(log N) Dequeue, O(1) Peek.',
    ],
    analogy: {
      title: 'Sports Performance Spec Sheet',
      description:
        'Just as a car spec sheet lists 0-60mph acceleration, top speed, and fuel efficiency, a complexity table tells an engineer which queue design performs best under heavy loads.',
    },
    example: {
      title: 'Choosing the Optimal Implementation',
      description: 'Engineering decision framework.',
      steps: [
        'Known fixed capacity + max speed needed? → Choose Circular Queue (Array).',
        'Unknown / highly volatile size? → Choose Linked List Queue.',
        'Need to insert/remove at both ends? → Choose Deque.',
        'Need highest priority items first? → Choose Priority Queue (Heap).',
      ],
    },
    visualDiagram: {
      type: 'complexity-table',
      operationLabel: 'Asymptotic Complexity Comparison',
      notes: 'Circular Queue and Linked List Queue provide guaranteed O(1) core operations.',
      diagramText: `  ┌───────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Implementation        │ Enqueue  │ Dequeue  │   Peek   │  Search  │  Space   │
  ├───────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
  │ Circular Queue        │   O(1)   │   O(1)   │   O(1)   │   O(N)   │   O(N)   │
  │ Linked List Queue     │   O(1)   │   O(1)   │   O(1)   │   O(N)   │   O(N)   │
  │ Linear Queue (Naive)  │   O(1)   │  O(1)*   │   O(1)   │   O(N)   │   O(N)   │
  │ Deque                 │   O(1)   │   O(1)   │   O(1)   │   O(N)   │   O(N)   │
  │ Priority Queue (Heap) │ O(log N) │ O(log N) │   O(1)   │   O(N)   │   O(N)   │
  └───────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
  *Linear Queue suffers from False Overflow without O(N) element shifting.`,
    },
    codeSnippet: {
      python: `# Complexity Cheat Sheet
# Circular Queue: Enqueue O(1), Dequeue O(1)
# Linked List Queue: Enqueue O(1), Dequeue O(1)
# Priority Queue (Heap): Enqueue O(log N), Dequeue O(log N)`,
      java: `// Quick Complexity Reference
// ArrayDeque.offer() -> O(1)
// ArrayDeque.poll()  -> O(1)
// PriorityQueue.offer() -> O(log N)
// PriorityQueue.poll()  -> O(log N)`,
      cpp: `// Complexity:
// std::queue::push() -> O(1)
// std::queue::pop()  -> O(1)
// std::priority_queue::push() -> O(log N)
// std::priority_queue::pop()  -> O(log N)`,
      c: `// Complexity: All pointer updates in circular queue run in O(1) time`,
    },
    timeComplexity: 'O(1) lookup in table',
    spaceComplexity: 'O(1)',
    keyTakeaway:
      'Circular Queue and Linked List Queue both achieve O(1) Enqueue and Dequeue. Choose Circular Queue for fixed buffers and Linked List for dynamic sizes.',
    interactiveDemoType: 'queue-complexity',
  },

  // =========================================================================
  // CHAPTER 19: ENTIRE QUEUE CONCEPT IN ONE DIAGRAM
  // =========================================================================
  {
    id: 19,
    chapterNumber: '19',
    categoryLabel: 'MASTER MAP',
    lessonNumber: 19,
    title: '19. Entire Queue Concept in One Diagram',
    shortDesc: 'A panoramic architectural map connecting principles, variants, and applications.',
    readTime: '3 min read',
    executiveDefinition:
      'A holistic mental map integrating the Queue definition, FIFO invariants, pointers, operations, implementation models, variants, algorithms, and real-world systems into a single visual framework.',
    criticalSpecifications: [
      'Core Invariant: First In, First Out (FIFO) with dual-ended access.',
      'Operations Suite: Enqueue at REAR, Dequeue at FRONT, Peek at FRONT, isEmpty, isFull.',
      'Underlying Models: Array (Linear vs Circular) and Linked List.',
      'Extended Variants: Deque (Double-Ended), Priority Queue (Heap-based).',
      'System Role: Powers BFS graph traversal, OS Round Robin scheduling, and asynchronous message buffers.',
    ],
    analogy: {
      title: 'Architectural Blueprint of an Airport Terminal',
      description:
        'Just like an airport blueprint shows check-in desks, security lines, baggage conveyors, and boarding gates in one coordinated flow, this diagram maps all queue components together.',
    },
    example: {
      title: 'Tracing the Entire Queue Ecosystem',
      description: 'How all concepts interlink.',
      steps: [
        '1. Principle: FIFO governs the lifecycle.',
        '2. Pointers: FRONT points to oldest (exit), REAR points to newest (entry).',
        '3. Prevention: isFull() guards Overflow; isEmpty() guards Underflow.',
        '4. Implementation: Modulo math transforms Linear into Circular.',
        '5. Application: Feeds BFS algorithms and OS task dispatchers.',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'The Unified Queue Concept Map',
      notes: 'Complete interconnected architecture of Queue data structures.',
      diagramText: `                     QUEUE DATA STRUCTURE (FIFO)
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
  CORE OPERATIONS                                   IMPLEMENTATIONS
  ├── Enqueue(x) [at REAR, O(1)]                    ├── Linear Array (Flaw: False Overflow)
  ├── Dequeue()  [at FRONT, O(1)]                   ├── Circular Queue [wrap: (i+1)%cap]
  ├── Peek()     [view FRONT, O(1)]                 └── Linked List (Dynamic, no limit)
  ├── isEmpty()  [guards Underflow]
  └── isFull()   [guards Overflow]
         │                                                 │
         └────────────────────────┬────────────────────────┘
                                  ▼
                    VARIANTS & APPLICATIONS
  ├── Deque (Double-Ended): Insert & delete at both FRONT and REAR
  ├── Priority Queue: Order determined by priority (Min/Max Heap)
  ├── Algorithms: Breadth-First Search (BFS level-order traversal)
  └── Systems: CPU Round Robin, Print Spooling, Kafka Buffering`,
    },
    codeSnippet: {
      python: `# Master Queue Ecosystem summary in Python
# 1. Standard FIFO Queue: collections.deque
# 2. Priority Queue: heapq
# 3. Thread-safe Buffer: queue.Queue
# 4. BFS Traversal: while q: node = q.popleft(); q.extend(neighbors)`,
      java: `// Master Queue Ecosystem in Java
// Queue<T> q = new ArrayDeque<>();     // Fast Circular Array
// Queue<T> q = new LinkedList<>();     // Node Chain
// PriorityQueue<T> pq = new PriorityQueue<>(); // Heap`,
      cpp: `// Master Queue Ecosystem in C++
// std::queue<T>          // FIFO adapter
// std::deque<T>          // Double-ended
// std::priority_queue<T> // Max-Heap`,
      c: `// Master Queue Ecosystem in C: Array with modulo wrap-around or linked nodes`,
    },
    timeComplexity: 'Conceptual Master View',
    spaceComplexity: 'Comprehensive Architectural Blueprint',
    keyTakeaway:
      'All Queue implementations share one fundamental truth: Elements enter at the REAR and depart from the FRONT in strictly preserved chronological order.',
    interactiveDemoType: 'queue-diagram',
  },

  // =========================================================================
  // CHAPTER 20: WHAT YOU SHOULD REMEMBER FIRST
  // =========================================================================
  {
    id: 20,
    chapterNumber: '20',
    categoryLabel: 'CHEAT SHEET',
    lessonNumber: 20,
    title: '20. What You Should Remember First',
    shortDesc: 'Top mental models, formulas, and interview golden rules for Queue mastery.',
    readTime: '2 min read',
    executiveDefinition:
      'The essential high-priority checklist of mental models, mathematical formulas, and coding idioms every software engineer must memorize for interviews and exams.',
    criticalSpecifications: [
      'Golden Rule 1: Queue is FIFO (First In, First Out); Stack is LIFO (Last In, First Out).',
      'Golden Rule 2: Enqueue adds to REAR; Dequeue removes from FRONT.',
      'Golden Rule 3: Circular Queue pointer formula is ALWAYS (index + 1) % capacity.',
      'Golden Rule 4: Always verify isEmpty() before Dequeue/Peek to prevent Underflow.',
      'Golden Rule 5: Always verify isFull() before Enqueue in static arrays to prevent Overflow.',
      'Golden Rule 6: BFS algorithms MUST use a Queue; DFS algorithms use a Stack.',
    ],
    analogy: {
      title: 'Pilot’s Pre-Flight Checklist',
      description:
        'Before taking off, an airline pilot reviews a laminated 6-item checklist. These 6 rules are your flight checklist for solving any queue problem with zero bugs.',
    },
    example: {
      title: 'The 6-Item Emergency Memory Checklist',
      description: 'Key formulas and invariants.',
      steps: [
        '1. FIFO: Arrival Order === Departure Order.',
        '2. Circular Wrap: rear = (rear + 1) % size.',
        '3. Underflow Guard: if (isEmpty()) throw Underflow.',
        '4. Overflow Guard: if (isFull()) throw Overflow.',
        '5. Linked List: Requires BOTH front and rear pointers for O(1).',
        '6. Traversal: Level-order / Shortest path = Queue (BFS).',
      ],
    },
    visualDiagram: {
      type: 'queue-ascii',
      operationLabel: 'The 6 Golden Rules of Queue Mastery',
      notes: 'Commit these six points to long-term memory.',
      diagramText: `  ┌────────────────────────────────────────────────────────────────────────┐
  │                   THE 6 GOLDEN RULES OF QUEUES                         │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 1. PRINCIPLE : FIFO (First In, First Out). First to arrive leaves first.│
  │ 2. POINTERS  : ENQUEUE at REAR ──► DEQUEUE at FRONT                   │
  │ 3. MODULO    : (index + 1) % capacity prevents False Overflow          │
  │ 4. SAFETY    : Check isEmpty() before Dequeue; isFull() before Enqueue │
  │ 5. GRAPH BFS : BFS strictly uses a QUEUE for level-by-level traversal  │
  │ 6. DUAL END  : Linked list needs FRONT & REAR pointers for O(1) speed  │
  └────────────────────────────────────────────────────────────────────────┘`,
    },
    codeSnippet: {
      python: `# The 3 Essential Queue Invariants to remember:
# 1. Circular pointer: next_idx = (curr_idx + 1) % capacity
# 2. Safe Dequeue: assert not is_empty(), "Underflow"
# 3. BFS pattern: while q: node = q.popleft(); q.extend(adj[node])`,
      java: `// The 3 Essential Queue Invariants to remember:
// 1. rear = (rear + 1) % capacity;
// 2. if (isEmpty()) throw new NoSuchElementException();
// 3. while (!q.isEmpty()) { int u = q.poll(); ... }`,
      cpp: `// The 3 Essential Queue Invariants to remember:
// 1. rear = (rear + 1) % cap;
// 2. if (isEmpty()) throw std::underflow_error("Empty");
// 3. while (!q.empty()) { int u = q.front(); q.pop(); ... }`,
      c: `// In C: Always guard (front == -1 || front > rear) before returning queue[front++]`,
    },
    timeComplexity: 'O(1) Mental Recall',
    spaceComplexity: 'Permanent Mental Storage',
    keyTakeaway:
      'Remember: Queue = FIFO. Enqueue at REAR, Dequeue from FRONT. Use (index + 1) % capacity for circular wrapping, and always check isEmpty() before extracting.',
    interactiveDemoType: 'queue-summary',
  },
];
