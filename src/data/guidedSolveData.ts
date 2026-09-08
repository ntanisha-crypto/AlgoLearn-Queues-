import { GuidedSolveStep } from '../types';

/**
 * =========================================================================
 * MASTER GUIDED SOLVE CURRICULUM (10 CORE QUEUE DSA STEPS)
 * =========================================================================
 * 1. What is a Queue? (Linear Data Structure, FIFO, First In First Out)
 * 2. Understand FRONT & REAR Pointers
 * 3. Guided ENQUEUE (Adding to REAR & Incrementing Pointer)
 * 4. Guided DEQUEUE (Removing from FRONT & FIFO Order)
 * 5. Guided PEEK (Inspecting FRONT without Removal)
 * 6. Guided isEmpty (Empty Queue Check, Size = 0)
 * 7. Guided isFull (Full Queue Check, Size = capacity)
 * 8. Guided OVERFLOW (Handling Enqueue on Full Queue)
 * 9. Guided UNDERFLOW (Handling Dequeue on Empty Queue)
 * 10. Circular Queue & Modulo Wraparound ((rear + 1) % MAX)
 */
export const MASTER_GUIDED_STEPS: GuidedSolveStep[] = [
  // ─── STEP 1: WHAT IS A QUEUE? ───
  {
    stepNumber: 1,
    totalSteps: 10,
    title: 'WHAT IS A QUEUE?',
    subtitle: 'Linear Data Structure & FIFO Principle',
    conceptBadge: 'FIFO • FIRST IN, FIRST OUT',
    stackState: {
      items: ['A', 'B', 'C'],
      capacity: 5,
      topIndex: 2,
      highlightTop: false,
      highlightItem: 'A',
    },
    explanation:
      'A Queue is a LINEAR DATA STRUCTURE that follows FIFO (First In, First Out). The very first element that joined the line is always the first one served and removed.',
    questionPrompt: 'Survivors arrived in sequence: A (1st) → B (2nd) → C (3rd). Who will exit first?',
    interactionType: 'info-next',
    hints: [
      'Look at the FRONT of the queue on the left.',
      'Remember: Queue strictly follows FIFO (First In, First Out).',
      'The first survivor to arrive (A) is at the FRONT and will exit first.',
    ],
    correctFeedback: {
      title: '✓ FIFO Principle Mastered',
      explanation: 'Survivor [A] arrived first, sits at the FRONT, and exits first.',
      actionResult: 'FIFO: A arrived 1st (FRONT), B arrived 2nd, C arrived 3rd (REAR).',
    },
  },

  // ─── STEP 2: UNDERSTAND FRONT & REAR ───
  {
    stepNumber: 2,
    totalSteps: 10,
    title: 'FRONT & REAR POINTERS',
    subtitle: 'Two Pointers for Dual-End Management',
    conceptBadge: 'FRONT = [0] • REAR = [2]',
    stackState: {
      items: ['A', 'B', 'C'],
      capacity: 5,
      topIndex: 2,
      highlightTop: true,
    },
    explanation:
      'Unlike a Stack which uses only one TOP pointer, a Queue uses TWO boundary pointers: FRONT points to the exit head (removals), and REAR points to the entrance tail (insertions).',
    questionPrompt: 'What is the role of the FRONT pointer in a Queue?',
    interactionType: 'select-choice',
    choices: [
      {
        id: 'choice-front-role',
        label: 'FRONT identifies the earliest arrival that will be removed by the next DEQUEUE.',
        isCorrect: true,
        feedback: 'Correct! FRONT always points to the next element eligible for exit.',
      },
      {
        id: 'choice-front-insert',
        label: 'FRONT is where brand new elements are added to the queue.',
        isCorrect: false,
        feedback: 'Incorrect! New elements always join at the REAR, not the FRONT.',
      },
      {
        id: 'choice-front-random',
        label: 'FRONT points to a random middle survivor.',
        isCorrect: false,
        feedback: 'Incorrect! Queues do not allow random access. FRONT is strictly index 0.',
      },
    ],
    hints: [
      'FRONT = Exit door for Dequeue.',
      'REAR = Entrance door for Enqueue.',
      'Arrivals enter at REAR, departures leave from FRONT.',
    ],
    correctFeedback: {
      title: '✓ Boundary Pointers Confirmed',
      explanation: 'FRONT = [A] at index 0 (exit). REAR = [C] at index 2 (entry).',
      actionResult: 'FRONT points to next dequeue. REAR points to latest enqueue.',
    },
  },

  // ─── STEP 3: GUIDED ENQUEUE ───
  {
    stepNumber: 3,
    totalSteps: 10,
    title: 'GUIDED ENQUEUE OPERATION',
    subtitle: 'Adding New Arrivals at the REAR',
    conceptBadge: 'ENQUEUE → REAR POINTER',
    stackState: {
      items: ['A', 'B', 'C'],
      capacity: 5,
      topIndex: 2,
    },
    explanation:
      'ENQUEUE adds a new element to the REAR of the queue. REAR pointer advances, and Queue Size increases by 1.',
    questionPrompt: 'Execute: ENQUEUE survivor [D]. Click [ ENQUEUE D ].',
    interactionType: 'click-push',
    pushValue: 'D',
    postActionStack: ['A', 'B', 'C', 'D'],
    hints: [
      'Click [ ENQUEUE D ] below.',
      'Watch survivor D join behind C at the REAR.',
      'Queue Size will increase from 3 to 4 out of 5.',
    ],
    correctFeedback: {
      title: '✓ Survivor D Enqueued!',
      explanation: 'D joined at the REAR. Current queue: FRONT → A → B → C → D ← REAR.',
      actionResult: 'Enqueue(D) succeeded. Size is now 4 / 5.',
    },
  },

  // ─── STEP 4: GUIDED DEQUEUE ───
  {
    stepNumber: 4,
    totalSteps: 10,
    title: 'GUIDED DEQUEUE OPERATION',
    subtitle: 'Removing Earliest Arrival from FRONT',
    conceptBadge: 'DEQUEUE → FRONT POINTER',
    stackState: {
      items: ['A', 'B', 'C', 'D'],
      capacity: 5,
      topIndex: 3,
      highlightItem: 'A',
    },
    explanation:
      'DEQUEUE removes the element at the FRONT pointer. Because A arrived before everyone else, FIFO mandates that A leaves first.',
    questionPrompt: 'Execute: DEQUEUE to release survivor [A] from the FRONT.',
    interactionType: 'click-pop',
    popExpectedValue: 'A',
    postActionStack: ['B', 'C', 'D'],
    hints: [
      'Click [ DEQUEUE FRONT ] below.',
      'Notice how A exits and B automatically advances to become the new FRONT.',
      'Queue Size decreases from 4 to 3.',
    ],
    correctFeedback: {
      title: '✓ Survivor A Dequeued!',
      explanation: 'A left the bunker. B is now the new FRONT element.',
      actionResult: 'Dequeue() returned A. Remaining: FRONT → B → C → D ← REAR.',
    },
  },

  // ─── STEP 5: GUIDED PEEK ───
  {
    stepNumber: 5,
    totalSteps: 10,
    title: 'GUIDED PEEK (INSPECT FRONT)',
    subtitle: 'Non-Destructive Front Access',
    conceptBadge: 'PEEK = NON-DESTRUCTIVE',
    stackState: {
      items: ['B', 'C', 'D'],
      capacity: 5,
      topIndex: 2,
    },
    explanation:
      'PEEK (or FRONT) allows inspecting the earliest element without removing it. Queue Size and all element positions remain completely unchanged.',
    questionPrompt: 'Click [ PEEK FRONT ] to inspect who is next in line.',
    interactionType: 'click-peek',
    peekExpectedValue: 'B',
    hints: [
      'Click [ PEEK FRONT ] below.',
      'Peek looks at the FRONT without deleting.',
      'The queue will remain [B, C, D] with Size 3 / 5.',
    ],
    correctFeedback: {
      title: '✓ FRONT = B Inspected!',
      explanation: 'PEEK returned B. The queue was not modified.',
      actionResult: 'Peek() = B. Queue remains: FRONT → B → C → D ← REAR.',
    },
  },

  // ─── STEP 6: GUIDED isEmpty ───
  {
    stepNumber: 6,
    totalSteps: 10,
    title: 'GUIDED isEmpty() CHECK',
    subtitle: 'Validating Empty State Guardrail',
    conceptBadge: 'isEmpty() • SIZE == 0',
    stackState: {
      items: [],
      capacity: 5,
      topIndex: -1,
    },
    explanation:
      'isEmpty() returns TRUE when Queue Size is 0. Production software must check isEmpty() before dequeuing to prevent crashes.',
    questionPrompt: 'The queue has 0 survivors. What does isEmpty() return?',
    interactionType: 'select-choice',
    choices: [
      {
        id: 'choice-empty-true',
        label: 'TRUE — Queue Size is 0, no survivors are in line.',
        isCorrect: true,
        feedback: 'Correct! When size == 0, isEmpty() evaluates to true.',
      },
      {
        id: 'choice-empty-false',
        label: 'FALSE — The queue always has ghost elements.',
        isCorrect: false,
        feedback: 'Incorrect! When size == 0, the queue is completely empty.',
      },
    ],
    hints: [
      'Size = 0 out of 5 capacity.',
      'When size == 0, isEmpty() is TRUE.',
      'This guard check prevents Queue Underflow.',
    ],
    correctFeedback: {
      title: '✓ Empty Condition Verified',
      explanation: 'Queue is empty (0 / 5). Calling Dequeue now would cause Underflow.',
      actionResult: 'isEmpty() == TRUE (Size = 0).',
    },
  },

  // ─── STEP 7: GUIDED isFull ───
  {
    stepNumber: 7,
    totalSteps: 10,
    title: 'GUIDED isFull() CHECK',
    subtitle: 'Validating Maximum Capacity',
    conceptBadge: 'isFull() • SIZE == CAPACITY',
    stackState: {
      items: ['A', 'B', 'C', 'D', 'E'],
      capacity: 5,
      topIndex: 4,
    },
    explanation:
      'In fixed-size array queues, isFull() returns TRUE when Queue Size equals Capacity (5 / 5). No further insertions can take place without overflow.',
    questionPrompt: 'All 5 bunker slots are occupied. What does isFull() evaluate to?',
    interactionType: 'select-choice',
    choices: [
      {
        id: 'choice-full-true',
        label: 'TRUE — Queue Size (5) == Capacity (5). The queue is at maximum capacity.',
        isCorrect: true,
        feedback: 'Correct! All array slots are occupied.',
      },
      {
        id: 'choice-full-false',
        label: 'FALSE — Queues can infinitely expand in fixed memory.',
        isCorrect: false,
        feedback: 'Incorrect! Fixed-size array queues have a strict maximum capacity.',
      },
    ],
    hints: [
      'Notice all 5 slots [0..4] are filled.',
      'Size (5) == Capacity (5).',
      'This guard check prevents Queue Overflow.',
    ],
    correctFeedback: {
      title: '✓ Full Capacity Verified',
      explanation: 'Bunker is full (5 / 5). Enqueuing another item will trigger an Overflow error.',
      actionResult: 'isFull() == TRUE (5 / 5 slots filled).',
    },
  },

  // ─── STEP 8: GUIDED OVERFLOW ───
  {
    stepNumber: 8,
    totalSteps: 10,
    title: 'GUIDED QUEUE OVERFLOW',
    subtitle: 'Attempting to Enqueue into a Full Queue',
    conceptBadge: '🚨 OVERFLOW EXCEPTION',
    stackState: {
      items: ['A', 'B', 'C', 'D', 'E'],
      capacity: 5,
      topIndex: 4,
    },
    explanation:
      'QUEUE OVERFLOW occurs when attempting to ENQUEUE an element into a queue that has already reached its maximum capacity.',
    questionPrompt: 'Click [ TRIGGER OVERFLOW ] to test the defensive guardrail.',
    interactionType: 'overflow-action',
    hints: [
      'Click [ TRIGGER OVERFLOW ] below.',
      'Observe the red alert.',
      'In code: if (isFull()) throw new QueueOverflowException();',
    ],
    correctFeedback: {
      title: '🚨 OVERFLOW EXCEPTION CAUGHT!',
      explanation: 'Insertion of survivor F was rejected because the queue is full (5 / 5).',
      actionResult: 'QueueOverflowException caught safely.',
    },
  },

  // ─── STEP 9: GUIDED UNDERFLOW ───
  {
    stepNumber: 9,
    totalSteps: 10,
    title: 'GUIDED QUEUE UNDERFLOW',
    subtitle: 'Attempting to Dequeue from an Empty Queue',
    conceptBadge: '🚨 UNDERFLOW EXCEPTION',
    stackState: {
      items: [],
      capacity: 5,
      topIndex: -1,
    },
    explanation:
      'QUEUE UNDERFLOW occurs when attempting to DEQUEUE or PEEK when Queue Size is 0. There is no front element to remove.',
    questionPrompt: 'Click [ TRIGGER UNDERFLOW ] to observe the underflow guard.',
    interactionType: 'underflow-action',
    hints: [
      'Click [ TRIGGER UNDERFLOW ] below.',
      'Observe the red alert.',
      'In code: if (isEmpty()) throw new QueueUnderflowException();',
    ],
    correctFeedback: {
      title: '🚨 UNDERFLOW EXCEPTION CAUGHT!',
      explanation: 'Cannot dequeue from an empty queue. Defensive guard prevented crash.',
      actionResult: 'QueueUnderflowException caught safely.',
    },
  },

  // ─── STEP 10: CIRCULAR QUEUE WRAPAROUND ───
  {
    stepNumber: 10,
    totalSteps: 10,
    title: 'CIRCULAR QUEUE & MODULO WRAPAROUND',
    subtitle: 'Recycling Vacant Front Slots',
    conceptBadge: 'MODULO: (rear + 1) % MAX',
    stackState: {
      items: ['C', 'D', 'E'],
      capacity: 5,
      topIndex: 2,
    },
    explanation:
      'When front items are dequeued, slots [0] and [1] become free. A Circular Queue connects index 4 back to index 0 using modulo arithmetic: rear = (rear + 1) % MAX.',
    questionPrompt: 'Rear is at index 4 with capacity 5. What is (4 + 1) % 5?',
    interactionType: 'select-choice',
    choices: [
      {
        id: 'choice-mod-0',
        label: 'Index 0 — The rear wraps around to the beginning of the array!',
        isCorrect: true,
        feedback: 'Correct! (4 + 1) % 5 = 0, recycling the vacant first slot.',
      },
      {
        id: 'choice-mod-5',
        label: 'Index 5 — An illegal out-of-bounds index.',
        isCorrect: false,
        feedback: 'Incorrect! The modulo operator % wraps 5 to 0.',
      },
    ],
    hints: [
      '5 divided by 5 leaves a remainder of 0.',
      'Modulo operator % computes the remainder.',
      'This allows memory reuse without moving all elements!',
    ],
    correctFeedback: {
      title: '✓ Circular Queue Wraparound Mastered!',
      explanation: 'Index 4 wraps back to index 0. False overflow is eliminated!',
      actionResult: '(4 + 1) % 5 = 0. Rear wraps to slot [0].',
    },
  },
];

