/**
 * 9FIT Domain Service: System
 * 
 * Unified service for notifications, audit logs, and system config.
 */
import { supabase } from "@/lib/api/client";

export const systemService = {
  /** Get notifications for current user */
  async getNotifications(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /** Mark notification as read */
  async markNotificationRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /** Log an audit event */
  async logAudit(action: string, resourceType: string, resourceId: string) {
    try {
      await supabase.rpc('log_audit', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
      });
    } catch (err) {
      console.warn('[systemService] Audit log failed:', err);
    }
  },
};
