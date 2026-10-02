import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  isActive: boolean;
  formUrl: string;
  title: string;
  eventTag: string;
  admitText: string;
  serialNumber: string;
  priceText?: string;
  updatedAt: Date;
}

export const DEFAULT_TICKET_CONFIG = {
  isActive: false,
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdcv5fu5yBDvrEZBXQkN8tYrRpPbxZ1qI5OE7fGZT-4LI2VLw/viewform?usp=header",
  title: "BUY TICKETS",
  eventTag: "HBC 2026",
  admitText: "ADMIT ONE",
  serialNumber: "№ 270926",
  priceText: "",
};

const TicketSchema: Schema = new Schema(
  {
    isActive: { type: Boolean, default: false },
    formUrl: { 
      type: String, 
      default: DEFAULT_TICKET_CONFIG.formUrl 
    },
    title: { type: String, default: DEFAULT_TICKET_CONFIG.title },
    eventTag: { type: String, default: DEFAULT_TICKET_CONFIG.eventTag },
    admitText: { type: String, default: DEFAULT_TICKET_CONFIG.admitText },
    serialNumber: { type: String, default: DEFAULT_TICKET_CONFIG.serialNumber },
    priceText: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