/**
 * =========================================================================
 * LEVEL-SPECIFIC GUIDED SOLVE CURRICULUM (LEVELS 1 TO 3)
 * =========================================================================
 */
export const LEVEL_GUIDED_STEPS: Record<number, GuidedSolveStep[]> = {
  // ─── LEVEL 1: OPERATIONS & BOUNDARY GUARDS ───
  1: [
    {
      stepNumber: 1,
      totalSteps: 3,
      title: 'LEVEL 1: QUEUE OPERATIONS',
      subtitle: 'Enqueue at REAR, Dequeue from FRONT',
      conceptBadge: 'FIFO QUEUE',
      stackState: {
        items: ['A', 'B', 'C'],
        capacity: 5,
        topIndex: 2,
      },
      explanation:
        'Level 1 explores all foundational Queue operations: ENQUEUE adds survivors at the REAR, DEQUEUE removes from the FRONT, and PEEK inspects without modifying. Size is 3 / 5.',
      questionPrompt: 'Click [ ENQUEUE D ] to add survivor D to the REAR.',
      interactionType: 'click-push',
      pushValue: 'D',
      postActionStack: ['A', 'B', 'C', 'D'],
      hints: [
        'Click [ ENQUEUE D ] below.',
        'Watch D join behind C at the REAR.',
        'Queue Size becomes 4 / 5.',
      ],
      correctFeedback: {
        title: '✓ Enqueued D at REAR',
        explanation: 'D is now at the REAR pointer. Queue size is 4 / 5.',
        actionResult: 'FRONT → A → B → C → D ← REAR.',
      },
    },
    {
      stepNumber: 2,
      totalSteps: 3,
      title: 'LEVEL 1 STEP 2: BOUNDARY GUARDS',
      subtitle: 'Overflow & Underflow Guardrails',
      conceptBadge: 'DEFENSIVE GUARDS',
      stackState: {
        items: ['A', 'B', 'C', 'D', 'E'],
        capacity: 5,
        topIndex: 4,
      },
      explanation:
        'When active queue reaches capacity (5/5), attempting ENQUEUE causes Queue Overflow. Conversely, attempting DEQUEUE on an empty queue (0/5) triggers Queue Underflow.',
      questionPrompt: 'What prevents memory corruption when enqueuing to a full queue?',
      interactionType: 'select-choice',
      choices: [
        {
          id: 'ans-is-full-guard',
          label: 'An isFull() boundary check that raises a Queue Overflow Exception',
          isCorrect: true,
          feedback: 'Correct! Defensive systems check isFull() before allocating memory.',
        },
        {
          id: 'ans-overwrite-front',
          label: 'Automatically deleting the front element silently',
          isCorrect: false,
          feedback: 'Incorrect! Standard queues reject writes instead of silently dropping data.',
        },
      ],
      hints: [
        'Check capacity limit (5/5).',
        'Defensive guards raise an exception to protect memory.',
      ],
      correctFeedback: {
        title: '✓ Boundary Guardrails Understood',
        explanation: 'isFull() guards against Overflow, isEmpty() guards against Underflow.',
        actionResult: 'Boundary exceptions preserve queue invariants.',
      },
    },
    {
      stepNumber: 3,
      totalSteps: 3,
      title: 'LEVEL 1 STEP 3: READY TO PLAY',
      subtitle: 'Master Operations & Boundaries',
      conceptBadge: 'READY',
      stackState: {
        items: ['A', 'B', 'C', 'D'],
        capacity: 5,
        topIndex: 3,
      },
      explanation:
        'You are ready to solve Level 1! You will perform Enqueue, Dequeue, inspect with Peek, and test Overflow & Underflow exceptions.',
      questionPrompt: 'Click [ NEXT STEP ] to launch Level 1.',
      interactionType: 'info-next',
      hints: ['Click Next Step to begin.'],
      correctFeedback: {
        title: '✓ Ready to Play Level 1',
        explanation: 'Showcase your operations & boundary guardrail mastery!',
      },
    },
  ],

  // ─── LEVEL 2: OPERATION TRACING & PIPELINE PREDICTION ───
  2: [
    {
      stepNumber: 1,
      totalSteps: 2,
      title: 'LEVEL 2: OPERATION TRACING',
      subtitle: 'Predicting Interleaved Queue Sequences',
      conceptBadge: 'SEQUENCE TRACING',
      stackState: {
        items: ['A', 'B'],
        capacity: 5,
        topIndex: 1,
      },
      explanation:
        'Level 2 challenges your mental execution pipeline. In real systems, Enqueue and Dequeue operations interleave continuously. FIFO ensures departure order always matches arrival order.',
      questionPrompt: 'Given: ENQUEUE(X), ENQUEUE(Y), DEQUEUE(), ENQUEUE(Z). Which survivor exits during DEQUEUE?',
      interactionType: 'select-choice',
      choices: [
        {
          id: 'ans-x',
          label: 'Survivor [X] — Earliest arrival at FRONT',
          isCorrect: true,
          feedback: 'Correct! X joined first, so X exits first.',
        },
        {
          id: 'ans-y',
          label: 'Survivor [Y] — Second arrival',
          isCorrect: false,
          feedback: 'Incorrect! Y joined after X, so Y waits behind X.',
        },
        {
          id: 'ans-z',
          label: 'Survivor [Z] — Most recent arrival',
          isCorrect: false,
          feedback: 'Incorrect! Z has not even arrived before DEQUEUE.',
        },
      ],
      hints: [
        'Track the FRONT pointer step by step.',
        'X arrived first at time t=1.',
      ],
      correctFeedback: {
        title: '✓ Mental Pipeline Trace Confirmed',
        explanation: 'X exits first. The remaining queue after ENQUEUE(Z) is [Y, Z].',
        actionResult: 'Trace: X departed; [Y, Z] remain in queue.',
      },
    },
    {
      stepNumber: 2,
      totalSteps: 2,
      title: 'LEVEL 2 STEP 2: READY TO PLAY',
      subtitle: 'Execute Step-by-Step Tracing',
      conceptBadge: 'READY',
      stackState: {
        items: ['Y', 'Z'],
        capacity: 5,
        topIndex: 1,
      },
      explanation:
        'In Level 2, analyze compound sequences, forecast intermediate queue states, and compute exact final element positions.',
      questionPrompt: 'Click [ NEXT STEP ] to start Level 2.',
      interactionType: 'info-next',
      hints: ['Click Next Step to begin.'],
      correctFeedback: {
        title: '✓ Ready to Play Level 2',
        explanation: 'Launch Level 2 and master operation tracing!',
      },
    },
  ],

  // ─── LEVEL 3: ADVANCED QUEUE ARCHITECTURES ───
  3: [
    {
      stepNumber: 1,
      totalSteps: 2,
      title: 'LEVEL 3: MULTI-QUEUE & CIRCULAR BUFFERS',
      subtitle: 'Modulo Arithmetic & Multi-Channel Routing',
      conceptBadge: 'RING BUFFER & MULTI-LINE',
      stackState: {
        items: ['C', 'D', 'E'],
        capacity: 5,
        topIndex: 2,
      },
      explanation:
        'Level 3 covers advanced real-world architectures: Multi-Queue Dispatch (routing items to separate queues) and Circular Ring Buffers using modulo arithmetic: rear = (rear + 1) % MAX, recycling vacant front slots.',
      questionPrompt: 'What formula allows a circular queue rear pointer to wrap from index 4 back to index 0 (capacity 5)?',
      interactionType: 'select-choice',
      choices: [
        {
          id: 'ans-modulo',
          label: '(rear + 1) % MAX — (4 + 1) % 5 = 0',
          isCorrect: true,
          feedback: 'Correct! The modulo operator wraps the pointer back to the beginning.',
        },
        {
          id: 'ans-plus-one',
          label: 'rear + 1 — increases to index 5',
          isCorrect: false,
          feedback: 'Incorrect! Index 5 would cause an Array Index Out Of Bounds exception.',
        },
      ],
      hints: [
        'Look at the modulo % operator.',
        '5 % 5 = 0.',
      ],
      correctFeedback: {
        title: '✓ Advanced Architecture Validated',
        explanation: 'Modulo arithmetic recycles vacant slots, eliminating false overflow.',
        actionResult: 'rear = (rear + 1) % MAX enables circular ring reuse.',
      },
    },
    {
      stepNumber: 2,
      totalSteps: 2,
      title: 'LEVEL 3 STEP 2: READY TO PLAY',
      subtitle: 'Dispatch & Modulo Wraparound',
      conceptBadge: 'READY',
      stackState: {
        items: ['A', 'B', 'C'],
        capacity: 5,
        topIndex: 2,
      },
      explanation:
        'You are ready for Level 3! Route survivors across dedicated priority lines and master circular queue ring buffers.',
      questionPrompt: 'Click [ NEXT STEP ] to launch Level 3.',
      interactionType: 'info-next',
      hints: ['Click Next Step to begin.'],
      correctFeedback: {
        title: '✓ Ready to Play Level 3',
        explanation: 'Conquer Multi-Queue routing and Circular Ring Buffers!',
      },
    },
  ],

  // ─── LEVEL 4: HIGH-THROUGHPUT PACKET DISPATCHING ENGINE ───
  4: [
    {
      stepNumber: 1,
      totalSteps: 2,
      title: 'LEVEL 4: HIGH-THROUGHPUT PACKET DISPATCHING',
      subtitle: 'Real-Time Ingestion, Burst Absorption & Dequeue Transmission',
      conceptBadge: 'STREAMING BUFFER & RAPID DISPATCH',
      stackState: {
        items: ['PKT-101', 'PKT-102'],
        capacity: 5,
        topIndex: 1,
      },
      explanation:
        'In high-throughput telecommunications and streaming pipelines, packets arrive rapidly. The FIFO buffer decouples arrival bursts from transmission consumers, ensuring zero packet drops and strict sequential delivery.',
      questionPrompt: 'Why must network routers use FIFO queue buffers to manage packet arrivals?',
      interactionType: 'select-choice',
      choices: [
        {
          id: 'ans-burst-absorption',
          label: 'To absorb traffic surges and transmit packets in strict arrival sequence',
          isCorrect: true,
          feedback: 'Correct! FIFO queue buffers smooth bursts while preventing packet drop and reordering.',
        },
        {
          id: 'ans-reverse-order',
          label: 'To invert packet sequence and deliver newest packets first',
          isCorrect: false,
          feedback: 'Incorrect! Reversing order breaks TCP packet streams and causes retransmissions.',
        },
      ],
      hints: [
        'Think about what happens when network traffic surges.',
        'FIFO queues preserve chronological sequence.',
      ],
      correctFeedback: {
        title: '✓ High-Throughput Dispatch Principle Confirmed',
        explanation: 'FIFO queues absorb traffic spikes and guarantee in-order delivery without dropped packets.',
        actionResult: 'Packets enqueue at REAR and transmit from FRONT.',
      },
    },
    {
      stepNumber: 2,
      totalSteps: 2,
      title: 'LEVEL 4 STEP 2: READY TO DISPATCH',
      subtitle: 'Ingest Packets & Clear Front Queue',
      conceptBadge: 'READY',
      stackState: {
        items: ['PKT-99', 'PKT-100', 'PKT-101'],
        capacity: 5,
        topIndex: 2,
      },
      explanation:
        'Drag arriving packets into the queue buffer to absorb incoming bursts, and drag FRONT packets out to the antenna to transmit!',
      questionPrompt: 'Click [ NEXT STEP ] to launch Level 4: High-Throughput Packet Dispatching Engine.',
      interactionType: 'info-next',
      hints: ['Click Next Step to begin.'],
      correctFeedback: {
        title: '✓ Ready to Play Level 4',
        explanation: 'Manage the high-throughput network dispatcher and balance the buffer!',
      },
    },
  ],
};
