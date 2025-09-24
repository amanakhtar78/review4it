import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface ICastMaster extends Document {
  castName: string;
  castType: string;
  imageUrl?: string; // Image URL for the actor/cast member
  expectedEarning: number;
  expectedPerformanceOrMovieMoney: string;
  extraInfo: string;
  status: "Active" | "Inactive";
}

const CastMasterSchema: Schema<ICastMaster> = new Schema(
  {
    castName: { type: String, required: true },
    castType: { type: String, required: true },
    imageUrl: { type: String }, // Optional image URL
    expectedEarning: { type: Number },
    expectedPerformanceOrMovieMoney: { type: String },
    extraInfo: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  {
    timestamps: { createdAt: "createdDate", updatedAt: "updatedDate" },
  }
);

const CastMaster: Model<ICastMaster> =
  models.CastMaster ||
  mongoose.model<ICastMaster>("CastMaster", CastMasterSchema, "cast");

export default CastMaster;
