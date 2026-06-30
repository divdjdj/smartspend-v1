import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceItem {
  service_name: string;
  amount: number;
  quantity?: number;
}

export interface IInvoice extends Document {
  client_id: mongoose.Types.ObjectId;
  invoice_number: string;
  items: IInvoiceItem[];
  amount: number; // Total / net amount of the invoice
  discount_applied?: number;
  tax_amount?: number;
  purchase_date: Date;
  status: 'pending' | 'paid' | 'cancelled';
  referrer_id?: mongoose.Types.ObjectId; // The referral partner who referred this client
  commission_amount?: number;
  commission_calculated: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  invoice_number: { type: String, unique: true, required: true, index: true },
  items: [{
    service_name: { type: String, required: true },
    amount: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
  }],
  amount: { type: Number, required: true },
  discount_applied: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  purchase_date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'paid' },
  referrer_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  commission_amount: { type: Number, default: 0 },
  commission_calculated: { type: Boolean, default: false }
}, {
  timestamps: true
});

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Invoice;
}

const Invoice = mongoose.models.Invoice as Model<IInvoice> || 
  mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
