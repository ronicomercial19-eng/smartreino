/**
 * 9FIT Ecosystem Event System
 * 
 * Publishes domain events to system_events table.
 * When crossModuleEvents is enabled, dispatches to webhook endpoints.
 */
import { supabase } from "@/lib/api/client";
import { getModuleId, getEcosystemConfig } from "./config";

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

// Event-to-webhook key mapping
const EVENT_WEBHOOK_MAP: Partial<Record<DomainEvent, string>> = {
  workout_created: 'on_workout_created',
  student_enrolled: 'on_student_enrolled',
  assessment_created: 'on_assessment_created',
};

/**
 * Publish a domain event to the system_events table.
 * If crossModuleEvents is enabled, also dispatches webhooks.
 * Non-blocking — failures are logged but don't break the caller.
 */
export async function publishEvent(payload: EventPayload): Promise<void> {
  const config = getEcosystemConfig();
  const eventData = {
    domain_event: payload.event,
    ...payload.metadata,
    module_id: getModuleId(),
    module_version: config.moduleVersion,
    ecosystem_mode: config.mode,
    timestamp: new Date().toISOString(),
  };

  try {
    // Always log to system_events
    const { error } = await supabase.from('system_events').insert([{
      event_type: 'created' as const,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      target_id: payload.targetId || null,
      metadata: eventData,
    }]);

    if (error) {
      console.warn(`[9FIT Events] Failed to publish ${payload.event}:`, error.message);
    }

    // Dispatch webhook if in connected mode
    if (config.features.crossModuleEvents) {
      dispatchWebhook(payload, eventData);
    }
  } catch (err) {
    console.warn(`[9FIT Events] Unexpected error publishing ${payload.event}:`, err);
  }
}

/** Dispatch to registered webhook endpoint (non-blocking, fire-and-forget) */
async function dispatchWebhook(
  payload: EventPayload,
  eventData: Record<string, any>
): Promise<void> {
  const webhookKey = EVENT_WEBHOOK_MAP[payload.event];
  if (!webhookKey) return;

  try {
    const { data } = await (supabase as any)
      .from('ecosystem_config')
      .select('config_value')
      .eq('module_id', 'smartreino')
      .eq('config_key', 'webhook_endpoints')
      .single();

    const webhookUrl = data?.config_value?.[webhookKey];
    if (!webhookUrl) return;

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-9FIT-Module': getModuleId(),
        'X-9FIT-Event': payload.event,
      },
      body: JSON.stringify({
        event: payload.event,
        module: getModuleId(),
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        data: eventData,
      }),
    }).catch((err) => {
      console.warn(`[9FIT Webhook] Failed to dispatch ${payload.event}:`, err);
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Subscribe to events from other modules (future use).
 * Returns an unsubscribe function.
 */
export function subscribeToEvents(
  callback: (event: EventPayload) => void
): () => void {
  const channel = supabase
    .channel('ecosystem-events')
    .on(
      'postgres_changes' as any,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'system_events',
      },
      (payload: any) => {
        const row = payload.new;
        if (row?.metadata?.module_id && row.metadata.module_id !== getModuleId()) {
          callback({
            event: row.metadata.domain_event,
            entityType: row.entity_type,
            entityId: row.entity_id,
            targetId: row.target_id,
            metadata: row.metadata,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
