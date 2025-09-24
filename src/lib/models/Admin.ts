
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string; // Hashed password
  rights: string[]; // e.g., ["ADD_MOVIE", "DELETE_MOVIE"]
  status: 'Active' | 'Inactive';
}

const AdminSchema: Schema<IAdmin> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rights: { type: [String], required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, {
  timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});

const Admin: Model<IAdmin> = models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema, 'admins');

export default Admin;
