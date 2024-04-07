import { CronJob } from "cron";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { ApiError } from "../errors/api.error";
import { tokenRepository } from "../repositories/token.repository";

dayjs.extend(utc);

const removeOldTokens = async function () {
  try {
    const previousMonth = dayjs().utc().subtract(30, "d");

    await tokenRepository.deleteManyByParams({
      createdAt: { $lte: previousMonth },
    });
  } catch (e) {
    throw new ApiError(e.meesage, e.status);
  }
};

export const tokensRemover = new CronJob("* * * * * *", removeOldTokens);

// lte - less that equal
// gte - greater that equal
// lt - less than
// gt - greater than
