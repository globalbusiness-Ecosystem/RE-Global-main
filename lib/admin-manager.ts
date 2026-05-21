'use client';

import { useState, useCallback } from 'react';

export interface AdminStats {
  totalProperties: number;
  totalUsers: number;
  totalRevenue: number;
  pendingListings: number;
  totalTransactions: number;
  averageRating: number;
}

export interface AdminAction {
  id: string;
  type: 'approve' | 'reject' | 'suspend' | 'report';
  targetId: string;
  timestamp: number;
  reason?: string;
  performedBy: string;
}

export class AdminManager {
  private stats: AdminStats = {
    totalProperties: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingListings: 0,
    totalTransactions: 0,
    averageRating: 0,
  };

  private actions: AdminAction[] = [];
  private suspendedUsers: Set<string> = new Set();
  private approvedListings: Set<string> = new Set();
  private reports: Map<string, { reason: string; count: number }> = new Map();

  getStats(): AdminStats {
    return this.stats;
  }

  updateStats(partial: Partial<AdminStats>): void {
    this.stats = { ...this.stats, ...partial };
  }

  approveProperty(propertyId: string, adminId: string): AdminAction {
    const action: AdminAction = {
      id: Math.random().toString(36).slice(7),
      type: 'approve',
      targetId: propertyId,
      timestamp: Date.now(),
      performedBy: adminId,
    };
    this.actions.push(action);
    this.approvedListings.add(propertyId);
    this.stats.totalProperties++;
    return action;
  }

  rejectProperty(propertyId: string, adminId: string, reason: string): AdminAction {
    const action: AdminAction = {
      id: Math.random().toString(36).slice(7),
      type: 'reject',
      targetId: propertyId,
      timestamp: Date.now(),
      reason,
      performedBy: adminId,
    };
    this.actions.push(action);
    return action;
  }

  suspendUser(userId: string, adminId: string, reason: string): AdminAction {
    const action: AdminAction = {
      id: Math.random().toString(36).slice(7),
      type: 'suspend',
      targetId: userId,
      timestamp: Date.now(),
      reason,
      performedBy: adminId,
    };
    this.actions.push(action);
    this.suspendedUsers.add(userId);
    return action;
  }

  unsuspendUser(userId: string): void {
    this.suspendedUsers.delete(userId);
  }

  reportContent(contentId: string, reason: string): void {
    const current = this.reports.get(contentId) || { reason, count: 0 };
    current.count++;
    this.reports.set(contentId, current);
  }

  getReports(): Map<string, { reason: string; count: number }> {
    return this.reports;
  }

  getActionHistory(limit: number = 50): AdminAction[] {
    return this.actions.slice(-limit).reverse();
  }

  isSuspended(userId: string): boolean {
    return this.suspendedUsers.has(userId);
  }
}

export function useAdminPanel(adminId: string) {
  const manager = new AdminManager();
  const [stats, setStats] = useState(manager.getStats());

  const approveProperty = useCallback((propertyId: string) => {
    const action = manager.approveProperty(propertyId, adminId);
    setStats(manager.getStats());
    return action;
  }, [manager, adminId]);

  const rejectProperty = useCallback((propertyId: string, reason: string) => {
    const action = manager.rejectProperty(propertyId, adminId, reason);
    setStats(manager.getStats());
    return action;
  }, [manager, adminId]);

  const suspendUser = useCallback((userId: string, reason: string) => {
    const action = manager.suspendUser(userId, adminId, reason);
    setStats(manager.getStats());
    return action;
  }, [manager, adminId]);

  const reportContent = useCallback((contentId: string, reason: string) => {
    manager.reportContent(contentId, reason);
    return true;
  }, [manager]);

  const getReports = useCallback(() => {
    return manager.getReports();
  }, [manager]);

  return {
    stats,
    approveProperty,
    rejectProperty,
    suspendUser,
    reportContent,
    getReports,
    manager,
  };
}
