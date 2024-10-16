import { Schema, model, models } from "mongoose";

const MsProjectSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    objectKey: {
      type: String,
    },
    downloadUrl: {
      type: String,
    },
    transcription: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const MsProject = models?.MagicsubsProject || model("MagicsubsProject", MsProjectSchema);

export default MsProject;
