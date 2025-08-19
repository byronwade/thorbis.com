# Thorbis Platform Documentation

## Table of Contents

* [Overview](#overview)
* [Platform Architecture](#platform-architecture)
* [Module System](#module-system)
* [Thorbis Academy](#thorbis-academy)
* [Hardware Ecosystem](#hardware-ecosystem)
* [Industry Playbooks](#industry-playbooks)
* [SEO, Deployment, API, and Environment](#seo-deployment-api-and-environment)
* [Appendices](#appendices)

  * [Glossary](#glossary)
  * [Error Codes](#error-codes)
  * [Contribution Guidelines](#contribution-guidelines)
  * [API Reference](#api-reference)

## Overview

Thorbis is a **comprehensive local business platform** that serves as both a community business directory and an all-in-one business management system. The platform connects local businesses with their communities while providing powerful operational tools for business owners. Thorbis creates a unified ecosystem where businesses can be discovered by customers and simultaneously manage their operations through integrated business tools.

**Dual-Purpose Platform Architecture:** Thorbis operates on two interconnected levels:

1. **Community Discovery Platform:** A sophisticated local business directory where customers can discover, review, and engage with local businesses. Features include advanced search capabilities, location-based discovery, business profiles with rich media, customer reviews and ratings, and community engagement tools.

2. **Business Management Hub:** Each business gets access to a powerful dashboard with industry-specific tools for operations management, customer relationship management, analytics and reporting, scheduling and booking systems, and integration with third-party services.

**Modular Business Tools:** While maintaining its directory focus, Thorbis provides modular business management capabilities tailored to different industries:

* **Field Service Management** for contractors, plumbers, HVAC technicians, and service providers
* **Restaurant Operations** for dining establishments, cafes, and food service businesses  
* **Retail Management** for stores, boutiques, and e-commerce operations
* **Professional Services** for consultants, agencies, and service professionals
* **Multi-Industry Widgets** that adapt to specific business needs and workflows

**Vision and Positioning:** Thorbis bridges the gap between business discovery and business management. Unlike pure directory services that only facilitate discovery, or business management tools that operate in isolation, Thorbis creates a symbiotic relationship where visibility drives operations and operations enhance visibility. Local businesses get discovered through the directory while using the same platform to manage their day-to-day operations, creating a powerful network effect that benefits both businesses and their communities.

## Platform Architecture

Thorbis is built with a **modern, scalable architecture** that emphasizes modularity, performance, and ease of deployment. The architecture supports a *multi-tenant SaaS model* (each business operates in an isolated space, or "hub", often with its own subdomain), and uses a technology stack that is both cutting-edge and developer-friendly. Key aspects of the platform architecture include the **Module Manifest** system, a robust **Feature Flag and Activation Planner**, an **Event Bus & RPC communication layer**, flexible **UI Composition**, and an opinionated **technology stack** that ties everything together.

### Module Manifest Structure

Every Thorbis module is defined by a *Module Manifest* – a structured descriptor (e.g. a JSON or TypeScript config) that declares the module’s metadata and capabilities. This manifest is strongly typed, meaning the platform knows exactly what the module provides and what it may require. Typical fields in a module manifest include:

* **Name and Version:** Unique identifier for the module and its version.
* **Dependencies:** A list of other modules (by name/version) that this module depends on. The system uses this to perform **dependency-aware loading** (ensuring prerequisites are enabled) and to validate compatibility.
* **Capabilities:** This describes what the module offers. Capabilities are typed – for example, a module can declare that it provides certain *routes/pages*, *database models*, *events*, *RPC methods*, *UI components* or *background jobs*. By typing these, Thorbis can ensure that modules integrate correctly. For instance, an **HR module** might declare a capability `EmployeeDirectoryPage` and a data model `Employee`; other modules can reference those types if needed.
* **Configuration & Permissions:** The manifest can also include feature flags or settings that control the module’s behavior, as well as default permission roles required to access its features.

When the platform starts or when a new module is added, the **Module Loader** reads each manifest to register the module’s components. The loader checks for any missing or conflicting dependencies – if a dependency is missing, the activation planner will prompt to enable or install it before proceeding. This design prevents runtime errors by **validating module dependencies upfront** and gives administrators a clear roadmap of what will be activated when they turn on a new module.

**Example:** If a business activates the *Invoicing* module, the system looks at the Invoicing manifest. Suppose *Invoicing* depends on the *Customers* module (for client info) and *Billing* module (for payment processing). Thorbis will automatically ensure *Customers* and *Billing* are active; if not, it might activate them or warn the user. The manifest might also declare UI components (like an "Invoices" page and a navigation item) and perhaps an RPC method for generating PDFs. The platform merges these into the global app structure once the module is live.

### Feature Flags and Activation Planner

Thorbis incorporates a **feature flag system** to control module rollouts and experimental features. Internally, this is powered by a service like **Statsig** for flags and experimentation. Feature flags allow the platform team to enable or disable features on a per-tenant or global basis, do A/B testing, and gradually release new modules. From the business user's perspective, feature flags manifest as *toggleable features*: an administrator can turn on a beta feature or an add-on module in their Thorbis dashboard, which flips the relevant flags for their tenant.

The **Activation Planner** is the logic that runs when a business decides to add (or remove) a module. Activating a module isn’t just a flip of a switch – the planner will: check license or payment status (if the module is a paid add-on), evaluate dependencies (and queue those for activation if not already active), run any setup scripts or database migrations needed for that module, and then finally register the module's components into the system (making its pages, APIs, and events live). This process may also involve feature flags behind the scenes. For example, turning on a module could correspond to enabling a set of feature flags for that tenant’s environment (so that UI components appear, APIs respond, etc.). Thorbis’s architecture uses a combination of **database-driven module registry** and **feature flag evaluation** to manage this. The result is a smooth experience where a user click in the UI ("Enable Module X") triggers a well-orchestrated sequence: load dependencies, run migrations, update config, and confirm the module is enabled.

Under the hood, Statsig (or a similar system) is configured to handle environment-specific settings for these features. In production, the platform keeps conservative settings to ensure performance – for example, session replay or intensive logging might be sampled at just 5% of sessions. In staging or test environments, those features run at higher rates (e.g. 20% in staging for more thorough QA). These configurations are controlled through environment variables and flags (e.g. `STATSIG_ENABLED`, `STATSIG_SESSION_REPLAY_SAMPLE_RATE`, etc.), ensuring that the platform remains performant and cost-effective in production while still providing rich data in development. The feature flag system also doubles as a kill-switch mechanism; if a new module misbehaves, it can be turned off quickly for all tenants by disabling its feature flag.

### Event Bus and RPC System

To keep modules decoupled yet interactive, Thorbis uses a combination of an **Event Bus** and an **RPC system**. The Event Bus is a publish/subscribe mechanism: modules can emit events (such as "Invoice Paid", "Employee Onboarded", "Inventory Low") and other modules can listen for those events to react accordingly. For example, when an "Invoice Paid" event is fired by the Invoicing module, a CRM module could listen and automatically send a "Thank you" email to the customer, or an Analytics module could record revenue. This event-driven approach means modules don't need direct knowledge of each other; they just handle events in a standardized way.

The **RPC system** allows modules to call functions or services provided by other modules in a controlled manner. In practice, this might be implemented as internal API calls or function imports that are wired together during module initialization. For instance, a *Scheduling* module might expose an RPC method `getAvailableTimeSlots(date)` that a *Booking* module can call to check availability. Under the hood, Thorbis ensures that these RPC calls route to the correct module's logic (this can be done via a registry of services, dependency injection, or a message-passing mechanism). The RPC layer respects module boundaries and permissions – calls can only be made if the target module is present and the caller has permission. Because module manifests declare RPC interfaces (typed), the platform can validate at startup that if Module A expects Module B’s RPC interface, Module B is indeed available and implementing that interface.

Together, the event bus and RPC system provide a **flexible communication layer**: events for broadcasted, decoupled communication, and RPC for request-response interactions. This is analogous to how microservices communicate, but here it's all in-process or over an optimized internal API since modules typically run within the same application context (for performance). The result is that Thorbis modules feel "pluggable" – you can add a module and it can immediately start interacting with others by emitting and responding to known events or calling registered services, without tight coupling.

### UI Composition via Module Manifests

The user interface of Thorbis is dynamically composed based on the active modules, using definitions from each module’s manifest. Rather than a monolithic UI, Thorbis has defined **UI slots** or anchor points that modules can fill. Some of these slots include:

* **Navigation Menus:** A module can contribute one or more navigation items (for the primary app menu or topbar). For example, enabling the *Employees* module would insert an "Employees" section in the sidebar navigation, possibly with subpages.
* **Pages and Routes:** Modules declare pages (with routes) that they handle. Thorbis uses a Next.js framework, so pages might correspond to Next.js routes that are conditionally included. The manifest might specify a route like `/app/employees` that maps to an EmployeesPage component provided by the module. When the module is active, the router is aware of these pages.
* **Dashboard Widgets:** The home dashboard of Thorbis (or other overview pages) can show widgets from various modules. A module can register a widget (small component with a bit of info or controls) for a certain dashboard slot. For instance, the *Reports* module might add a "Key Metrics" widget to the main dashboard, or the *Invoicing* module could add an "Outstanding Payments" widget.
* **Integrations in Workflows:** Modules can also augment existing UI flows provided by other modules. For example, if a *Field Management* module provides a calendar scheduling UI, the *Employees* module might plug into that to show employee availability. This is achieved through event handlers or extension points defined in manifests.

All these UI contributions are defined in the manifest in a declarative way. Thorbis’s frontend reads the manifests and assembles the UI accordingly. This means the UI is **extensible**: new modules can insert UI components without altering the core codebase. From a technical perspective, the recommended approach is to use React (Thorbis uses **Next.js** as its React framework) and to lazy-load module components. Each module’s UI components might be bundled separately (e.g., using dynamic import in Next.js) so that if a module is not active, its code isn’t loaded, keeping initial load time down.

**Typed UI Components:** Because manifests are typed, a module will specify exactly what kind of UI piece it is providing (e.g., `navItem: {...}`, `page: {...}`, `widget: {...}`). The platform can validate that, for instance, a `navItem` has a valid target route or icon, or that a `page` component is exported from the module. This reduces runtime errors and makes the addition of modules predictable. The system might also support role-based UI – e.g., a module can specify that its nav item should only show for users with certain roles/permissions, which is enforced at render time.

The outcome is a **composable UI** that feels native no matter which modules are active. A business using only a few modules sees a streamlined UI with just those features, whereas a business using the whole suite sees a richer interface – all still unified under the Thorbis design system.

### Recommended Tech Stack

The Thorbis platform is built on a **performance-first stack** that prioritizes speed, developer experience, and modern web standards:

* **Next.js (Canary)** – using the latest Next.js canary build with the app router for cutting-edge features and performance optimizations. Features dynamic routing with `app/[tenant]/` for tenant-specific subdomains, server-side rendering for SEO, and advanced caching strategies. The app router enables colocated module logic and improved developer experience.
* **React 18.3.1** – leveraging the latest React features including concurrent rendering, automatic batching, and improved hydration for optimal user experience.
* **Supabase** – as the primary database and authentication provider. Built on PostgreSQL with row-level security for secure multi-tenancy. Provides JWT-based authentication, real-time subscriptions for live updates, and comprehensive database tooling. Environment variables for Supabase (URL, anon key, service role) are required for installation.
* **Bun** – as the runtime and package manager, providing significantly faster performance than Node.js. Development workflow uses `bun install` for dependencies and `bun dev` for the development server. Bun's efficient JavaScript engine reduces cold-start times and improves overall server throughput.
* **Zustand** – for lightweight, performant state management across the application, replacing complex Redux setups with a simpler, TypeScript-friendly API.
* **Statsig** – integrated for feature flags, A/B testing, and analytics experimentation. Manages feature rollouts and captures user behavior data with configurable sample rates per environment.
* **Vercel** – as the deployment platform with serverless scaling, global edge network, and built-in domain management. Provides automatic SSL, CDN caching, analytics, and performance monitoring. Multi-tenant architecture leverages Vercel's API for automated subdomain provisioning.
* **UI Framework**:
  * **Radix UI** – for accessible, unstyled component primitives
  * **Tailwind CSS** – for utility-first styling and consistent design system
  * **Lucide React** – for consistent iconography
  * **Framer Motion** – for smooth animations and interactions
* **Performance & Monitoring**:
  * **Sentry** – for comprehensive error tracking and performance monitoring
  * **PostHog** – for product analytics and user behavior tracking
  * **Vercel Analytics & Speed Insights** – for real-time performance metrics
* **Development Tools**:
  * **TypeScript** – for type safety across the entire codebase
  * **Vitest** – for fast unit testing with native ESM support
  * **Cypress** – for end-to-end testing
  * **React Hook Form + Zod** – for performant form handling with type-safe validation
  * **SWR** – for efficient data fetching with built-in caching and revalidation

By adhering to this stack, Thorbis ensures an ecosystem where **frontend, backend, and deployment seamlessly work together**. Developers extending Thorbis can follow the same stack, e.g., writing React components for UI modules, writing database functions in Supabase if needed, and leveraging feature flags via Statsig to introduce new capabilities safely.

## Module System

One of the defining characteristics of Thorbis is its **Module System** – a framework that allows independent feature modules to be created, integrated, and managed throughout the platform. The module system enables Thorbis to serve vastly different industries and use cases from a single codebase, simply by swapping in or out the relevant modules. This section covers how to define a new module (template/structure), some example modules that illustrate the concept, how module dependencies are handled, and how modules contribute to the overall user interface (UI slotting).

### Defining a New Module (Template)

To create a new Thorbis module, developers follow a template that ensures consistency across modules. While the exact format might be a boilerplate in the codebase, conceptually defining a module involves:

* **Module Manifest:** As described in the architecture section, start by creating a manifest file for the module (e.g. `myModule.manifest.ts`). This file includes the module’s name, version, description, dependencies, and declarations of capabilities (UI components, events, RPC methods, etc.). For example, a manifest for a *"Field Service"* module might include:

  * Name: "FieldService", Version: 1.0
  * Dependencies: \["Scheduling", "Employees"] (since it might use scheduling and employee data)
  * Pages: an entry for a scheduling calendar page
  * NavItems: an entry to add "Schedule" in the nav menu
  * Events: an event "JobCompleted" that it will emit
  * RPC: a service method `assignJob(employeeId, jobId)`
  * Widgets: a dashboard widget for "Today’s Jobs".
* **Backend Logic:** A module can include server-side logic such as API routes (Next.js API endpoints, or endpoints registered in the central API router) and database migrations or queries. In the template, you’d create any database schema changes needed (Thorbis might use a migrations system where each module can have its own SQL migrations to run when the module is enabled).
* **Frontend Components:** Develop React components for any pages, modals, or widgets the module provides. The template would have a place for a main page component (e.g. `FieldServicePage.jsx`), possibly lazy-loaded, and any smaller components or hooks needed. If the module adds a nav item, ensure an icon and label are provided. If it adds routes, make sure those routes point to the correct components.
* **Integration Points:** Use the Thorbis SDK or utilities to hook into global systems. For example, if the module needs to react to global events (like user login, or another module’s event), it would register an event handler. If it exposes an RPC, it would register that with the global RPC registry. The template likely includes examples of how to do this registration.
* **Permissions & Settings:** Define any roles or permissions required (maybe in the manifest, or in a separate config). For example, a Reports module might only be accessible to users with a "manager" role. Define default settings or feature flags if the module has configurable parts.

All this is scaffolded by a module generator or template in Thorbis. The key is that modules remain **self-contained**: a module encapsulates its UI, logic, and data needs, exposing only what is declared in the manifest. This makes it easier to maintain and reason about modules independently. New modules can be added to the platform without impacting existing ones (except via declared dependencies/events).

### Example Modules

Based on the current implementation, here are the key Thorbis modules and their capabilities:

* **Business Dashboard Module:** The central hub for business operations, providing real-time metrics, quick actions, and overview widgets. Includes business profile management, performance analytics, and integration status monitoring. Features a customizable dashboard with widgets for revenue tracking, customer metrics, and operational KPIs. Dependencies: Core authentication and user management.

* **Field Service Management Module:** Comprehensive solution for businesses with field workers including technicians, delivery personnel, and service providers. Features job dispatching, route optimization, real-time GPS tracking, and mobile workforce management. Includes scheduling calendar, work order management, and customer communication tools. Dependencies: Employee management, GPS/mapping services, and mobile app integration.

* **Industry Operations Widgets:** Specialized widgets tailored for specific industries including:
  * **HVAC Operations**: Service scheduling, equipment maintenance tracking, emergency dispatch
  * **Plumbing Services**: Job routing, parts inventory, customer history
  * **Electrical Services**: Safety compliance, permit tracking, equipment management
  * **General Contracting**: Project management, subcontractor coordination, progress tracking
  
  Each widget integrates with the core field service module while providing industry-specific workflows.

* **Customer Relationship Management (CRM):** Complete customer lifecycle management including contact management, communication history, and customer analytics. Features automated follow-up sequences, review management, and customer portal integration. Dependencies: Communication module and analytics system.

* **Business Integrations Hub:** Central management for third-party integrations including payment processors, accounting software, marketing tools, and industry-specific platforms. Features one-click setup, configuration management, and integration health monitoring. The system currently supports numerous integrations with automatic syncing capabilities.

* **Analytics & Reporting Module:** Advanced business intelligence with customizable dashboards, automated reports, and performance insights. Includes revenue analytics, customer behavior tracking, operational efficiency metrics, and predictive analytics. Dependencies: All data-generating modules for comprehensive reporting.

* **Settings & Configuration Module:** Comprehensive business settings management including team permissions, notification preferences, billing configuration, and system customization. Features role-based access control and audit logging for security compliance.

Each of these modules is activated only if the business needs that functionality. For example, a small retail shop might enable Employees and Invoicing, but not Field Management. A plumbing company might enable Employees, Field Management, Invoicing, and perhaps a scheduling/booking module. Thorbis’s promise is that after a short setup, these modules work together out-of-the-box (e.g. the plumbing company’s field management and invoicing link up such that when a job is done in Field Management, an invoice can be automatically generated for it). This kind of cross-module interaction is configured through the manifest (declaring events, etc.) and minimal global configuration.

### Dependency Resolution and Validation

When modules have dependencies, Thorbis handles them transparently. The platform maintains a **registry of available modules** and their dependency graph. If a module is being enabled, the system will:

* **Check for Missing Dependencies:** If any required module is not currently active, the system will attempt to enable those first. If those modules are not installed/present at all, it might prompt the admin to install or indicate that the module cannot be enabled until its prerequisite is available.
* **Version Compatibility:** Because each module has a version, Thorbis can prevent version mismatches. For example, if Module X depends on Module Y version 2.0+, and you have an older version of Y, Thorbis will warn or auto-update Module Y (depending on system policy). This ensures a consistent, stable environment.
* **Cyclic Dependency Detection:** The module loader will detect if there’s any circular dependency and throw an error or prevent such a configuration, as that indicates a design problem (in practice, modules should be designed in a hierarchy or as optional peers that communicate via events rather than directly depending on each other).
* **Lazy Loading:** If a module is rarely used or very large, Thorbis could choose to lazy-load it when first needed (for example, not load the code for Reports module until someone actually opens a Reports page). The dependency planner handles this as well – e.g., when you navigate to a part of the app that triggers a module load, it will ensure all dependencies are loaded first, then proceed.

**Validation**: On startup and during any configuration change, Thorbis runs validations. It checks that all active modules are in a consistent state (no missing dependency, no duplicate providing the same capability in incompatible ways, etc.). It may log warnings if, say, two modules both try to register a page at the same route. It also validates environment variables or external config needed by modules. For instance, if a module requires an API key (like Mapbox for map features), Thorbis can validate that the key is present in the environment configuration at startup and surface a clear error if not. This way, when a business admin turns on a new feature, they won't run into confusing runtime errors – any setup issues (like "you need to configure API key X for this module") are caught early.

### UI Slotting and Integration

We touched on UI composition earlier; here we detail how modules plug into various UI slots with concrete examples:

* **Navigation Items:** Suppose you enable the *Invoicing* module. The manifest for Invoicing includes a navItem specification, something like: `{ section: "Financial", label: "Invoices", route: "/invoices", icon: "ReceiptIcon" }`. Thorbis will take this and insert "Invoices" under the "Financial" section of the sidebar menu (or top menu) when rendering the navigation for users who have access. If the user’s role doesn’t allow financial data, the nav item might be hidden even if module is active.
* **Pages:** Continuing the example, the Invoicing module likely provides a page component for the `/invoices` route (maybe showing a list of invoices) and perhaps a detail page for viewing a single invoice (`/invoices/[id]`). These pages are registered with the router. In Next.js, this could be done by having a dynamic route file structure under the module that is conditionally included, or via a custom routing layer that Thorbis implements. The result is that when a user navigates to the Invoices section, the app knows to load the Invoicing module’s components to display the page. If the module is disabled, those routes simply don’t exist (Thorbis could show a 404 or an upsell like "This feature is not enabled").
* **Dashboard Widgets:** The Thorbis home dashboard might have a grid or slots (e.g., top row, side panel, etc.) where modules can contribute widgets. For instance, enabling a *Sales* module might add a "Sales This Week" chart widget to the dashboard. Enabling an *Operations* module might add a "Tasks for Today" widget. These widgets are usually small React components. The manifest could specify a widget with a target location (like `dashboard.mainGrid` or `dashboard.sidebar`) and a component to render. The platform then, on rendering the dashboard, iterates through active modules’ widgets for that location and renders them. This approach ensures the dashboard is contextually relevant to the modules the business uses.
* **Contextual UI Extensions:** Some modules might not add brand new pages, but rather extend the UI of another module. For example, an *Analytics* module might add an "Analytics" tab inside existing pages (like adding an analytics tab to a Product page to show view statistics). Or a *Reviews* module might enhance a Customer profile page with a section showing that customer’s reviews or feedback. Thorbis allows this by defining extension points – places in a page’s component tree where other modules can inject content. Technically, this could be done via React context or a plugin pattern (the host component checks if any module provides an extension for "customerProfile.extraSection" and renders those). The manifest for the Reviews module could have something like: `extends: { target: "CustomerProfilePage", component: CustomerReviewsPanel }`. At runtime, Thorbis merges these so that the Customer Profile page (maybe provided by a CRM module) will include `<CustomerReviewsPanel>` if the Reviews module is active. This is a powerful mechanism to avoid monolithic pages and allow cross-cutting features.
* **Theming and Consistency:** All module UI, despite being separate, follows the Thorbis design system and uses common components. For instance, modules might use a shared component library for forms, tables, modals, etc. This way, even modules developed at different times or by third parties look and feel consistent within the app.

Overall, **UI slotting** means that modules can contribute to the UI in predefined ways (nav items, pages, widgets, extensions), and Thorbis takes care of assembling the final UI. The user sees one coherent application, not a patchwork of separate apps, even though under the hood it’s highly modular. As the platform evolves, new UI slots can be introduced as well – for example, a future version of Thorbis might allow modules to provide **mobile app screens** or **workflow automation recipes** in a similar declarative manner.

## Thorbis Academy

Thorbis is not just a software platform; it also aims to educate and empower its users. **Thorbis Academy** is an integrated learning hub within the platform, envisioned as a hybrid of Brilliant.org and Coursera, tailored for business operations and professional development. This academy provides interactive, high-quality training content that helps users get the most out of Thorbis and also improve their general business skills.

**Concept and Vision:** Thorbis Academy addresses a critical need: businesses often require training when adopting new systems and ongoing education to stay competitive. The Academy is built into Thorbis, so users don't have to leave the platform to learn. It combines the **interactive problem-solving** style of Brilliant.org (engaging users in active learning, e.g., through quizzes or interactive simulations) with the **structured course approach** of Coursera (expert-curated video lectures, readings, and assessments). The goal is to make learning **engaging, practical, and directly applicable** to the user's day-to-day operations.

**Content Categories:** Thorbis Academy offers a wide range of courses and learning paths, including:

* **Platform Usage Training:** Courses on how to use Thorbis itself. For example, "Getting Started with Thorbis", "Advanced Module Configuration", or "Thorbis for Managers". This ensures every user can become proficient in the tools they're using. Interactive tutorials might walk a user through configuring a module or interpreting a report within the actual Thorbis interface.
* **Sales and Customer Service Training:** General business skills courses, like improving sales techniques, customer communication, or lead generation. Since Thorbis likely has modules for CRM and sales tracking, the Academy courses can tie in (e.g., a course on sales might reference how to use Thorbis CRM features to manage a sales pipeline).
* **Industry-Specific Operations:** Tailored courses for specific verticals. For instance, a "Restaurant Operations 101" course covering best practices in managing a restaurant (inventory turnover, reservation management, etc.), or "Home Services Business Playbook" covering scheduling technicians, handling customer quotes, etc. These courses not only teach the domain knowledge but also illustrate how Thorbis modules support those workflows.
* **Continuous Education and Certification:** Beyond immediate operations, Thorbis Academy can provide ongoing education in areas like compliance, advanced management, or technical skills. Businesses might enroll their staff in courses like "Project Management Basics", "Accounting & Compliance for Small Businesses", or even technical topics if relevant. Completion of courses could earn certificates or badges (some might even be tied to real certifications if Thorbis partners with educational institutions).

**Teaching Formats:** The Academy emphasizes **interactive learning**. Instead of purely static videos, courses include:

* **Interactive Lessons:** These could be in the Thorbis app itself, using guided exercises. For example, a lesson might present a scenario (say, scheduling a new job for a field worker) and ask the user to actually perform the steps in a sandbox environment of Thorbis. Hints and feedback are given in real-time.
* **Quizzes and Challenges:** After content sections, quick quizzes test understanding. For skills like math (for finance) or logic (for scheduling or routing problems), there might be puzzles similar to Brilliant.org style, where the user has to work through a problem.
* **Simulations:** Some courses include simulations or "sandbox games" – e.g., running a virtual business for a week where the user has to make decisions and use Thorbis tools properly, with the simulation providing outcomes and feedback.
* **Video and Rich Media:** Wherever beneficial, video lectures or demonstrations are included (like Coursera). This might be used for, say, a leadership talk or an interview with an industry expert which is less interactive but informative.
* **Community & Discussion:** Learners can discuss questions in forums or comment sections, share tips, or even challenge each other (though this starts to border on a MOOC platform, Thorbis Academy could incorporate community elements among the users of the Thorbis platform).

**Self-Serve and Admin Controls:** Thorbis Academy is designed to be useful for individual self-paced learning and also for team or company-wide training. From the **individual user perspective**, anyone can enroll in courses relevant to their role or interest. A new employee at a company using Thorbis might be assigned to complete "Thorbis Basic Training" in their first week. From the **admin perspective** (business owners or team leaders), Thorbis provides admin controls to manage learning:

* Company admins can **assign courses** to team members (e.g., require all field technicians to complete a "Safety & Compliance" course, or all managers to do the "Thorbis Advanced Reporting" course).
* Admins can track progress and completion for their team. The platform might show a dashboard like "5/10 employees completed the XYZ training".
* There could be **quizzes or tests** whose results are reported to admins if needed (for certification or compliance purposes).
* Admins might also have the ability to create custom training content within Thorbis Academy for internal processes (this might be a future or premium feature – effectively letting companies make their own mini-courses for things like "New Hire Onboarding in Our Company", and host it in the same Academy for consistency).

**Value Proposition:** Thorbis Academy sets Thorbis apart from generic software solutions by not only providing tools but ensuring users know how to use them effectively and improve their business. It reduces the need for external training resources or consultants. It also can improve the stickiness of the platform – if employees are trained extensively on Thorbis, they become power users and the company is more likely to fully utilize and remain on the platform. For Thorbis as a company, the Academy could even be a revenue stream (charging for premium courses or certification programs) or a partnership channel (co-developing content with experts or institutions).

In summary, Thorbis Academy is a built-in learning and development platform covering everything from using Thorbis software to broader business skills, using interactive and modern e-learning techniques, and offering both individuals and organizations a way to continuously improve.

## Hardware Ecosystem

While Thorbis is primarily a software platform, it extends into the physical world through an ecosystem of hardware devices. These devices are designed to seamlessly integrate with the Thorbis platform, allowing businesses to connect their offline operations with the online system. By offering hardware solutions like POS terminals and trackers, Thorbis approaches a true end-to-end operating system for business. Below we describe several key device categories in the Thorbis hardware ecosystem, including their use cases, target customers, estimated costs, and how they tie into the Thorbis software.

### Point-of-Sale (POS) Terminals

**Use Case:** POS terminals are essential for retail and restaurant businesses to process in-person transactions. Thorbis POS terminals would be used at checkout counters or service desks to ring up sales, take payments, print receipts, etc. They might run the Thorbis POS software module natively.

**Target Customer:** Retail shops, boutiques, restaurants, cafes, and any physical storefront using Thorbis for sales and inventory. Also pop-up stores or mobile sales (with a smaller form-factor POS or tablet).

**Hardware & Cost:** A Thorbis POS terminal could be a touchscreen device with an integrated card reader and receipt printer. Estimated COGS (Cost of Goods Sold) might be around **\$300-\$400** per unit (for a high-quality touchscreen, embedded computer, printer, and card reader). The MSRP (retail price) might be around **\$800-\$1000**, which yields a margin roughly in the 50-60% range. This pricing is in line with industry standards where, for example, an advanced POS terminal often sells for \~\$1000.

**Expected Margin:** Given the above, margins on hardware could be \~50%. Thorbis can also bundle service with it to increase overall margin (see SaaS below).

**Recurring SaaS Potential:** Each POS terminal could tie into a recurring subscription for the POS software and payment processing. For example, Thorbis might charge a monthly fee per terminal (or per store) for software licensing, support, and cloud data sync, perhaps **\$50-\$100/month** depending on features. Additionally, if Thorbis handles payment processing, it could earn a small percentage per transaction (like Stripe/Square do). This recurring revenue often exceeds the hardware one-time margin over the long run.

**Integration with Thorbis:** The terminal would automatically sync sales data to the Thorbis platform (inventory gets updated, sales and revenue reports populate in the Reports module). It likely runs a specialized Thorbis app in kiosk mode. It might also integrate with the Thorbis Inventory module (to decrement stock on sales) and the CRM (to record customer purchases if loyalty program is integrated). Setup is plug-and-play: a new Thorbis POS terminal could be shipped pre-configured – the business just connects it to internet and it connects to their Thorbis hub.

### Card Readers (Mobile Payment Devices)

**Use Case:** For businesses that need mobile or additional payment points without a full terminal – e.g., a food truck, a on-site serviceman taking a payment, or just adding more check-out lines during rush – small card readers are useful. These devices might connect to a phone or tablet running Thorbis, or directly via Bluetooth/USB to a computer.

**Target Customer:** Anyone processing payments on the go: delivery services, field service technicians (plumbers, etc.), farmers market vendors, or even retail for line-busting (taking payments in-store away from the register).

**Hardware & Cost:** Thorbis-branded card readers could be similar to Square readers or Chip+PIN devices. The COGS for a basic Bluetooth card reader (chip, swipe, tap) could be around **\$50**. They might retail for **\$100-\$150**. These are relatively low-cost devices.

**Expected Margin:** Possibly \~50% margin or more (depends on how advanced the device is). If sold at \$120 with a \$50 cost, margin is \~58%.

**Recurring SaaS Potential:** The card reader itself likely requires the Thorbis mobile app or POS app to function, which is part of the subscription that the business is already paying. So while you might not charge separately for the card reader software, the real recurring revenue is through **payment processing fees**. For every transaction through the reader, Thorbis (if acting as payment processor or aggregator) might take e.g. 2.6% + \$0.10 or similar (or a portion of that if partnering with a processor). Over time, that can be significant. Also, Thorbis could offer an optional cellular connectivity service for these devices (like some providers do) which could be a small monthly fee if needed.

**Integration with Thorbis:** The card reader ties into the Thorbis Payment Processing module. When a card is swiped or tapped, the transaction is recorded in Thorbis (through the POS or mobile app interface). The sale data flows into the same systems as other Thorbis transactions. If the business uses Thorbis Invoicing, a field tech could swipe a card to pay an invoice on the spot via the mobile app using this reader, and the invoice status in Thorbis updates to "Paid". The device could also be configured easily from the Thorbis dashboard (for instance, assign readers to specific employees or devices for accountability).

### Asset Trackers (IoT Tracking Devices)

**Use Case:** Asset trackers are small devices (often GPS-enabled) to track equipment, vehicles, or high-value assets. For example, a construction company could put trackers on heavy machinery, or a delivery company on their trucks, to monitor location and usage. They can also be used for inventory management (e.g., tracking pallets or containers).

**Target Customer:** Industries like logistics, field services, construction, or anyone with physical assets that move around. Even a cleaning service might want to track company vehicles or expensive tools.

**Hardware & Cost:** These could be small battery-powered GPS units that report location periodically via cellular or Bluetooth gateway. COGS might be **\$20-\$40** each (GPS chip, cellular module, battery, rugged casing). They could be sold in packs or individually for maybe **\$50-\$100** each depending on functionality and ruggedness.

**Expected Margin:** Roughly 50% margin. If cost \$30 and selling \$60, that’s 50%. There might also be costs for cellular data that need to be factored in (Thorbis might subsidize or charge for connectivity).

**Recurring SaaS Potential:** Yes, typically trackers come with a service plan since they use data. Thorbis could charge a monthly fee per tracker (e.g., \$5-\$15 per month per active tracker) which covers the cellular data and the software features. This is similar to how many asset tracking solutions work. Additionally, the data flows into Thorbis's Field Management or Asset Management module, which could be a premium feature set. If the customer is paying for the Field Management module, it might include some number of trackers or require adding that on.

**Integration with Thorbis:** Thorbis would have an **Asset Management** or **Fleet Tracking** module that integrates these devices. The trackers would feed location data into the Thorbis system in real time. For example, on a Thorbis dashboard map, you can see all your vehicles or equipment locations. Alerts can be set up: if an asset leaves a geofence, trigger an event in Thorbis (perhaps an "AssetMoved" event). Maintenance schedules could also tie in (e.g., track engine hours or mileage from trackers to schedule service via the maintenance module). The integration should be plug-and-play: either the trackers are pre-linked to the customer's Thorbis account, or there's a simple onboarding in the UI (enter a device ID or scan QR code). From then on, data appears in their portal.

### Pre-Programmed Tablets

**Use Case:** Tablets can serve multiple roles: as portable terminals for employees (for example, a restaurant waiter using a tablet to take orders which go into Thorbis, or a construction foreman doing a safety checklist), as kiosks for customers (like a sign-in kiosk, or a self-ordering tablet at a table or lobby), or as general-purpose mobile devices for running the Thorbis app.

**Target Customer:** Restaurants (table-side ordering, kitchen display screens), healthcare clinics (patient check-in on a tablet), retail (inventory taking or customer registry on an iPad-style device), field service teams (a tablet in the truck with the Thorbis field app), and more. Essentially any business that can benefit from a dedicated Thorbis device rather than BYOD phones.

**Hardware & Cost:** These could be off-the-shelf tablets (like Android tablets or iPads) but Thorbis might pre-configure and possibly ruggedize them. Perhaps Thorbis partners with a hardware manufacturer for co-branded tablets. The cost can vary widely. A decent 10-inch Android tablet might have COGS around **\$150-\$200**. If specialized (rugged or with peripherals), maybe more. They might retail for **\$300-\$500** depending on specs and market (still aiming for roughly 50% margin). Alternatively, Thorbis could simply charge a setup fee for preparing tablets if using commercial ones.

**Expected Margin:** If selling their own hardware, aim \~40-50%. If just configuring others, margin comes from service fee rather than hardware sale.

**Recurring SaaS Potential:** The tablet itself runs the Thorbis software which the business is subscribing to. There could be a device management service as well (Thorbis could include an MDM – mobile device management – to remotely manage those tablets, update the Thorbis app, lock them down to only work for business purposes, etc.). If so, that might be a small monthly add-on per device (\$5-10 for device management features). Also, similar to POS, if these tablets are used for specific roles like self-order kiosks, Thorbis might have a specific software module for that with its own pricing.

**Integration with Thorbis:** These tablets would come **pre-programmed with Thorbis** – meaning they have the Thorbis application installed, and when powered on the first time, they immediately prompt for the business’s login or are pre-linked to the account. Possibly they run in kiosk mode autoloading Thorbis. Integration examples:

* A **Kitchen Display tablet** for restaurants might show orders (coming from the POS module when a waiter enters an order, it shows up on kitchen's Thorbis KDS app on the tablet).
* A **Field Service tablet** might have an offline-capable Thorbis app so technicians can view jobs, update status, collect signatures, etc., syncing to the cloud when back online.
* A **Check-in Kiosk** tablet in an office or gym could run a Thorbis form for visitors to sign in, which feeds into a Visitor Management module.

Thorbis ensuring these tablets are tightly integrated means the user experience is smooth (no fiddling with general device setup), and any support needed can be handled by Thorbis (since they control the software image on the tablet).

### Smart TVs / Displays

**Use Case:** Smart TVs or large displays can be used for digital signage, dashboards, or menu boards. Thorbis could enable businesses to use a TV to show content that is managed through the Thorbis platform. For instance, a retail store could have a promotional screen that pulls content from Thorbis (like current promotions, or a live KPI dashboard in an office setting).

**Target Customer:** Restaurants (digital menu boards or promo screens), retail (advertising displays), corporate offices (for displaying dashboards of business metrics or project statuses), gyms (class schedules on a screen), etc.

**Hardware & Cost:** This might not be a custom Thorbis-built hardware in most cases; rather Thorbis might support popular smart TV sticks or devices (like an Amazon Fire Stick, ChromeBit, or Raspberry Pi) with the Thorbis signage app. If Thorbis did offer hardware, it could be a small HDMI stick or mini PC that is pre-loaded with Thorbis Display software to plug into any TV. COGS for a basic device like that could be **\$50**. Retail perhaps **\$100-\$150**.

**Expected Margin:** Similar \~50%. However, Thorbis might choose to not manufacture but instead provide software that runs on existing devices.

**Recurring SaaS Potential:** The content management for digital signage could be part of a Thorbis module (say a "Signage Module") which could be an add-on subscription. The actual device might require minimal recurring costs (aside from maybe licensing for certain video content or templates). But Thorbis could charge a small monthly fee per screen (for example \$20 per screen per month) for the service of managing and updating them remotely. If a company uses it for internal dashboards, maybe included in their plan instead.

**Integration with Thorbis:** Through a Thorbis admin interface, the user can manage what gets displayed on their screens. For example, upload a menu and it shows on the menu board device, or select which KPIs to show on the office dashboard screen. The devices themselves would be registered in Thorbis (so the platform knows screen #1 is at Store A showing menu, screen #2 is at HQ showing metrics, etc). Content updates are pushed over the internet. If built on something like Next.js/web tech, the device might just load a special Thorbis Display web page in full-screen mode which is tied to that device's identity. This way, any changes made in the Thorbis cloud are reflected on the screen in near real-time.

Security is considered too – screens likely operate on a restricted account or API key so they can only fetch content and not expose data beyond what’s intended for display.

### Other Potential Devices

*(In addition to those explicitly listed, it's worth noting Thorbis could expand into other IoT or hardware areas as it grows, each integrated into the platform similarly. For example, **smart sensors** (for environment monitoring in facilities), **wearable devices** (for workforce safety or time tracking), or **smart locks** (managed via Thorbis for property management). These would follow the same pattern: hardware capturing data or enabling actions, and Thorbis software ingesting that data or controlling the hardware.)*

Each hardware offering strengthens Thorbis's position as an all-in-one business OS by covering the last mile of interaction (point of sale, field tracking, etc.) in a unified manner. The strategy is to offer **turnkey hardware solutions** – they come ready to plug into Thorbis – and to generate ongoing value through the combination of hardware sales, service subscriptions, and increased software stickiness.

## Industry Playbooks

Thorbis is designed to be industry-agnostic, but its true power shines when tailored to specific verticals. In this section, we present *playbooks* for how Thorbis can be applied in various industries. Each playbook outlines the typical startup cost (both financial and in terms of setup effort), the core Thorbis modules that would be activated for that industry, and the key differentiators – i.e., why Thorbis adds unique value for businesses in that vertical. We start with four detailed examples (Home Services, Restaurants, Retail, Automotive) and then suggest many other verticals where Thorbis can excel.

### Home Services Playbook

**Industry Overview:** *Home Services* include businesses like plumbing, electrical, HVAC, cleaning services, landscaping, pest control, etc. These businesses typically operate with field technicians who travel to customer locations, scheduled appointments, and often have on-site invoicing or quotes.

* **Startup Cost Estimate:** A home services business using Thorbis would need minimal upfront investment in IT. Assuming they already have basic devices (smartphones or tablets for technicians), the main cost is the Thorbis subscription and possibly some hardware if they opt for it. For example, they might purchase a few Asset Trackers for vehicles (say 5 trackers at \$60 each = \$300) and perhaps a pre-configured tablet for the dispatcher (\$400). The software subscription for modules (see below) might be around \$100-\$200/month for a small operation. So initial cost could be well under **\$1,000** (maybe \$500 hardware + first month software). If they choose not to get any Thorbis hardware immediately, startup cost is essentially just subscription and training time.
* **Core Modules to Activate:**

  * *Scheduling/Calendar*: to manage appointments and dispatch technicians.
  * *Field Management*: to track jobs in the field, technician check-ins, and possibly vehicle locations (integrating those asset trackers).
  * *CRM/Customer Management*: to keep customer records, addresses, job history.
  * *Invoicing & Payments*: to generate invoices on the fly and accept payments (maybe using mobile card readers on-site).
  * *Quotes/Estimates*: a module to create job estimates for customers before approval.
  * *Inventory* (optional): if they need to track parts and supplies on trucks.
  * *Reporting/Analytics*: to see metrics like jobs completed per week, revenue, technician performance.
* **Key Differentiators:** Thorbis provides an **end-to-end solution** for home services which many currently achieve by patching together 3-4 different apps (one for scheduling, another for invoices, another for GPS tracking, etc.). With Thorbis, the dispatcher can schedule a job, automatically notifying the technician’s Thorbis app; the technician sees all customer info and past jobs on their tablet or phone via Thorbis; they can record job notes and capture customer signatures; when done, an invoice is automatically available to send to the customer or charge their card on the spot – all within one system. The **real-time synchronization** (e.g., status updates, location tracking) is a big plus for efficiency and customer transparency (you could even allow sending a "Technician is en route" notification via Thorbis). Another differentiator is **ease of onboarding** – a small home services company could literally get started in a day: enter your team members into the Employees module, set up some default services/pricing, and you’re ready to schedule jobs. Additionally, Thorbis's feature flags allow enabling advanced features as they grow, such as automated marketing (sending follow-up emails asking for reviews or offering maintenance plans). Competing solutions might offer parts of this, but Thorbis's *modular all-in-one* nature and quick startup (no heavy custom IT setup) is a strong advantage.

### Restaurant Playbook

**Industry Overview:** Restaurants, bars, and cafes have needs around point-of-sale, table service, reservations, menu management, and inventory (for ingredients), among others. They also value quick service and integration between front-of-house and back-of-house (kitchen).

* **Startup Cost Estimate:** For a restaurant, initial costs might include hardware like Thorbis POS terminals or tablets. A small restaurant might need 2-3 POS terminals (\$800 each) and 1-2 kitchen display tablets (\$300 each). That’s around **\$2,000-\$3,000** in hardware. Additionally, receipt printers or cash drawers if not integrated (another few hundred). The Thorbis software subscription could be in the range of \$200-\$500/month for a restaurant (depending on size and modules like reservations, online ordering, etc.). Total startup maybe in the **\$3,000-\$5,000** range including hardware and first few months of software – which is still typically lower than some legacy restaurant POS systems.
* **Core Modules to Activate:**

  * *Point of Sale (POS)*: central for order entry, payments, and receipt printing. The POS module ties to menus and inventory.
  * *Menu Management*: to create digital menus, update pricing, daily specials, etc. Possibly integrated with QR code menus or online menus.
  * *Order Management*: handles routing orders to kitchen (could integrate with Kitchen Display System on a tablet).
  * *Reservations & Table Management*: if the restaurant takes reservations or wants to manage table assignments/waitlists.
  * *Inventory*: to track ingredient levels, and alert when to restock (could integrate with supplier ordering).
  * *Employees*: for staff scheduling, time clock (clocking in/out through a Thorbis terminal or app), and payroll export.
  * *CRM/Loyalty*: capturing customer data, reservations history, preferences; maybe a simple loyalty program management as well.
  * *Online Ordering Integration* (optional module): to receive orders from the restaurant’s website or delivery platforms, integrated directly into Thorbis.
  * *Reporting*: daily sales reports, menu item popularity, labor cost vs sales, etc.
* **Key Differentiators:** The restaurant benefits from Thorbis by having **all systems in sync**. Many restaurants struggle with separate systems (one for POS, another for reservations, another for inventory, etc., and then spreadsheets to reconcile data). With Thorbis, a sale at the POS immediately deducts inventory of ingredients, updates sales and revenue reports, and ties to employee performance (e.g., server sales tracked). The **reservations system** being in the same platform means you can see a diner's profile when they check in (e.g., high spender, or preferences like window seat), which smaller restaurants typically can't do easily. The **table management** can connect to the kitchen in that when a party is seated, their waiter is auto-assigned, or an order's prep status can show on the waiter’s Thorbis app. **Real-time analytics** are available: owners can check from their phone how many tables are occupied and revenue so far in the night. Also, the **ease of updating menu and pushing it to all channels** (in-house menu tablets, online menu, printed menu via template) from one interface is a time-saver. Thorbis's modularity means a small cafe could start with just POS and basic inventory, and then later add the reservation module if they start doing dinner service, etc. A key differentiator is that Thorbis can unify **on-premise and online** operations: online orders or deliveries come into the same queue as in-person orders. This avoids the common scenario of juggling a tablet from UberEats plus the local POS separately. In short, Thorbis for restaurants is a unified operations platform that can improve service speed, data insight, and reduce the tech overhead for the owners.

### Retail Playbook

**Industry Overview:** Retail covers anything from small boutiques to larger stores. Key needs include inventory management (for products/SKUs), sales (POS), staff scheduling, and possibly e-commerce integration if they also sell online.

* **Startup Cost Estimate:** For a small retail store, initial costs could include one or two POS terminals (\$800 each), maybe a tablet for inventory management on the floor (\$300), and possibly card readers for mobile checkout. So hardware \~\$1,500. Software subscription might be around \$150-\$300/month for core modules. If they add e-commerce integration, possibly an additional setup cost or higher plan. Rough total initial < **\$2,000** plus any optional e-commerce site costs.
* **Core Modules to Activate:**

  * *POS Sales*: to handle in-store transactions.
  * *Inventory Management*: track stock levels, SKU details, reordering alerts. Possibly multi-location inventory if needed.
  * *Product Catalog*: managing product info, categories, pricing – feeds into POS and e-commerce.
  * *Employee Scheduling*: manage shifts, track hours, especially if multiple employees in store.
  * *Customer Management*: basic CRM or loyalty program (capture customer emails at checkout, manage loyalty points or promotions).
  * *Analytics/Reports*: sales by day, by product, inventory turnover, etc. Possibly integration with accounting.
  * *E-commerce Integration* (optional): Thorbis might provide a module to host a simple online store or integrate with Shopify via API. If the retailer wants an online presence, having it integrated is key (inventory syncing between online and offline sales).
* **Key Differentiators:** For retail, Thorbis’s advantage is a **unified commerce platform** (omnichannel capabilities). Small retailers often struggle to keep their in-store inventory and online store in sync – Thorbis can handle that seamlessly if they use the platform for both. Even if only brick-and-mortar, having inventory and sales tightly integrated means no more manual stock updates or separate reports. Thorbis can provide **real-time stock visibility**: if an item sells out, the system can prevent further sales or at least alert. The **analytics** normally available only to larger chains are at the retailer’s fingertips (e.g., identifying top 10 selling items, or slow-moving stock to mark down). The employee scheduling being in the same system is a plus: the manager can create schedules and employees can view them via a Thorbis app, which reduces absenteeism or confusion. With loyalty and CRM built-in, a store can easily start a mailing list or loyalty program without needing a separate provider. Another differentiator is **ease of deployment**: rather than having to set up a networked on-premise server like some older POS systems, Thorbis is cloud-based (especially if deployed on something like Vercel). The retailer just needs internet and the devices. In terms of cost, Thorbis could be more affordable than legacy retail systems and more straightforward than piecing together iPad apps plus a bunch of spreadsheets. All these make Thorbis appealing: modern features (cloud, mobile, analytics) but at an accessible scale. Lastly, if the retailer grows to multiple locations, the multi-tenant nature of Thorbis means they can manage all stores under one account/hub, or separate hubs per store under a parent account (depending on Thorbis design), which scales well.

### Automotive Services Playbook

**Industry Overview:** This refers to auto repair shops, car servicing centers, body shops, etc. They have specific workflow: vehicle intake, diagnostic estimates, repair orders, parts ordering, and customer pick-up, as well as managing technicians in the garage.

* **Startup Cost Estimate:** An auto shop might use a combination of a front-desk computer or POS (\$800 if using Thorbis terminal), and tablets for technicians to view jobs (\$300 each, maybe a couple of those). Possibly a card reader for taking payments or a payment terminal. Hardware might be \~\$1,500. Software: maybe \$200/month for modules. Possibly integration with specialized parts databases might add cost. So initial could be around **\$2,000** including gear.
* **Core Modules to Activate:**

  * *Appointment/Booking*: to schedule customer appointments for service.
  * *Estimates/Quotes*: create detailed repair estimates (with parts and labor line items) that can be shared with customers for approval.
  * *Work Orders*: track work in progress, assign to mechanics, time tracking on jobs.
  * *Inventory (Parts Management)*: track parts in stock (oil, filters, etc.) and integrate with suppliers for ordering parts just in time for specific jobs.
  * *POS/Invoicing*: after service, generate final invoice including parts & labor, take payment.
  * *CRM*: maintain customer vehicle history (past services, recommendations for next service).
  * *Check-In/Check-Out*: possibly a module to handle vehicle check-in (recording mileage, condition, etc.) and check-out (customer signatures, handing off keys).
  * *Reports*: average repair times, parts usage, revenue by service type, etc.
* **Key Differentiators:** Thorbis can give an auto repair shop a **dealership-like management system** at a small-business price. Many small shops rely on whiteboards and generic invoicing software, missing out on integrated parts tracking or customer history. With Thorbis, when a car is checked in, all info is logged; a mechanic can pull up the vehicle’s history on a tablet in the bay (maybe seeing that this car had a brake job last year, etc). Creating an estimate with Thorbis can be faster if the parts database is built-in or previously used parts are remembered – the module could have common service templates (e.g., "Brake Pad Replacement" which auto-adds pads, labor hours). The customer can receive a professional-looking estimate by email and approve it digitally. Once approved, the work order is automatically in the system for the mechanics. Parts management integration means if a part needed is not in stock, Thorbis can either alert or even initiate an order from a linked supplier (some systems integrate with e.g. AutoZone or Napa online). The **coordination between front office and garage** is smoother: status updates can be logged (technician marks job as 50% done, or adds notes "need additional part X", which front office sees immediately). Payment and invoicing are part of the same system, so at pickup the clerk just converts the work order to an invoice and takes payment; all the details (parts, taxes, labor) are already there. Another differentiator is **customer service**: Thorbis could automatically send reminders like "Your car is due for an oil change" based on time since last service, which is an automated marketing feature that a small shop normally wouldn't implement on their own. Also, **integrated scheduling** avoids double-booking bays or technicians, improving shop efficiency. In summary, Thorbis offers a holistic garage management solution akin to what big dealerships have, but configurable and priced for independent shops – that’s a compelling proposition.

### Additional Verticals

Beyond the four examples above, Thorbis’s flexible platform can be configured to benefit many other industries. Here are several additional verticals (with brief notes on how Thorbis would be applied):

* **Healthcare Clinics & Offices:** Scheduling appointments, patient records (with privacy considerations), billing insurance and patients, managing staff schedules. Thorbis could power small clinics or dental offices by combining scheduling, reminders, invoicing, and patient follow-up in one. Key modules: Appointment, CRM (as patient database), Billing, perhaps a specialized records module for notes (though full EMR/EHR is complex, Thorbis could start simpler).
* **Fitness & Wellness (Gyms, Yoga Studios, Salons):** These need class or appointment scheduling, membership management, point-of-sale for products, and perhaps trainer/therapist scheduling. Thorbis can handle membership subscriptions, booking classes, checking in members via a QR or card, and retail sales (like protein shakes or products at the front desk). Modules: Membership (recurring billing), Scheduling (classes, appointments), POS, and CRM for client preferences.
* **Education & Training Centers:** Small schools or tutoring centers managing class schedules, enrollments, student info, and payments. Thorbis could manage course offerings, allow online enrollment, track attendance, and handle tuition payments or installment plans. Modules: Scheduling (classes), CRM (student/parent info), Invoicing or Payment Plans, and maybe a Content module for sharing class materials.
* **Real Estate & Property Management:** A property management company could use Thorbis to track properties, leases, tenant requests, and maintenance. Modules: CRM (tenant and owner contacts), Property Listings, Work Orders (maintenance tasks), Accounting (rent payments, payouts to owners), and perhaps a Portal integration if tenants submit requests online.
* **Event Management & Venues:** For companies that plan events or run venues (like a wedding venue or conference center), Thorbis can manage event bookings, vendor contacts, scheduling staff, and invoicing clients. Modules: Booking Calendar (for venue availability), CRM (client and vendor management), Task Management (checklists for events), Invoicing, and possibly Ticketing if selling event tickets.
* **Nonprofits & Community Organizations:** They often need to manage members or donors, schedule events or programs, track donations, and volunteer management. Thorbis could be configured with modules like CRM (donors/members), Event Registration, Donation processing (a payments module variant), and perhaps Learning (if they run educational programs, Thorbis Academy integration).
* **Professional Services (Consulting, Agencies):** These businesses track projects, time, invoices, and contracts. Thorbis could provide project management light (task lists, deadlines), time tracking for billing, CRM for clients, and invoicing. Modules: Project Management, Time Tracking, CRM, Invoicing, and maybe a Knowledge Base for documentation.
* **Manufacturing / Workshops:** A small manufacturing or craft workshop might manage orders, inventory of raw materials, production schedules, and distribution. Thorbis modules could cover Order Management (order intake, status tracking), Inventory (raw materials & finished goods), Production Scheduling (maybe akin to tasks or jobs on a calendar), and Quality/Reporting on output. This can dovetail with hardware like IoT sensors on machines in future.
* **Tourism & Activities (Tours, Rentals):** Businesses that rent equipment (bikes, boats) or run tours need booking, waivers, tracking equipment inventory, and taking payments. Thorbis can handle online booking (via an embedded form or site integration), schedule tours, manage customer info (including signed waivers attached in the system), and manage inventory of rental gear. Modules: Booking, CRM, Inventory (for gear), E-sign/Document (for waivers), and POS (for on-site payments or retail).
* **Construction & Contractors:** Managing projects, budgets, subcontractors, timesheets, and equipment. Thorbis can be the project management and field tracking tool. Modules: Project (with tasks/phases and budget tracking), Time Tracking (workers logging hours on a job via mobile app), Asset Tracking (equipment at sites, using trackers), and Forms (for safety checklists or inspections). Integration with Invoicing for progress billing and perhaps a Bid/Estimate module for new projects.

*Note: The list goes on – virtually any small-to-medium enterprise could find a use-case. Thorbis's strategy would be to create template configurations or recommended module bundles for each vertical, possibly with slight customizations, so that when a new customer in that industry signs up, they can pick an industry template and get a pre-tailored setup.*

Each vertical leverages the same underlying Thorbis platform but in a way that speaks that industry’s language. **The ability to only turn on relevant modules and the presence of industry-specific training content (via Thorbis Academy) makes adopting Thorbis in any of these verticals faster and more effective than generic software.** This vertical approach, combined with the horizontal consistency of the platform, is a major advantage of Thorbis in the market.

## SEO, Deployment, API, and Environment

This section covers several advanced or developer-oriented aspects of the Thorbis platform: the SEO system (ensuring the platform and tenant hubs are discoverable and optimized), deployment architecture (especially the multi-tenant subdomain setup via Vercel), the Thorbis API for extending and integrating, and the environment setup including configuration and tooling for development and production.

### SEO System Overview

Thorbis features a **production-ready, enterprise-grade SEO system** that's fully implemented and optimized for local business discovery. The system ensures maximum visibility for both the platform and individual business listings across all major search engines.

**Implemented SEO Features:**

* **Comprehensive Metadata Management:** Built into the root layout with dynamic meta tag generation, including title templates, descriptions, keywords, and Open Graph data. All metadata is optimized for local business discovery and community engagement.
* **Advanced Structured Data Implementation:** Currently includes multiple JSON-LD schemas:
  * **Organization Schema**: Complete company information with contact details and social media links
  * **WebSite Schema**: Site-wide search functionality with structured search actions  
  * **SiteNavigationElement Schema**: Hierarchical navigation structure for better crawling
  * **LocalBusiness Schema**: Detailed business profiles with location, hours, and review data (implemented per business page)

* **Performance-Optimized SEO Architecture:**
  * Server-side rendering with Next.js for instant search engine indexability
  * Preconnect and DNS prefetch for critical resources (Google Fonts, Analytics)
  * Critical resource preloading with proper fetch priorities
  * Advanced image format support (AVIF, WebP) with fallbacks

* **Social Media Optimization:**
  * Complete Open Graph implementation with dynamic image generation
  * Twitter Card integration with large image support  
  * Facebook App ID integration for enhanced social features
  * Dynamic social sharing images with business-specific branding

* **Technical SEO Excellence:**
  * Robots.txt optimization with specific Google Bot instructions
  * Canonical URL management for duplicate content prevention
  * XML sitemap generation (RSS feed integration planned)
  * Multi-language support with hreflang implementation ready
  * Schema.org markup for local business discovery and review display

* **Local SEO Specialization:**
  * Geographic targeting with region and location metadata
  * Local business schema with complete NAP (Name, Address, Phone) data
  * Review and rating schema for rich snippets in search results
  * Location-based search action implementation

* **Security & Performance Headers:**
  * Content Security Policy implementation
  * Mobile-first responsive design indicators
  * Progressive Web App manifest integration
  * Service worker registration for offline functionality

In summary, the Thorbis SEO system ensures that tenant subdomains and any public pages rank well and present rich information in search engines without the business having to hire SEO experts. It's a differentiator for an all-in-one platform because each tenant doesn't need to worry about the technical SEO – it’s largely handled for them automatically. All they need to do is provide quality content (like filling in their business profile, writing a blog, etc.), and Thorbis takes care of the rest (structured data, meta tags, etc.).

**Technical Implementation:** Thorbis uses server-side rendering (SSR) for most pages, allowing search engines to crawl content easily. The JSON-LD scripts and meta tags are included in SSR output. The system also handles sitemap generation for each tenant site and can automatically submit to search engines or integrate with webmaster tools. These implementation details ensure that a new Thorbis-powered site can quickly become visible on Google and other search engines.

### Deployment and Multitenancy (Vercel Integration)

Thorbis employs a sophisticated yet automated deployment model, especially to support the **"localhub-style" multitenancy** where each business (tenant) gets its own subdomain under the main Thorbis domain. The platform leverages Vercel’s cloud capabilities to manage this seamlessly, meaning that when a new business signs up, they can get a dedicated space (subdomain) with minimal manual intervention.

**Automatic Subdomain Provisioning:** With Thorbis, each tenant might have a URL like `yourbusiness.thorbis.com`. This subdomain creation is automated via the Vercel API. As soon as a new "hub" (tenant instance) is created in Thorbis, the system calls Vercel to set up the subdomain on the Thorbis.com domain. The integration takes care of DNS records and issuing an SSL certificate for `yourbusiness.thorbis.com` automatically (using Let’s Encrypt under the hood). This means every tenant site is secure (HTTPS by default) and globally accessible within seconds of creation.

**Multi-Tenant Routing:** Technically, Thorbis uses a wildcard domain configuration on Vercel (`*.thorbis.com`). The request flow for any tenant subdomain goes through Vercel’s edge network, then hits the Thorbis application which detects the tenant based on the hostname. In Next.js, this could be handled by middleware that parses the subdomain and sets the context (e.g., attaches the tenant ID for use in queries). The app likely has dynamic routes or a catch-all for `[tenant]` at the top level to serve the appropriate content. For instance, a request to `yourbusiness.thorbis.com/app` would be internally routed to the same Next.js app, but the app knows to load data for "yourbusiness". This approach avoids having to spin up a new app instance per tenant – all tenants are served from the same running application (true multitenancy), which is efficient.

**Activation Flow:** When a user (perhaps an admin on the main site) creates a new hub (perhaps via a form "Create my workspace"), Thorbis will:

1. Insert a record in the database for the new tenant with status "pending".
2. Call the **Vercel API** to add the subdomain (using stored credentials and project ID).
3. Vercel adds the DNS entry and provisions SSL. Thorbis gets a response, and if successful, marks the database record as "active" and possibly stores the domain ID or details.
4. The subdomain is usually live within seconds (DNS propagated on Vercel’s network almost immediately).
5. The new tenant can start accessing their subdomain, which will serve a fresh instance of Thorbis (with maybe an onboarding wizard).

This process is fully automated, requiring no devops action for each new client – a big advantage for scaling up many small business tenants quickly.

**Edge Caching and Performance:** Because Vercel is in use, each tenant subdomain benefits from Vercel's global CDN caching. Static assets (images, JS bundles) are cached at the edge. Dynamic requests might also use caching strategies if appropriate, though for authed content it’s mostly dynamic. In any case, users around the world hitting a tenant site get fast response thanks to the Vercel infrastructure. Vercel also ensures that security headers and best practices (HSTS, etc.) are in place for these domains.

**Environment Configuration for Vercel:** To enable this integration, certain environment variables must be set in Thorbis:

* `VERCEL_TOKEN` (API token to authenticate calls to Vercel),
* `VERCEL_TEAM_ID` (if relevant, for Vercel team scope),
* `VERCEL_PROJECT_ID` (the specific Vercel project representing Thorbis app),
* `NEXT_PUBLIC_MAIN_DOMAIN` and `NEXT_PUBLIC_TENANT_DOMAIN` which likely are both "thorbis.com" in production (used by the app to form URLs).
  With these in place, Thorbis knows what domain to attach subdomains to and has permission to create them on Vercel.

**Monitoring and Error Handling:** The integration isn’t just fire-and-forget. Thorbis has logic for error handling – if the Vercel API call fails (for example, due to a network error or a name collision), Thorbis will mark the hub as "failed" and notify someone. Likely the admin user might see an error message ("Your site couldn't be created, please contact support") and the Thorbis internal team would get an alert. There might be an automatic retry mechanism (e.g., try again in a few minutes). Also, the integration is testable: documentation suggests commands to verify connectivity and even simulate subdomain creation on localhost for testing. This ensures the ops team can validate things during deployment.

**Request Flow Details:** In the architecture doc snippet, the flow is:

```text
User Request (tenant.thorbis.com)
    ↓
Vercel Edge Network
    ↓
Next.js Middleware (tenant detection)
    ↓
Dynamic Route (app/[tenant]/)
    ↓
Tenant-Specific Content
```

.
This confirms the approach: one Next.js app serves all tenants. The "tenant detection" middleware probably rewrites or sets a cookie/context for the request. Then, inside the app, all data fetching and UI are scoped by that tenant ID (which might correspond to a schema tenant\_id, row level security using Supabase, etc.). This design is scalable: whether 10 or 10,000 subdomains, it's one deployment. Vercel handles routing the domains to it.

**Custom Domains:** Although not explicitly mentioned, an extension of this could allow tenants to use their own custom domain (like `mybusiness.com` instead of a thorbis subdomain). Vercel's API can also handle adding custom domains to a project. Thorbis would then integrate that, possibly as a premium feature. The infrastructure would then provision SSL for the custom domain similarly. If this is supported, it likely involves adding a record and verifying domain ownership. (Since not asked directly, this is a forward-looking point.)

In summary, Thorbis's deployment model offers **SaaS out of the box** – each tenant gets an isolated environment (subdomain, database rows partitioned by tenant) instantly. The heavy lifting of DNS, SSL, and scaling is offloaded to Vercel. This allows Thorbis developers to focus on features, and gives customers a professional setup (their own URL and secure site) without any technical hassle on their part.

### Thorbis API

Thorbis provides a **RESTful API** for developers and partners to interact with the platform programmatically. This API allows external applications or integrations to perform operations such as managing data in Thorbis modules, retrieving analytics, or automating tasks. It also underpins the Thorbis frontend itself (the web app calls these APIs under the hood). Key aspects of the API include:

* **Base URL and Structure:** The API is accessible under a base URL, for example `https://thorbis.com/api` for the production environment (and `http://localhost:3000/api` in development). All endpoints are organized under this, typically by resource (e.g., `/api/business/...`, `/api/users/...`, etc.). The API follows REST conventions with standard HTTP methods (GET for retrieve, POST for create, PUT/PATCH for update, DELETE for delete where applicable).

* **Authentication:** Most endpoints require a valid JWT token issued by Thorbis’s Auth (Supabase Auth is used in the backend). Clients must include an `Authorization: Bearer <jwt_token>` header with requests. The JWT is obtained via the normal Thorbis login flow. There's likely also role/permission checks on each endpoint (so an employee can't call an admin-only endpoint, etc., which is enforced by checking the JWT claims or in the business logic).

* **Standardized Responses:** The API responses are standardized for consistency. On success, the response JSON has a shape: `{"success": true, "data": {...}, "message": "Operation completed successfully", "timestamp": "..."}:contentReference[oaicite:34]{index=34}`. On errors, it returns `{"success": false, "error": { "code": "ERROR_CODE", "message": "Human readable error message", "details": {...} }, "timestamp": "..."}`. This uniform structure makes it easier for client code to handle responses (always check `success` boolean, then either use `data` or handle `error.code`). The presence of an `error.code` allows the client to react to specific situations (e.g., "AUTH\_REQUIRED" might prompt a login, "VALIDATION\_FAILED" might highlight form fields, etc.).

* **API Resources:** The Thorbis API covers comprehensive business operations with the following endpoints:

  * **Business Management:**
    * `GET /api/biz` - Retrieve business details and profiles
    * `POST /api/business/submit` - Submit new business listings
    * `GET /api/business/search` - Search businesses with location, category, and query filters
    * Business analytics and performance metrics endpoints
  * **User & Authentication:**
    * `GET /api/users` - User profile management
    * `GET /api/user/profile` - Detailed user information
    * Team and employee management endpoints for admin users
  * **Location & Mapping Services:**
    * `GET /api/geocode` - Forward geocoding for address to coordinates
    * `GET /api/reverse-geocode` - Reverse geocoding for coordinates to address
    * `GET /api/place-details` - Detailed place information from map services
    * `GET /api/geolocation` - Location-based services and nearby business discovery
  * **Categories & Classification:**
    * `GET /api/categories` - Business category management and hierarchy
    * Industry-specific categorization and filtering
  * **Booking & Scheduling:**
    * `GET /api/bookings` - Appointment and booking management
    * Calendar integration and availability checking
  * **Dashboard & Analytics:**
    * `GET /api/dashboard/*` - Business dashboard data and metrics
    * Performance analytics and reporting endpoints
  * **Utilities & Tools:**
    * `GET /api/autocomplete` - Search suggestions and auto-completion
    * `POST /api/send` - Communication and messaging services
    * `POST /api/shorten` - URL shortening for marketing campaigns
    * `POST /api/data-sync` - Data synchronization between systems
  * **Feature Flags & Configuration:**
    * `GET /api/flags` - Feature flag management and A/B testing configuration

* **Usage Example:** To illustrate, if an external system wants to create a new invoice in Thorbis for a particular customer, it would send a POST request to something like `/api/invoices` with JSON body describing the invoice (customer ID, line items, amounts). The Thorbis API would validate (check that the user is allowed to issue an invoice, perhaps that the customer exists under that tenant, etc.), create the invoice, maybe trigger any events (like send an email or update analytics), and then respond with `success:true` and the new invoice data or an ID. The caller gets a consistent success response or if something was wrong, an error with code (like "INVALID\_CUSTOMER\_ID" or "INSUFFICIENT\_PERMISSIONS").

* **Open API Specification:** The documentation mentions open API references. It is likely that Thorbis provides an OpenAPI (Swagger) specification file for this REST API, which can be used to generate client libraries or explore the API. This would detail all endpoints, parameters, and response schemas. For developers, having this means easy integration; they could, for instance, generate a Python or JavaScript client for Thorbis quickly.

* **API and Multi-tenancy:** The API likely respects the tenant context – either the JWT encodes the tenant, or there is a required parameter/hostname to indicate which tenant’s data to act on. Since subdomains are used, the API might also be served per subdomain (e.g., `https://yourbusiness.thorbis.com/api/...` works and automatically scopes to that business). This is ideal because the API call will naturally operate in that tenant’s context. If hitting the main thorbis.com/api endpoint, maybe an admin token could specify the tenant. But it's probably simpler: use the subdomain for tenant-scoped API calls, use the main domain for any cross-tenant or public data.

* **Security:** Only authorized actions are allowed. The use of Supabase Auth and RLS (Row Level Security) likely means even if someone tried to tamper with an ID, they couldn't access another tenant’s data – the database would prevent it. Also, all communication is over HTTPS, as Vercel ensures, so data in transit is encrypted.

* **Extensibility:** This API makes it possible to build custom applications or integrations on top of Thorbis. For example, a business could have a custom mobile app that uses the Thorbis API to fetch data (like jobs for the day) or push data (like update a task status). Or Thorbis could integrate with third-party services: e.g., a Zapier integration could use the API to create new contacts in Thorbis CRM when something happens elsewhere.

* **Rate Limiting and Performance:** Likely the API has some rate limiting to prevent abuse (especially if parts of it are public-facing like business search). This isn't detailed but is a typical consideration. The Statsig and analytics integration suggests performance is monitored, so slow or heavy endpoints will be logged and optimized.

In essence, the Thorbis API ensures that anything you can do in the Thorbis web application is also doable via API calls, enabling automation and integration. Coupled with the modular nature, in the future Thorbis might even allow installing custom modules that expose their own API routes – but by default, the core modules’ APIs are documented and available.

### Environment Setup and Configuration

Thorbis features a sophisticated development environment with extensive performance monitoring and optimization built-in. The setup emphasizes developer experience while maintaining production-grade performance standards.

**Local Development Environment with Performance Monitoring:** Thorbis provides a comprehensive development setup with built-in performance tracking:

* **Bun Installation & Setup**: Install Bun as the primary runtime and package manager. Use `bun install` for dependencies and `bun dev` for the development server with hot reloading and performance metrics.
* **Performance-First Development**: The development environment includes:
  * Real-time performance monitoring with Web Vitals tracking
  * Automatic bundle size analysis and warnings
  * Memory usage monitoring and leak detection
  * Component render time tracking
  * Network request performance analysis
* **Environment Variables** - comprehensive configuration including:
  * **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  * **Analytics & Monitoring**: Statsig client/server keys, Sentry DSN, PostHog API keys
  * **Performance**: Vercel Analytics tokens, Speed Insights configuration
  * **Maps & Location**: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, Google Maps API keys
  * **Multi-tenancy**: Domain configuration for subdomain routing
  * **Development Tools**: Feature flag configurations, debug settings

**Advanced Development Features:**

* **Error Handling**: Comprehensive error boundary system with Sentry integration for automatic error reporting and performance tracking
* **Performance Provider**: Wraps the entire application with performance monitoring, including:
  * Service Worker management for production caching
  * Experimental API monitoring and optimization
  * Automatic performance optimization suggestions
  * Real-time performance metrics displayed in development
* **Testing Integration**:
  * Vitest for unit testing with native ESM support and coverage reporting
  * Cypress for end-to-end testing with visual regression testing
  * Performance testing with automated Lighthouse CI integration
* **Development Workflow Optimization**:
  * Hot module replacement with performance impact tracking
  * Automatic code splitting analysis
  * Bundle size monitoring with alerts for performance regressions
  * Automatic dependency security scanning

**Production and Staging Environments:** Thorbis likely uses separate environment files or configurations for staging and production. As seen in the Statsig config file, they differentiate values per environment:

* In **staging** (`.env.staging`), they have moderate settings for analytics (e.g., 20% session replay sample).
* In **production** (`.env.production`), they tune these down for performance (e.g., 5% sample, larger batch sizes for events).
* They also ensure `STATSIG_ENABLED=true` in those, meaning feature flags system is active in those environments (perhaps in local dev it could be off or use a dev key).
* Additional environment-specific vars might include `NEXT_PUBLIC_API_URL` which in dev is localhost, in prod is the production URL (though relative paths can often be used instead).
* It's crucial that private keys like `SUPABASE_SERVICE_ROLE_KEY` or any `STATSIG_SERVER_SECRET_KEY` are **never exposed on the client**. The naming convention `NEXT_PUBLIC_` is followed to mark safe-to-expose ones. For example, the Statsig client API key is marked as a public variable (it’s okay if it’s in front-end) whereas any server secret would be only in backend config.

**Feature Flag and Config Validation:** On startup, Thorbis likely checks that all required environment variables are present. The Statsig config file suggests that it programmatically validates keys like `NEXT_PUBLIC_STATSIG_CLIENT_API_KEY` on launch. If something critical is missing, Thorbis can log an error and possibly halt to avoid running in a misconfigured state. This is helpful to avoid scenarios where, e.g., analytics or auth quietly fails due to a missing key.

**Statsig & Analytics Config:** The environment variables also control behavior of the Statsig and analytics system:

* Flags like `STATSIG_SESSION_REPLAY_SAMPLE_RATE` or `ANALYTICS_BATCH_SIZE` are adjustable per env for balancing detail vs overhead. For instance, in prod, they send analytics in batches of 20, flush every 5 seconds for efficiency.
* Security: Statsig's secret keys are only on server, client gets a public key (with limited scope).
* Debugging: there are debug flags (`DEBUG_STATSIG`, `DEBUG_ANALYTICS`) to turn on verbose logging if needed in dev/troubleshoot.
* The idea is that developers can easily toggle these in their .env to diagnose issues (like see every flag evaluation or event send in console).

**Supabase and Database:** Thorbis uses Supabase, which means:

* Locally, a developer might either connect to a live Supabase instance or run Supabase locally via Docker. The environment guide provided actual Supabase keys (which looked like an example project). It might be a dev project or an example. If working on Thorbis, one would create their own Supabase project and plug keys in. Supabase handles authentication and data, and since RLS policies are used, devs need the service role key for certain admin tasks in dev.
* The environment also includes any other database or service credentials, but since Supabase covers DB, file storage, and auth, not many others are needed.

**Performance and Troubleshooting:** The environment guide highlighted some optimizations (like fixed multiple Supabase instances, etc.) but for users setting up, the main point is:

* Use the provided **development commands** (`bun dev`, etc.) to ensure you're running the app correctly.
* Look at console logs (Thorbis prints performance logs with certain prefixes like "⚡ PERFORMANCE:" or "🔒 SECURITY:" or "🔧 Supabase" to help devs see what's happening).
* If common issues come up (Mapbox errors, search not working, etc.), there's a troubleshooting list: check .env, restart server, verify keys, etc.. These are typical steps to resolve config issues.

**Deployment Setup:** Deploying Thorbis (particularly to Vercel) involves setting all the above environment variables in the Vercel project settings. The Vercel integration doc listed which to add (including the Vercel API credentials themselves). Once those are in place, the CI/CD (continuous deploy) will ensure the app has everything it needs to spin up and handle tenants.

**Multitenancy Config:** The environment also defines `NEXT_PUBLIC_MAIN_DOMAIN` and `NEXT_PUBLIC_TENANT_DOMAIN`. In production both might be "thorbis.com". In a self-hosted scenario or development, these could differ (like in dev, you might set `NEXT_PUBLIC_MAIN_DOMAIN=localhost:3000` and some scheme to simulate subdomains). But since local wildcard domains are tricky, a dev might just test multiple tenants by manually switching context or running a separate instance for a test tenant. Alternatively, one can configure a wildcard DNS locally or hosts file for something like `test.thorbis.localhost` to hit the dev server – not trivial, but possible. For staging, `NEXT_PUBLIC_TENANT_DOMAIN` could be something like "thorbis-staging.com" if they use a separate domain.

**Subdomain & API usage in Dev:** The `NEXT_PUBLIC_API_URL` also appears in config. That likely is used by front-end code to call the backend API (like it might build absolute URLs for some requests). In dev it's `http://localhost:3000/api`, in prod it's `https://thorbis.com/api`. If using subdomains, the front-end might default to same domain calls (which works if the cookie or auth context is the same). But `NEXT_PUBLIC_API_URL` ensures if needed it can call a central endpoint.

**Statsig Environment Variables Summary:** The Statsig doc provides a quick reference for staging vs production values. It's a good reference for how to tune a production environment for performance:

* Lower sample rates (to save cost and not impact user experience),
* Slightly larger batch sizes and intervals (to reduce network calls),
* Add timeouts like `STATSIG_MAX_INIT_TIME` to not hang if Statsig doesn’t init within 100ms.
  These kind of settings are already thought through, meaning Thorbis in production will have minimal performance overhead from the analytics/flags system.

**Conclusion on Environment:** For anyone deploying or developing Thorbis, the environment configuration is straightforward if guidelines are followed: fill out the .env with all required keys (the documentation enumerates them clearly), use Bun and Next.js commands to run, and be mindful of differences between dev and production configurations. It's important to keep secrets out of client-side (prefix only truly public ones with `NEXT_PUBLIC_`). The environment setup has been refined to solve past issues (like the Mapbox token naming got fixed to match exactly what Mapbox expects), so newer developers benefit from those fixes.

## Appendices

### Glossary

* **Thorbis Platform:** The overall software system comprising all modules, the core framework, and integrated services (the "business operating system").
* **Module:** A plug-in feature set within Thorbis that can be independently enabled or disabled. Also referred to as a plugin. Examples: Employees module, Inventory module, etc.
* **Module Manifest:** A configuration file that defines a module’s identity, capabilities, dependencies, and integration points with the Thorbis platform.
* **Tenant (Hub):** A single instance of Thorbis for a customer (business). Each tenant has isolated data (e.g., its own set of employees, products, etc.) and typically a dedicated subdomain.
* **Feature Flag:** A boolean or conditional configuration that enables/disables a feature or module, often used for gradual rollouts or toggling beta features for certain users/tenants.
* **Event Bus:** The internal system for passing event messages between modules or components (publish/subscribe mechanism for decoupled communication).
* **RPC (Remote Procedure Call):** A method for one part of the system to directly invoke a function or service in another part, abstracting it as a "call" rather than an HTTP request (though it might be implemented with HTTP or function calls internally).
* **Supabase:** The backend service Thorbis uses for database (PostgreSQL), authentication, and storage. Provides Thorbis with a hosted database and auth system.
* **Statsig:** The service integrated for feature flag management, A/B testing, and analytics. Statsig helps manage different configurations per environment and collect usage data.
* **Vercel:** The cloud platform Thorbis uses for hosting the application and handling domains. Vercel provides the infrastructure for deploying Next.js and managing the multi-tenant subdomains.
* **POS Terminal:** Point-of-Sale Terminal, a hardware device with Thorbis software for processing sales transactions in person.
* **KDS:** Kitchen Display System, typically a screen in restaurant kitchens to show orders electronically (Thorbis could implement this via a tablet showing orders from the POS).
* **RLS (Row Level Security):** A database feature (in Postgres/Supabase) ensuring that each tenant (or user) can only see their own data at the database query level, adding an extra layer of multitenancy safety.
* **OpenAPI (Swagger):** A standard format for describing REST APIs. Thorbis provides an OpenAPI spec so developers can easily see all endpoints and generate client code.

**The OpenAPI spec provided (likely `thorbis_api.json` or similar) can be loaded in tools like Swagger UI or Postman. It allows you to try out endpoints and see models. This documentation recommends reviewing that for details like all query parameters and data models (for brevity, not all are expanded here).**

---

### Error Codes

Thorbis API errors include a code to facilitate programmatic handling. Here are some common error codes and their meaning (note: actual codes depend on implementation, but these illustrate the style):

* **AUTH\_REQUIRED** – The request is not authenticated (missing or invalid JWT). The user should log in.
* **FORBIDDEN** – The authenticated user does not have permission to perform this action (e.g., an employee trying to access an admin-only endpoint).
* **NOT\_FOUND** – The requested resource was not found. For instance, an API call for a specific ID that doesn’t exist or doesn’t belong to this tenant.
* **VALIDATION\_ERROR** – The input provided fails validation. The `details` field in the error will often contain which fields and why (e.g., "email: invalid format").
* **CONFLICT** – The request could not be completed due to a conflict in data state. Example: trying to create a user with an email that already exists, or enabling a module that is already enabled.
* **RATE\_LIMITED** – The client has hit a rate limit for requests. The error message might advise to slow down.
* **INTERNAL\_ERROR** – A catch-all for unexpected server errors (HTTP 500). The message might say "An unexpected error occurred". Thorbis would log details internally.
* **INTEGRATION\_ERROR** – Used if an external service call fails. For example, payment processing failed or Vercel domain provisioning failed. The message might advise to contact support or retry later.
* **FEATURE\_DISABLED** – The endpoint or action is not available because the related module/feature flag is turned off for this tenant.
* **UNSUPPORTED\_ACTION** – The request was understood but not allowed in the current context (e.g., trying to use an endpoint that only works in production while on a dev environment, etc.).

These error codes appear in the `error.code` field of API responses. API clients should use them to implement conditional logic (e.g., if `code == "AUTH_REQUIRED"` then redirect to login).

### Contribution Guidelines

**Guidelines for internal developers and open-source contributors to the Thorbis project.**

Contributing to Thorbis requires following our standards to maintain quality and compatibility across the platform:

* **Development Setup:** Ensure you can run the platform locally (see Environment Setup above). Use Bun and the provided scripts. It's recommended to test changes in a staging environment (if available) with multiple modules active to see interactions.
* **Coding Standards:** Use our established conventions: code is primarily TypeScript (for both front and back end). Follow naming conventions (CamelCase for React components, snake\_case for database fields, etc.), and include JSDoc or comments for complex logic. Lint and format your code with the configured tools (`bun lint` runs ESLint/prettier) before pushing.
* **Module Development:** If adding a new module, use the module template. Define a manifest and respect the dependency injection patterns. Do not hard-code cross-module integrations; use the event bus or declared RPC interfaces so that modules remain optional.
* **Feature Flags:** Wrap new features or changes in feature flags when appropriate. This allows gradual rollout and testing. Coordinate with product leads on naming and expected values for flags (and add any new environment variables needed to `STATSIG_ENVIRONMENT_VARIABLES.md`).
* **Testing:** We require tests for new critical functions (if the project has a testing framework set up, likely using jest or similar). At minimum, manually test the common use cases of your change. For bug fixes, include a regression test if possible. If modifying database schema or Supabase functions, test those in a local or staging DB.
* **UI/UX Consistency:** When adding or changing UI, use the existing components and styles. Ensure responsiveness (test on desktop and mobile sizes). Any new UI element should ideally fit into the theme (colors, spacing, typography) – if not sure, consult the design guidelines in the project.
* **Documentation:** All significant changes or additions should be documented. Update relevant markdown docs in the `docs/` folder (like this documentation set). If adding a new module, create a section for it. If adding API endpoints, update the `api.md` or the OpenAPI spec. Also update the README or user-facing docs if behavior changes.
* **Git Workflow:** Follow the branch strategy in use (e.g., feature branches and merge requests). Write clear commit messages (referencing issue numbers if applicable). Before merging to main, ensure CI checks pass (build, lint, tests).
* **Code Reviews:** All code must be reviewed by at least one other team member. Be open to feedback, and likewise review others’ code constructively. Check for security issues (e.g., ensure new endpoints enforce auth and RLS, no plain text secrets, etc.), performance (avoid N+1 queries, heavy computations on main thread), and handle error cases.
* **Security & Privacy:** When dealing with data, ensure compliance with privacy rules – e.g., don’t log sensitive PII, respect access controls. If a contribution involves new data collection (analytics or user data), it should be behind consent checks or clearly necessary for functionality.
* **Community Contributions:** If this project is open source, contributors should first discuss major changes via an issue. Small fixes (typos, minor bug fixes) can be directly PR’d. All contributors must sign the CLA (if applicable) and ensure they have rights to contribute the code.
* **Release Process:** Document in the pull request any steps needed after deployment (like database migrations or enabling a feature flag). Co-ordinate with the team if the change should be deployed behind a feature toggle first. Our continuous deployment means merges to main might go live quickly, so make sure everything is production-ready or properly toggled.

By following these guidelines, we keep Thorbis stable, scalable, and maintainable as it grows. We encourage innovation and improvements, but always balanced with the reliability expected from a business-critical platform.

### API Reference

*(For a full list of API endpoints and schemas, refer to the separate API documentation in `api.md` or the interactive API explorer. Below is an outline of available APIs by category.)*

* **Authentication:** Endpoints for login, logout, refresh tokens (if not solely handled by Supabase client). Most auth is handled via Supabase, so direct API endpoints might be limited.
* **Users & Teams:**

  * `GET /api/users` – Get current user profile.
  * `PUT /api/users` – Update current user profile (e.g., name, preferences).
  * `POST /api/users` – (Admin only) Invite or create a new user (employee) in your tenant.
  * `GET /api/users/list` – (Admin only) List users in your organization.
  * Possibly endpoints for roles/permissions management (assign roles to user, etc.).
* **Business / Tenant Info:**

  * `GET /api/biz?id={tenantId}` – Get details of a business (public info).
  * `POST /api/business/submit` – Submit a new business listing (if Thorbis has a public directory concept).
  * `POST /api/business/setup` – (During onboarding) set up business profile, initial configuration.
  * `PUT /api/business` – Update business info (name, address, logo, etc.).
* **Search & Discovery:**

  * `GET /api/business/search?...` – Search businesses with filters (for directory use).
  * Other search endpoints might exist, such as searching for customers or inventory within a tenant (perhaps as separate endpoints).
* **CRM (Customers):**

  * `GET /api/customers` (with optional query or ID) – retrieve customers.
  * `POST /api/customers` – create new customer.
  * `PUT /api/customers/{id}` – update customer.
  * These would manage client contact info, etc., within a tenant.
* **Scheduling/Calendar:**

  * `GET /api/appointments?date=...` – list appointments/jobs for a given day or range.
  * `POST /api/appointments` – schedule a new appointment.
  * `PUT /api/appointments/{id}` – update (reschedule, cancel, etc.).
* **Invoicing & Payments:**

  * `GET /api/invoices` – list invoices (with filters like status).
  * `POST /api/invoices` – create a new invoice (draft or unpaid).
  * `POST /api/invoices/{id}/send` – send invoice to customer (email).
  * `POST /api/invoices/{id}/pay` – record a payment (or integrate with Stripe for actual payment).
* **Inventory & Products:**

  * `GET /api/products` – list products/services.
  * `POST /api/products` – add a new product.
  * `PUT /api/products/{id}` – update product (price, stock, etc.).
  * Possibly `GET /api/inventory` – more detailed stock levels or adjustments.
* **Reports:**

  * `GET /api/reports/{reportName}?params...` – retrieve data for a given report (e.g., sales over time). Alternatively, reports might be generated client-side by pulling relevant data from multiple endpoints.
* **Geolocation Services:** (from the snippet)

  * `GET /api/geocode?address=...` – forward geocoding, returns lat/long for an address.
  * `GET /api/reverse-geocode?lat=...&lng=...` – reverse geocoding, returns an address for coordinates.
  * These likely proxy to Google or Mapbox APIs configured with the keys, to make it easier for the client (so the client doesn't need direct Google API call).
* **Misc and Modules:** If modules introduce special endpoints, those would be documented in their context. E.g., a **Reviews module** might have `POST /api/reviews` to submit a review, etc. A **Messaging module** could have endpoints for sending or retrieving messages.

**Using the API:** To use the Thorbis API as a developer, you would:

1. Obtain an API token (the JWT from logging in a user, or possibly a service key if Thorbis supports service accounts).
2. Include it in your requests (`Authorization: Bearer ...`).
3. Refer to the OpenAPI spec or documentation for the exact endpoint paths and required fields.
4. Handle the standardized responses – check the `success` field, and then either use the data or handle the error by looking at the `error.code`.

**OpenAPI Spec:** The OpenAPI (Swagger) file provided (likely `thorbis_api.json` or similar) can be loaded in tools like Swagger UI or Postman. It allows you to try out endpoints and see models. This documentation recommends reviewing that for details like all query parameters and data models (for brevity, not all are expanded here).

---
