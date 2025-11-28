import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const newOrder = await this.prismaService.order.create({
        data: {
          status: 'PENDING',
        },
        select: {
          id: true,
          status: true,
        },
      });

      return newOrder;
    } catch (e) {
      throw new HttpException(
        'Esse pedido não foi criado!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const allOrders = await this.prismaService.order.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        created: 'desc',
      },
    });
    return allOrders;
  }

  async findOne(id: number) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (order) return order;

    throw new HttpException('Pedido não encontrado!', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.prismaService.order.findFirst({
        where: {
          id: id,
        },
      });

      if (!order)
        throw new HttpException(
          'Esse pedido não existe!',
          HttpStatus.NOT_FOUND,
        );

      const dataOrder: { status?: string } = {
        status: updateOrderDto.status ? updateOrderDto.status : order.status,
      };

      const updateOrder = await this.prismaService.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: dataOrder.status,
        },
        select: {
          id: true,
          status: true,
        },
      });

      return updateOrder;
    } catch (e) {
      throw new HttpException(
        'Não foi possível atualizar o pedido!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number) {
    try {
      const findOrder = await this.prismaService.order.findFirst({
        where: {
          id: id,
        },
      });

      if (!findOrder)
        throw new HttpException(
          'Esse usuário não existe',
          HttpStatus.NOT_FOUND,
        );

      await this.prismaService.order.delete({
        where: {
          id: findOrder.id,
        },
      });

      return 'Pedido excluido com sucesso!';
    } catch (e) {
      throw new HttpException(
        'Não foi possível deletar o pedido!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
