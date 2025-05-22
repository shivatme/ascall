import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();
interface TokenRequestBody {
  userId: string;
  token: string;
}

// POST /api/notification/token - store or update token
router.post("/token", async (req: any, res: any): Promise<any> => {
  const { userId: phone, token }: TokenRequestBody = req.body;

  if (!phone || !token) {
    return res.status(400).json({ error: "Missing userId or token" });
  }

  const user = await prisma.user.findUnique({
    where: { phone: `+91${phone}` },
  });
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }
  try {
    const existing = await prisma.fcmToken.findUnique({
      where: { token },
    });

    if (existing) {
      // Already stored — update user ID if necessary
      await prisma.fcmToken.update({
        where: { token },
        data: { userId: user.id },
      });
    } else {
      await prisma.fcmToken.create({
        data: { userId: user.id, token },
      });
    }
    console.log(user.id, "success");
    return res.json({ success: true });
  } catch (err) {
    console.error("🔴 Error saving FCM token:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
