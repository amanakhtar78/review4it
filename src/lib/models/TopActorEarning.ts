
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ITopActorEarning extends Document {
  movieId: mongoose.Types.ObjectId;
  actorId: string;
  payment: number;
  status: 'Active' | 'Inactive';
}

const TopActorEarningSchema: Schema<ITopActorEarning> = new Schema({
  movieId: { type: Schema.Types.ObjectId, required: true, ref: 'MovieSeries' },
  actorId: { type: String, required: true },
  payment: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, {
  timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});

const TopActorEarning: Model<ITopActorEarning> = models.TopActorEarning || mongoose.model<ITopActorEarning>('TopActorEarning', TopActorEarningSchema, 'topActorsEarnings');

export default TopActorEarning;
