import { ILike } from "typeorm";
import { AppDataSource } from "../database";
import { Brand } from "../entities/brand.entity";
import { BadRequestError } from "../utils/error";

const brandRepository = AppDataSource.getRepository(Brand);

export interface BrandInterface {
  name: string;
  description: string;
}

export const create = async (data: BrandInterface) => {
  const { name, description } = data;
  const name_exists = await brandRepository.findOneBy({ name });
  if (name_exists) return BadRequestError("name already exists");
  if (!name || !description)
    return BadRequestError("please fill all information");
  const new_brand = brandRepository.create({ name, description });
  return await brandRepository.save(new_brand);
};

export const updateOne = async (id: number, data: BrandInterface) => {
  const brand = await brandRepository.findOneBy({ id });
  if (!brand) return BadRequestError("brand not found");
  return await brandRepository.update({ id }, { ...data });
};

export const deleteOne = async (id: number) => {
  const result = await brandRepository.delete({ id });
  return result.affected ? { msg: "delete success" } : { msg: "failed" };
};

export const getAll = async (search: string | undefined = undefined) => {
  return await brandRepository.find({
    where: {
      name:
        search !== undefined && search !== "" && search !== null
          ? ILike(`%${search}%`)
          : undefined,
    },
  });
};
