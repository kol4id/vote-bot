import mongoose, {Schema, Document} from "mongoose";

interface IVote extends Document {
    chatId: number;
    vote?: number;
    canVote?: boolean;
    curentlyLoad?: boolean;
    progress: number;
    createdAt?: Date;
    updateAt?: Date;
}

const VoteSchema: Schema = new Schema({
    chatId: {type: Number, required: true},
    vote: {type: Number, required: false},
    canVote: {type: Boolean, required: false},
    curentlyLoad: {type: Boolean, required: false},
    progress: {type: Number, required: false}
}, {
    timestamps: true
})

const Vote = mongoose.model<IVote>('Vote', VoteSchema);
export default Vote;