# Database Indexes

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Target Audience**: Database Administrators, Performance Engineers  

## Overview

This directory contains database index definitions optimized for query performance while maintaining efficient storage and update performance.

## Index Types

- **Primary Indexes** - Unique identification and relationships
- **Performance Indexes** - Query optimization for common patterns
- **Composite Indexes** - Multi-column query optimization
- **Partial Indexes** - Conditional indexing for specific use cases
- **Full-Text Indexes** - Search optimization for text content

## Strategy

All indexes are designed with tenant isolation in mind, ensuring optimal performance for multi-tenant queries. Indexes are monitored for usage and effectiveness.

For detailed indexing strategy, see the [Database Indexes Guide](../INDEXES.md).