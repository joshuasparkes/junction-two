# Organization Hierarchy Documentation

## Current Organization Structure

### Database Schema

The system currently uses three main tables to manage organizations and user relationships:

1. **organizations** table
   - `id`: UUID primary key
   - `name`: Organization name
   - `created_at`: Timestamp
   - `created_by`: User ID who created the organization
   - `address`: Physical address
   - `phone`: Contact number
   - `owner_id`: User ID of the organization owner
   - `users`: JSONB array containing user memberships with roles

2. **user_profiles** table
   - `id`: UUID primary key
   - `email`: User email address
   - `first_name`, `last_name`: User name details
   - `created_at`, `updated_at`: Timestamps
   - `org_memberships`: JSONB array of organization memberships

3. **user_organizations** table (junction table)
   - `id`: UUID primary key
   - `user_id`: Reference to user_profiles
   - `org_id`: Reference to organizations
   - `role`: User role within the organization (manager, user, booker)
   - `is_primary`: Boolean indicating primary organization
   - `created_at`: Timestamp

### Current Functionality

- Organizations exist as standalone entities
- Users can belong to multiple organizations
- Each user has one primary organization
- Users have roles within organizations: manager, user, booker
- Organization data is denormalized in both organizations.users and user_profiles.org_memberships for performance

## Proposed Parent-Child Organization Structure

### Overview

The new structure will introduce hierarchical relationships between organizations, where:
- An organization can be a parent organization
- Parent organizations can have multiple child organizations
- Parent organizations retain all current functionality

### New Features

1. **Parent Organization Capabilities**
   - All existing organization features and access levels
   - Ability to create child organizations
   - Ability to delete child organizations
   - Ability to add users to child organizations

2. **Child Organization Properties**
   - Linked to a parent organization
   - Inherits certain properties from parent (to be defined)
   - Can have its own users and settings

### Proposed Database Changes

To implement this hierarchy, the following changes would be needed:

1. **Modify organizations table**
   - Add `parent_org_id` column (nullable UUID, references organizations.id)
   - Add `is_parent` boolean flag (default false)
   - Add constraint to prevent circular references

2. **New permissions considerations**
   - Parent organization managers can manage child organizations
   - Users in parent organizations may need visibility into child organizations
   - Child organization users operate independently unless parent intervenes

### Implementation Notes

The parent-child relationship will be:
- One-to-many (one parent can have multiple children)
- Single level (no grandchildren for now)
- Parent organizations maintain supervisory control over children
- Child organizations maintain operational independence

### Constraints

- An organization cannot be its own parent
- Deleting a parent organization requires handling child organizations first
- Users from parent organizations with appropriate roles can manage child organization users