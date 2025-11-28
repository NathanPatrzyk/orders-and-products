import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = await this.prismaService.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          quantity: createProductDto.quantity,
          orderId: createProductDto.orderId,
        },
      });

      return newProduct;
    } catch (e) {
      throw new HttpException(
        'Esse produto não foi criado!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const allTasks = await this.prismaService.product.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        created: 'desc',
      },
    });
    return allTasks;
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findFirst({
      where: {
        id: id,
      },
    });

    if (product?.name) return product;

    throw new HttpException('Esse produto não existe!', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const findProduct = await this.prismaService.product.findFirst({
        where: {
          id: id,
        },
      });

      if (!findProduct)
        throw new HttpException(
          'Esse produto não existe!',
          HttpStatus.NOT_FOUND,
        );

      const product = await this.prismaService.product.update({
        where: {
          id: findProduct.id,
        },
        data: {
          name: updateProductDto.name
            ? updateProductDto.name
            : findProduct.name,
          description: updateProductDto.description
            ? updateProductDto.description
            : findProduct.description,
          price: updateProductDto.price
            ? updateProductDto.price
            : findProduct.price,
          quantity: updateProductDto.quantity
            ? updateProductDto.quantity
            : findProduct.quantity,
        },
      });

      return product;
    } catch (e) {
      throw new HttpException(
        'Não foi possível atualizar o produto!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number) {
    try {
      const findProduct = await this.prismaService.product.findFirst({
        where: {
          id: id,
        },
      });

      if (!findProduct)
        throw new HttpException(
          'Esse produto não existe!',
          HttpStatus.NOT_FOUND,
        );

      await this.prismaService.product.delete({
        where: {
          id: findProduct.id,
        },
      });

      return 'Produto excluído com sucesso!';
    } catch (e) {
      throw new HttpException(
        'Não foi possível deletar o produto!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
