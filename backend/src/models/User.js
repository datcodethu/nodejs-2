import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: null
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        active: {
            type: Boolean,
            default: true,
        },

        // NEW: Giới hạn dung lượng cho user (đơn vị byte)
        maxStorage: {
            type: Number,
            default: 5 * (1024 * 1024 * 1024), // 5GB mặc định
        },

        // NEW: tổng dung lượng user đang sử dụng
        usedStorage: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: { createdAt: "create_at", updatedAt: "update_at" } }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        try {
            this.password = await argon2.hash(this.password);
            next();
        } catch (error) {
            return next(error);
        }
    } else {
        next();
    }
});

userSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (update.password) {
        try {
            update.password = await argon2.hash(update.password);
            this.setUpdate(update);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return argon2.verify(this.password, candidatePassword);
};

export default mongoose.model("User", userSchema);
