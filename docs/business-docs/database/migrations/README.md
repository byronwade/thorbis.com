# Database Migrations

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Target Audience**: Database Administrators, Backend Developers  

## Overview

This directory contains database migration files that manage schema evolution and data transformations in a versioned, reversible manner.

## Migration Files

Migration files follow the naming convention: `YYYYMMDDHHMMSS_descriptive_name.sql`

## File Types

- **Schema Migrations** - Table, index, and constraint changes
- **Data Migrations** - Data transformations and updates
- **Rollback Scripts** - Emergency rollback procedures
- **Seed Data** - Initial data population

## Execution Order

Migrations are executed in chronological order based on the timestamp prefix. Each migration is tracked in the `shared.migration_log` table.

For detailed migration procedures, see the [Database Migrations Guide](../MIGRATIONS.md).