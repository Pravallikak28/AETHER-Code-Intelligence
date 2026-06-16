export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
  category: string;
}

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplate[] = [
  {
    id: "ecommerce-microservices",
    name: "Distributed E-Commerce Engine",
    category: "Microservices",
    description: "An event-driven microservices architecture optimized for high-throughput transactional flows, leveraging Kafka for double-entry ledger queuing and Redis side-caching.",
    code: `// SYSTEM_MODULES
// gateway: API Gateway (Port 80) proxies auth, gateway checks token authenticity.
// users-service: Account & KYC DB (PostgreSQL). Emits USER_VERIFIED.
// inventory-service: Inventory ledger & Reservation (Redis memory-locks). Responds to STOCK_CHECK.
// payments-service: Stripe Proxy & Ledger records. Emits PAYMENT_CAPTURED.
// orders-service: Order coordinator (MongoDB) managing aggregate state. Orchestrates Saga logic.

// COMMUNICATION_FLOW: Event-driven pub-sub Kafka cluster.
// TOPICS:
// - "order-init": Published by gateway. Read by inventory-service to lock items.
// - "stock-reserved": Emitted if active reservation succeeds. Read by payments-service.
// - "payment-complete": Emitted on balance capture. Triggers order-service state update.
// - "order-failed": Emitted by saga coordinator on transactional rollback.

// KEY_PATTERNS:
// Outbox Pattern: DB transactions and Kafka pub events done atomically in local tables.
// CQRS: Read models populated by sinking Kafka events to Elasticsearch for lightning queries.`
  },
  {
    id: "fintech-ledger",
    name: "Modular Monolith Banking Ledger",
    category: "Modular Monolith",
    description: "High-compliance, multi-currency ledger engine running in a single process, utilizing strict in-memory module boundaries and bi-temporal database tracking.",
    code: `// DOMAIN_BOUNDARIES
// com.bank.core.ledger: Manages double-entry compliance tables. Immature or un-journaled modifications rejected.
// com.bank.core.accounts: Checks balance reserves, overdraft protections, and multi-currency exchange ratios.
// com.bank.core.kyc: Audits identity levels against AML watchlists.
// com.bank.core.integrations: Interfaces with ACH, FedWire, and Plaid APIs.

// STORAGE_STRATEGY:
// Bi-temporal SQL Schema: Houses "system_time" and "transaction_time" dimensions to preserve perfect audit record.
// Read replicas to distribute load from back-office auditing reports.
// Database Engine: PostgreSQL with strict serializable isolation levels to prevent race conditions during heavy debits.

// EVENT_CONVENTIONS:
// In-memory Spring ApplicationEvents or internal Go channels used for decouplement.
// No network hops between domains — synchronous local method calls bound by transactions.`
  },
  {
    id: "serverless-chat",
    name: "Serverless Real-Time Matrix",
    category: "Serverless",
    description: "Highly interactive chat and content platform employing stateful serverless workers, persistent edge-routing, and Firebase Firestore collections.",
    code: `// ARCHITECTURE_MEMBERS:
// Client App: Web application built with React and Tailwind.
// Edge Workers: Cloudflare Workers handling Edge-Caching, session handshakes, and Geolocation lookups.
// Database: Google Cloud Firestore provisioned for active, real-time message syncing.
// File Cache: Google Cloud Storage bucket with CDN edge nodes for media static files.

// DATA_STRUCTURES:
// Firestore collection "rooms/{roomId}/messages/{messageId}"
// TTL indexes on temporary room entries to purge historical junk automatically.

// PIPELINE_CONSTRAINTS:
// Realtime listeners connected to clients. Peak load scales infinitely without direct virtual machines.
// Gemini API is mediated through Express secure proxy routes to append contextual prompt parameters safely.`
  },
  {
    id: "clean-kotlin-app",
    name: "Clean Architecture Mobile Core",
    category: "Mobile Native",
    description: "A native Kotlin multi-module app implementing Uncle Bob's Clean Architecture with independent domain boundaries and reactive state propagation.",
    code: `// SYSTEM_LAYERS:
// core-domain: Pure Kotlin layer containing business rules, entities, and use cases. No Android SDK imports!
// core-data: Repositories matching business boundaries. Houses API clients and local SQLDelight persistence.
// feature-home: Presenter layer containing Jetpack Compose UI nodes, ViewModel, and UI state flows.
// feature-profile: Presenter layer managing account states and local credentials storage.

// DATA_FLOW:
// Compose triggers Event -> ViewModel processes -> UseCase evaluates -> Repository pulls from Cache/Network -> FLOW emits updated model back to Compose.

// PATTERNS:
// Dependency Injection: Hilt organizes constructor bindings.
// Coroutines & Flow: Strictly structured concurrency with IO dispatcher context-switching for smooth user interaction.`
  }
];
