/**
 * 9FIT Ecosystem Event System
 * 
 * Publishes domain events to system_events table.
 * Prepared for future webhook dispatch and cross-module communication.
 */
import { supabase } from "@/lib/api/client";
import { getModuleId } from "./config";

export type DomainEvent =
  | 'workout_created'
  | 'workout_modified'
  | 'workout_completed'
  | 'student_enrolled'
  | 'student_updated'
  | 'assessment_created'
  | 'plan_generated'
  | 'recommendation_generated';

export interface EventPayload {
  event: DomainEvent;
  entityType: string;
  entityId: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

/**
 * Publish a domain event to the system_events table.
 * Non-blocking — failures are logged but don't break the caller.
 */
export async function publishEvent(payload: EventPayload): Promise<void> {
  try {
    const { error } = await supabase.from('system_events').insert([{
      event_type: 'created' as const,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      target_id: payload.targetId || null,
      metadata: {
        domain_event: payload.event,
        ...payload.metadata,
        module_id: getModuleId(),
        timestamp: new Date().toISOString(),
      },
    }]);

    if (error) {
      console.warn(`[9FIT Events] Failed to publish ${payload.event}:`, error.message);
    }
  } catch (err) {
    console.warn(`[9FIT Events] Unexpected error publishing ${payload.event}:`, err);
  }
}
