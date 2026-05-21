// WhatsApp Integration Manager for RE Platform

import { toast } from 'sonner';

export interface WhatsAppMessage {
  id: string;
  phoneNumber: string;
  message: string;
  type: 'inquiry' | 'support' | 'booking' | 'document';
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}

export interface WhatsAppContact {
  name: string;
  phoneNumber: string;
  lastMessage?: Date;
  messageCount: number;
}

class WhatsAppManager {
  private readonly BUSINESS_PHONE = '+201010810558';
  private readonly WHATSAPP_API_ENDPOINT = 'https://api.whatsapp.com/send';
  private messages: Map<string, WhatsAppMessage[]> = new Map();
  private contacts: Map<string, WhatsAppContact> = new Map();

  // Send message via WhatsApp
  async sendMessage(
    phoneNumber: string,
    message: string,
    type: WhatsAppMessage['type'] = 'inquiry'
  ): Promise<boolean> {
    try {
      console.log('[WhatsApp] Sending message to', phoneNumber);

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        throw new Error('Invalid phone number');
      }

      // Create message object
      const msg: WhatsAppMessage = {
        id: `msg_${Date.now()}`,
        phoneNumber: formattedPhone,
        message,
        type,
        status: 'sent',
        timestamp: new Date(),
      };

      // Store message
      if (!this.messages.has(formattedPhone)) {
        this.messages.set(formattedPhone, []);
      }
      this.messages.get(formattedPhone)!.push(msg);

      // Update contact
      this.updateContact(formattedPhone, message);

      // Open WhatsApp Web
      this.openWhatsAppWeb(formattedPhone, message);

      console.log('[WhatsApp] Message sent:', msg);
      toast.success('Opening WhatsApp...');
      return true;
    } catch (error) {
      console.error('[WhatsApp] Send error:', error);
      toast.error('Failed to send WhatsApp message');
      return false;
    }
  }

  // Send inquiry message
  async sendInquiry(
    phoneNumber: string,
    propertyId: string,
    propertyTitle: string,
    userName: string
  ): Promise<boolean> {
    const message = `Salam, I'm interested in the property: ${propertyTitle} (ID: ${propertyId}). This is ${userName}. Please provide more details. Shukran!`;
    return this.sendMessage(phoneNumber, message, 'inquiry');
  }

  // Send booking request
  async sendBookingRequest(
    phoneNumber: string,
    propertyId: string,
    checkInDate: string,
    duration: number,
    userName: string
  ): Promise<boolean> {
    const message = `Hello! I would like to book the property (ID: ${propertyId}) for ${duration} nights starting from ${checkInDate}. User: ${userName}. Please confirm availability.`;
    return this.sendMessage(phoneNumber, message, 'booking');
  }

  // Send support request
  async sendSupportRequest(
    phoneNumber: string,
    issue: string,
    userName: string
  ): Promise<boolean> {
    const message = `Hi! I need support regarding: ${issue}. User: ${userName}. Thank you!`;
    return this.sendMessage(phoneNumber, message, 'support');
  }

  // Send investment proposal
  async sendInvestmentProposal(
    phoneNumber: string,
    amount: number,
    propertyId: string,
    userName: string
  ): Promise<boolean> {
    const message = `Salam! I'm interested in investing ${amount} π in property ID: ${propertyId}. User: ${userName}. Please send me the investment details. Jazakallah!`;
    return this.sendMessage(phoneNumber, message, 'document');
  }

  // Open WhatsApp Web
  private openWhatsAppWeb(phoneNumber: string, message: string): void {
    try {
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `${this.WHATSAPP_API_ENDPOINT}?phone=${phoneNumber}&text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank', 'width=600,height=700');
      console.log('[WhatsApp] Opened WhatsApp Web URL');
    } catch (error) {
      console.error('[WhatsApp] URL open error:', error);
    }
  }

  // Format phone number
  private formatPhoneNumber(phone: string): string | null {
    try {
      const cleaned = phone.replace(/[^\d+]/g, '');
      if (cleaned.length < 10) return null;
      return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    } catch {
      return null;
    }
  }

  // Update contact
  private updateContact(phoneNumber: string, message: string): void {
    const contact = this.contacts.get(phoneNumber) || {
      name: phoneNumber,
      phoneNumber,
      messageCount: 0,
    };

    contact.messageCount++;
    contact.lastMessage = new Date();
    this.contacts.set(phoneNumber, contact);
  }

  // Get message history
  getMessageHistory(phoneNumber: string): WhatsAppMessage[] {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!formattedPhone) return [];
    return this.messages.get(formattedPhone) || [];
  }

  // Get contacts
  getContacts(): WhatsAppContact[] {
    return Array.from(this.contacts.values());
  }

  // Get business contact
  getBusinessContact(): string {
    return this.BUSINESS_PHONE;
  }

  // Direct message to RE Platform support
  async contactSupport(message: string, userName: string): Promise<boolean> {
    const fullMessage = `RE Platform Support Request\nUser: ${userName}\nMessage: ${message}`;
    return this.sendMessage(this.BUSINESS_PHONE, fullMessage, 'support');
  }

  // Create WhatsApp link
  createWhatsAppLink(phoneNumber: string, message?: string): string {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!formattedPhone) return '';

    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `${this.WHATSAPP_API_ENDPOINT}?phone=${formattedPhone}&text=${encodedMessage}`;
  }

  // Get message count
  getMessageCount(phoneNumber: string): number {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!formattedPhone) return 0;
    return this.messages.get(formattedPhone)?.length || 0;
  }

  // Clear history
  clearHistory(): void {
    this.messages.clear();
    this.contacts.clear();
    console.log('[WhatsApp] Message history cleared');
  }

  // Get last message
  getLastMessage(phoneNumber: string): WhatsAppMessage | null {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!formattedPhone) return null;

    const msgs = this.messages.get(formattedPhone);
    return msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;
  }
}

export const whatsappManager = new WhatsAppManager();

// Hook for React
export function useWhatsApp() {
  return {
    sendMessage: (phone: string, message: string, type?: WhatsAppMessage['type']) =>
      whatsappManager.sendMessage(phone, message, type),
    sendInquiry: (phone: string, propertyId: string, title: string, name: string) =>
      whatsappManager.sendInquiry(phone, propertyId, title, name),
    sendBookingRequest: (phone: string, propertyId: string, date: string, duration: number, name: string) =>
      whatsappManager.sendBookingRequest(phone, propertyId, date, duration, name),
    sendSupportRequest: (phone: string, issue: string, name: string) =>
      whatsappManager.sendSupportRequest(phone, issue, name),
    contactSupport: (message: string, name: string) =>
      whatsappManager.contactSupport(message, name),
    createLink: (phone: string, message?: string) =>
      whatsappManager.createWhatsAppLink(phone, message),
    getBusinessContact: () => whatsappManager.getBusinessContact(),
    getMessageHistory: (phone: string) =>
      whatsappManager.getMessageHistory(phone),
    getContacts: () => whatsappManager.getContacts(),
  };
}
