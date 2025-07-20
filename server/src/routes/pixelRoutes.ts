// src/routes/pixelRoutes.ts
import { prisma } from "../db/prisma";
import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      // add other user properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

const router = Router();

/*  POST /pixels/:id/color  */
router.post("/pixels/:id/color", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { color } = req.body;
  const userId = req.user?.id;

  if (!/^\d{1,2}-\d{1,2}$/.test(id)) {
    return res.status(400).json({ message: "Invalid pixel ID format." });
  }

  if (!color) return res.status(400).json({ message: "Missing color" });

  const pixel = await prisma.pixel.findUnique({ where: { id } });

  if (!pixel) {
    // Unclaimed pixel – create & assign
    await prisma.pixel.create({
      data: { id, color, ownerId: userId },
    });
    return res.json({ message: `Pixel ${id} claimed and updated.` });
  }

  if (pixel.ownerId !== userId)
    return res.status(403).json({ message: "You do not own this pixel." });

  await prisma.pixel.update({
    where: { id },
    data: { color },
  });
  res.json({ message: `Pixel ${id} color updated.` });
});

router.get("/pixels", async (_req, res) => {
  const pixels = await prisma.pixel.findMany();
  res.json(
    pixels.reduce((acc, p) => {
      acc[p.id] = { color: p.color, ownerId: p.ownerId };
      return acc;
    }, {} as Record<string, { color: string; ownerId: string | null }>)
  );
});

// Pixel grid initialization moved to a function for use elsewhere (not top-level)
export async function initializePixelGrid() {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const id = `${r}-${c}`;
      await prisma.pixel.upsert({
        where: { id },
        update: { color: "#ffffff" }, // no-op if it's already white
        create: { id, color: "#ffffff", ownerId: null },
      });
    }
  }
}

export default router;
