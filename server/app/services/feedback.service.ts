import { AppDataSource } from "../database";
import { Feedback } from "../entities/feedback.entity";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";
import { BadRequestError } from "../utils/error";
import { failed, success } from "../utils/response";
import * as workQueueServices from "../services/workqueue.service";
import { EnumWorkQueueType } from "../entities/workQueue.entity";
import { canRate } from "./product.service";

const feedbackRepo = AppDataSource.getRepository(Feedback);
const userRepo = AppDataSource.getRepository(User);
const productRepo = AppDataSource.getRepository(Product);

interface data_feedback {
  rate: number;
  comment: string;
}

export const createFeedback = async (
  product_id: number,
  user_id: number,
  rate: number,
  comment: string | null = null
) => {
  const product = await productRepo.findOneBy({ id: product_id });
  const user = await userRepo.findOneBy({ id: user_id });
  if (!product) return BadRequestError("product not found");
  if (!user) return BadRequestError("user not found");
  const can_rate = await canRate(product_id, user_id);
  if (!can_rate.can_rate || can_rate.is_done)
    return BadRequestError("you cannot rate this product");
  await workQueueServices.markAsDone(product, user, EnumWorkQueueType.RATE);
  return await feedbackRepo.save(
    feedbackRepo.create({
      rate: rate,
      comment: comment ? comment : "",
      product,
      user,
    })
  );
};

export const updateFeedback = async (
  product_id: number,
  user_id: number,
  data: data_feedback
) => {
  const can_rate = await canRate(product_id, user_id);
  if (can_rate.can_rate && can_rate.is_done) {
    const feedback = await feedbackRepo.findOneBy({
      product: {
        id: product_id,
      },
      user: {
        id: user_id,
      },
    });
    if (!feedback) return BadRequestError("feedback not found");
    if (!data.comment && !data.rate)
      return BadRequestError("rate and comment empty");
    return (await feedbackRepo.update({ id: feedback.id }, { ...data }))
      .affected
      ? success()
      : failed();
  }
  return BadRequestError("you cannot update rate for this product");
};

export const deleteFeedback = async (id: number) => {
  return (await feedbackRepo.delete({ id })).affected ? success() : failed();
};

export const getFeedbackByProduct = async (product_id: number) => {
  const product = await productRepo.findOne({
    where: {
      id: product_id,
    },
    relations: {
      feedbacks: true,
    },
  });
  if (!product) return BadRequestError("product not found");
  const feedbacks = product.feedbacks;
  return feedbacks.length
    ? {
        rate: (
          feedbacks.reduce((acc, cur) => acc + cur.rate, 0) / feedbacks.length
        ).toFixed(1),
        data: feedbacks.map((e) => {
          return {
            ...e,
          };
        }),
      }
    : BadRequestError("product has no feedback yet");
};
