import app from "./app";
import prisma from "./db";
import bcrypt from "bcrypt";

(async () => {
  let admins = await prisma.user.count({
    where: {
      role: "ADMIN",
    },
  });
  if (admins === 0) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: process.env.ADMIN_EMAIL!,
        hash: hash,
        role: "ADMIN",
      },
    });
  }
})()
  .then(() => {
    app.listen(4000, () => console.log("Server is running at: " + 4000));
  })
  .catch((err) => {
    console.error(err);
  });
