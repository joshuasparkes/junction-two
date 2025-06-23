# Policy Conflict Resolution & Evaluation Priority System

## Overview

When multiple policy rules evaluate the same travel booking, conflicts can arise. This document defines how the system handles overlapping rules and determines the final action.

## Rule Actions Hierarchy

The policy engine supports four rule actions with the following priority order (most restrictive to least):

1. **BLOCK** - Completely prevents the booking
2. **HIDE** - Hides the option from results  
3. **APPROVE** - Requires approval before booking
4. **OUT_OF_POLICY** - Shows policy warning but allows booking

## Conflict Resolution Logic

### **Principle: Most Restrictive Action Wins**

When multiple rules apply to the same travel option, the system uses the **most restrictive action** as the final result.

### **Resolution Priority**

1. **BLOCK takes precedence over everything**
   - If ANY rule says BLOCK, the option is blocked
   - Example: Maximum price rule (BLOCK) + Advanced purchase rule (APPROVE) = **BLOCK**

2. **HIDE takes precedence over APPROVE and OUT_OF_POLICY**
   - If no BLOCK rules, but ANY rule says HIDE, the option is hidden
   - Example: Operator restriction (HIDE) + Class restriction (APPROVE) = **HIDE**

3. **APPROVE takes precedence over OUT_OF_POLICY**
   - If no BLOCK or HIDE rules, but ANY rule says APPROVE, approval is required
   - Example: Price limit (APPROVE) + Route restriction (OUT_OF_POLICY) = **APPROVE**

4. **OUT_OF_POLICY is the least restrictive**
   - Only applied if no other restrictions exist
   - Shows warning but allows booking

## Examples

### Example 1: Price + Operator Conflict
**Rules:**
- Maximum Train Price: €200 (Action: APPROVE)
- Operator Preference: Block non-preferred operators (Action: HIDE)

**Travel Option:** €150 ticket on non-preferred operator

**Resolution:** HIDE (more restrictive than APPROVE)
**Result:** Option is hidden from search results

### Example 2: Multiple Approval Rules
**Rules:**
- Advanced Purchase: 7 days minimum (Action: APPROVE)  
- Class Restriction: Business class maximum (Action: APPROVE)
- Price Limit: €300 maximum (Action: OUT_OF_POLICY)

**Travel Option:** €250 first-class ticket booked 3 days in advance

**Resolution:** APPROVE (most restrictive among the triggered rules)
**Result:** Requires approval due to advanced purchase violation

### Example 3: Complete Block
**Rules:**
- Route Restriction: Block certain routes (Action: BLOCK)
- Price Limit: €200 maximum (Action: APPROVE)

**Travel Option:** €150 ticket on blocked route

**Resolution:** BLOCK (takes precedence over all other actions)
**Result:** Option is completely blocked

## Implementation Details

### **Rule Evaluation Order**

1. **All active rules** for the organization are evaluated
2. **Each rule** determines if it applies to the travel data
3. **Failed rules** contribute their action to the evaluation
4. **Final action** is determined by the most restrictive rule that failed

### **Policy Evaluation Response Structure**

```json
{
  "result": "APPROVE",
  "action": "APPROVE", 
  "messages": [
    "Price exceeds limit by €50",
    "Advance purchase requirement not met"
  ],
  "triggered_rules": [
    {
      "rule_code": "train_max_od_price",
      "action": "APPROVE",
      "message": "Price exceeds limit by €50"
    },
    {
      "rule_code": "train_advanced_purchase", 
      "action": "OUT_OF_POLICY",
      "message": "Advance purchase requirement not met"
    }
  ],
  "final_action": "APPROVE"
}
```

### **Frontend Integration**

The frontend receives the most restrictive action and:

- **BLOCK**: Removes option from results entirely
- **HIDE**: Filters out the option (same as BLOCK for user experience)
- **APPROVE**: Shows option with approval required badge
- **OUT_OF_POLICY**: Shows option with policy warning badge

## Administrative Considerations

### **Rule Design Best Practices**

1. **Use BLOCK sparingly** - Only for absolute restrictions (safety, legal, compliance)
2. **Use HIDE for preferences** - Remove unwanted options cleanly
3. **Use APPROVE for exceptions** - Allow manager discretion for policy violations  
4. **Use OUT_OF_POLICY for guidance** - Soft warnings that don't restrict booking

### **Testing Multiple Rules**

When creating policies with multiple rules:

1. **Test edge cases** where multiple rules trigger
2. **Verify the most restrictive action is applied**
3. **Ensure messages are clear about which rules failed**
4. **Check that approval workflows work for complex scenarios**

### **Monitoring & Analytics**

Track policy evaluation metrics:

- **Rule trigger frequency** - Which rules activate most often
- **Conflict resolution patterns** - Common rule combinations
- **Approval request volume** - Impact of restrictive policies
- **User experience** - Booking completion rates

## Future Enhancements

### **Priority Weights**
Future versions could support custom priority weights for rules, allowing organizations to define which rules take precedence beyond the standard hierarchy.

### **Rule Groups**
Group related rules together with combined evaluation logic (e.g., "ALL must pass" vs "ANY can trigger").

### **Dynamic Thresholds**
Rules could have contextual thresholds based on user role, trip purpose, or other factors.

---

This conflict resolution system ensures consistent, predictable policy enforcement while maintaining the flexibility needed for complex organizational travel policies.