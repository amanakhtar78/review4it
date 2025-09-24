
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IEarningByCountry extends Document {
  movieId: mongoose.Types.ObjectId;
  countryId: string;
  payment: number;
  status: 'Active' | 'Inactive';
}

const EarningByCountrySchema: Schema<IEarningByCountry> = new Schema({
  movieId: { type: Schema.Types.ObjectId, required: true, ref: 'MovieSeries' },
  countryId: { type: String, required: true },
  payment: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, {
  timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' }
});

const EarningByCountry: Model<IEarningByCountry> = models.EarningByCountry || mongoose.model<IEarningByCountry>('EarningByCountry', EarningByCountrySchema, 'earningsByCountry');

export default EarningByCountry;
