import {Router} from "express";

import {adminController} from "../controllers/admin.controller";
import {ERole} from "../enums/role.enum";
import {authMiddleware} from "../middlewares/auth.middleware";
import {userMiddleware} from "../middlewares/user.middleware";

const router = Router();

router.get(
  "/list",
  authMiddleware.checkAccessToken(ERole.ADMIN),
  userMiddleware.haveAccessByRole(ERole.ADMIN),
  adminController.getAdmins,
);

export const adminRouter = router;
