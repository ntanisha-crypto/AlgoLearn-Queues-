export interface GameMetaData {
  id: number;
  levelNumber: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  tagline: string;
  description: string;
  detailedObjective: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  duration: string;
  xpReward: number;
  skills: string[];
  interactionType: string;
  hintAvailability: string;
  iconName: 'build' | 'predict' | 'speed' | 'debug' | 'trophy' | 'infinity';
  howToPlay: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  previewData?: {
    stackItems?: string[];
    topPointer?: string;
    operationsTrace?: string[];
    popZoneLabel?: string;
  };
}

export type GameLevelMeta = GameMetaData;

export const GAME_CATALOG: GameMetaData[] = [
  // ==========================================
  // LEVEL 1: CORE FIFO OPERATIONS & BOUNDARY GUARDRAILS
  // ==========================================
  {
    id: 1,
    levelNumber: 1,
    title: 'Level 01: Core FIFO Operations & Boundary Guardrails',
    shortTitle: 'FIFO Operations & Boundaries',
    subtitle: 'REAR Enqueue, FRONT Dequeue, Capacity Limits & Underflow Defense',
    tagline:
      'Master fundamental FIFO invariants with drag-and-drop ingestion, interactive dequeue deletion, and robust exception detection.',
    description:
      'Explore the operational foundation of queue data structures: append incoming items at the REAR pointer, dispatch departing elements from the FRONT pointer in strict FIFO order, identify capacity overflow, and prevent underflow exceptions.',
    detailedObjective:
      'Experience the complete operational lifecycle of a FIFO queue. Verify why ENQUEUE inserts at the REAR and DEQUEUE extracts from the FRONT following strict FIFO invariants. Practice defensive programming by detecting QUEUE OVERFLOW when the buffer is full and guarding against QUEUE UNDERFLOW when the buffer is empty.',
    difficulty: 'Beginner',
    duration: '4–6 min',
    xpReward: 100,
    skills: [
      'ENQUEUE (REAR)',
      'DEQUEUE (FRONT)',
      'FIFO Invariant',
      'Drag-and-Drop Ingestion',
      'Drag-Out Deletion',
      'QUEUE OVERFLOW',
      'QUEUE UNDERFLOW',
    ],
    interactionType: 'Interactive Drag-and-Drop Enqueue, Dequeue, FIFO Order & Exception Verification',
    hintAvailability: '3-stage guided hints available',
    iconName: 'build',
    howToPlay: [
      {
        stepNumber: 1,
        title: 'ENQUEUE Arrivals at REAR',
        description: 'Drag new elements into the queue or click to append at the REAR pointer (back of the line).',
      },
      {
        stepNumber: 2,
        title: 'DEQUEUE Departures from FRONT',
        description:
          'Drag the FRONT element out of the queue box or drop onto the exit chute to delete/dequeue in FIFO order.',
      },
      {
        stepNumber: 3,
        title: 'Detect QUEUE OVERFLOW',
        description: 'When the line reaches max capacity (e.g. 5/5), adding new elements triggers a QUEUE OVERFLOW exception.',
      },
      {
        stepNumber: 4,
        title: 'Catch QUEUE UNDERFLOW',
        description: 'When the queue is empty (0 items), attempting DEQUEUE triggers a QUEUE UNDERFLOW exception.',
      },
    ],
    previewData: {
      stackItems: ['A (FRONT)', 'B', 'C', 'D (REAR)'],
      topPointer: 'A',
      popZoneLabel: 'FIFO INGESTION & EXTRACTION PIPELINE',
    },
  },

  // ==========================================
  // LEVEL 2: EXECUTION TRACING & STATE PREDICTION
  // ==========================================
  {
    id: 2,
    levelNumber: 2,
    title: 'Level 02: Execution Tracing & State Prediction',
    shortTitle: 'Execution Tracing & Pointers',
    subtitle: 'Interleaved Arrival/Departure Sequences, Pointer Shifts & State Simulation',
    tagline:
      'Trace compound queue transformations mentally to predict element departures and verify pointer state transitions.',
    description:
      'Sharpen your mental execution model by tracking interleaved arrival and departure operations. Predict departure order, calculate pointer displacements, and verify buffer contents across complex transactional sequences.',
    detailedObjective:
      'Given an interleaved sequence of queue operations (ENQUEUE A → ENQUEUE B → DEQUEUE → ENQUEUE C → DEQUEUE), trace the FRONT and REAR pointer movements mentally. Accurately predict removal order (A → B) and remaining queue contents.',
    difficulty: 'Intermediate',
    duration: '4–5 min',
    xpReward: 125,
    skills: [
      'Sequence Prediction',
      'Mental Tracing',
      'Compound Operations',
      'FIFO Verification',
      'Pointer Shift Tracking',
    ],
    interactionType: 'Predictive sequence simulation & pipeline verification',
    hintAvailability: '3-stage guided hints available',
    iconName: 'predict',
    howToPlay: [
      {
        stepNumber: 1,
        title: 'Analyze Operations Trace',
        description: 'Carefully inspect interleaved operations: ENQUEUE A, ENQUEUE B, DEQUEUE, ENQUEUE C, DEQUEUE.',
      },
      {
        stepNumber: 2,
        title: 'Track Pointers Mentally',
        description: 'Track FRONT and REAR pointer indices mentally after every arrival and departure.',
      },
      {
        stepNumber: 3,
        title: 'Predict Departure Sequence',
        description: 'Determine which elements exit (A leaves first, then B leaves second under FIFO rules).',
      },
      {
        stepNumber: 4,
        title: 'Confirm Remaining State',
        description: 'Calculate who remains inside the queue and verify constant-time O(1) properties.',
      },
    ],
    previewData: {
      operationsTrace: [
        'ENQUEUE A → [A]',
        'ENQUEUE B → [A, B]',
        'DEQUEUE   → A removed, [B] remains',
        'ENQUEUE C → [B, C]',
        'DEQUEUE   → B removed, [C] remains',
      ],
      stackItems: ['C'],
      topPointer: 'C',
      popZoneLabel: 'FIFO STATE PREDICTION PIPELINE',
    },
  },

  // ==========================================
  // LEVEL 3: MULTI-STATION ROUTING & CIRCULAR RING BUFFERS
  // ==========================================
  {
    id: 3,
    levelNumber: 3,
    title: 'Level 03: Multi-Station Routing & Circular Ring Buffers',
    shortTitle: 'Routing & Circular Buffers',
    subtitle: 'Multi-Channel Dispatching & Modulo Arithmetic Memory Recycling',
    tagline:
      'Coordinate independent priority channels and eliminate linear memory waste using continuous modulo ring buffers.',
    description:
      'Scale up to modern systems architectures: route incoming tasks across specialized multi-queue dispatch stations (Emergency, Standard, Express) and configure circular ring buffers with modulo arithmetic to recycle vacant slots.',
    detailedObjective:
      'Master multi-line dispatching and continuous ring buffers. Direct visitors to independent service queues with isolated FIFO orderings, then master circular queues where modulo arithmetic treats array ends as a continuous ring to recycle vacant front slots.',
    difficulty: 'Advanced',
    duration: '5–7 min',
    xpReward: 150,
    skills: [
      'Multi-Queue Dispatch',
      'Isolated FIFO Channels',
      'Circular Ring Buffer',
      'Modulo Wraparound',
      'False Overflow Prevention',
      'Sentinel Invariants',
    ],
    interactionType: 'Multi-Queue Routing, Dispatch & Circular Ring Buffer Execution',
    hintAvailability: '3-stage guided hints available',
    iconName: 'speed',
    howToPlay: [
      {
        stepNumber: 1,
        title: 'Route to Specialized Queues',
        description: 'Dispatch guests to Rollercoaster, Snack Bar, or Emergency Fast-Pass based on individual destination.',
      },
      {
        stepNumber: 2,
        title: 'Process Channels Independently',
        description: 'DEQUEUE from each queue independently: the earliest guest in that specific queue is served first.',
      },
      {
        stepNumber: 3,
        title: 'Diagnose False Overflow',
        description: 'Observe empty front slots [0, 1] left after departures and understand why naive linear arrays fail.',
      },
      {
        stepNumber: 4,
        title: 'Execute Modulo Wraparound',
        description: 'Calculate rear = (rear + 1) % MAX to wrap rear back to index 0 and recycle vacant memory.',
      },
    ],
    previewData: {
      stackItems: ['Ride: [Alex, Chris]', 'Food: [Bella, Ethan]', 'Circular Ring: [F, _, C, D, E]'],
      topPointer: 'Ride: Alex | Ring: F',
      popZoneLabel: 'MULTI-QUEUE & CIRCULAR RING BUFFER',
    },
  },

  // ==========================================
  // LEVEL 4: HIGH-THROUGHPUT PACKET DISPATCHING ENGINE
  // ==========================================
  {
    id: 4,
    levelNumber: 4,
    title: 'Level 04: High-Throughput Packet Dispatching Engine',
    shortTitle: 'Packet Dispatching Engine',
    subtitle: 'High-Velocity Data Stream Ingestion, Rapid Dequeue & Buffer Balancing',
    tagline:
      'Manage real-time packet bursts by routing incoming network payloads and clearing FRONT queues before buffer overflow.',
    description:
      'Put your queue mastery to the test in a high-speed telecommunications dispatcher. Incoming network packets arrive at rapid intervals: drag them into the FIFO buffer and dispatch packets through the transmission antenna before the buffer overflows.',
    detailedObjective:
      'Experience how production networking hardware, routers, and message brokers (e.g. RabbitMQ, Kafka) utilize FIFO queues to absorb sudden traffic bursts, regulate throughput, and guarantee packet delivery order without dropping data.',
    difficulty: 'Advanced',
    duration: '5–7 min',
    xpReward: 200,
    skills: [
      'High-Throughput Streaming',
      'Burst Absorption',
      'Real-Time Ingestion',
      'Rapid Dequeue Dispatch',
      'Buffer Overflow Defense',
      'Combo Multipliers',
    ],
    interactionType: 'Real-Time Streaming Dispatcher, Live Ingestion & Rapid Dequeue Arena',
    hintAvailability: 'Real-time telemetry and guided tooltips',
    iconName: 'speed',
    howToPlay: [
      {
        stepNumber: 1,
        title: 'Ingest Arriving Packets',
        description: 'Drag incoming packets from the live stream into the FIFO buffer before the arrival stream backs up.',
      },
      {
        stepNumber: 2,
        title: 'Dispatch through Antenna',
        description: 'Drag the FRONT packet [0] out onto the Transmission Antenna or click to dequeue and transmit.',
      },
      {
        stepNumber: 3,
        title: 'Maintain Buffer Headroom',
        description: 'Never allow the buffer to hit 5/5 capacity; clear front packets to maintain buffer space.',
      },
      {
        stepNumber: 4,
        title: 'Build Combo Multipliers',
        description: 'Rapid, error-free dispatches scale your combo multiplier up to 5x for maximum telemetry score.',
      },
    ],
    previewData: {
      stackItems: ['PKT-101 (FRONT)', 'PKT-102', 'PKT-103', 'PKT-104 (REAR)'],
      topPointer: 'PKT-101',
      popZoneLabel: 'HIGH-SPEED TELECOMMUNICATIONS DISPATCHER',
    },
  },
];
