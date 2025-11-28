import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from '../../src/orders/orders.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateOrderDto } from '../../src/orders/dto/create-order.dto';
import { UpdateOrderDto } from '../../src/orders/dto/update-order.dto';
import { PaginationDto } from '../../src/common/dto/pagination.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('deve criar um novo pedido com sucesso', async () => {
      const createOrderDto: CreateOrderDto = {};
      const expectedOrder = { id: 1, status: 'PENDING' };

      mockPrismaService.order.create.mockResolvedValueOnce(expectedOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          status: 'PENDING',
        },
        select: {
          id: true,
          status: true,
        },
      });
    });

    it('deve lançar uma exceção quando falhar ao criar um pedido', async () => {
      const createOrderDto: CreateOrderDto = {};

      mockPrismaService.order.create.mockRejectedValueOnce(
        new Error('Database error'),
      );

      try {
        await service.create(createOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Esse pedido não foi criado!');
      }
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de pedidos com paginação padrão', async () => {
      const paginationDto: PaginationDto = {};
      const expectedOrders = [
        { id: 1, status: 'PENDING' },
        { id: 2, status: 'COMPLETED' },
      ];

      mockPrismaService.order.findMany.mockResolvedValueOnce(expectedOrders);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual(expectedOrders);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: {
          created: 'desc',
        },
      });
    });

    it('deve retornar uma lista de pedidos com paginação customizada', async () => {
      const paginationDto: PaginationDto = { limit: 20, offset: 5 };
      const expectedOrders = [{ id: 3, status: 'PENDING' }];

      mockPrismaService.order.findMany.mockResolvedValueOnce(expectedOrders);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual(expectedOrders);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        take: 20,
        skip: 5,
        orderBy: {
          created: 'desc',
        },
      });
    });

    it('deve retornar uma lista vazia quando não houver pedidos', async () => {
      const paginationDto: PaginationDto = {};

      mockPrismaService.order.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findOne', () => {
    it('deve retornar um pedido por ID', async () => {
      const orderId = 1;
      const expectedOrder = { id: 1, status: 'PENDING' };

      mockPrismaService.order.findFirst.mockResolvedValueOnce(expectedOrder);

      const result = await service.findOne(orderId);

      expect(result).toEqual(expectedOrder);
      expect(mockPrismaService.order.findFirst).toHaveBeenCalledWith({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
        },
      });
    });

    it('deve lançar uma exceção quando o pedido não for encontrado', async () => {
      const orderId = 999;

      mockPrismaService.order.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne(orderId)).rejects.toThrow(HttpException);
      await expect(service.findOne(orderId)).rejects.toThrow(
        'Pedido não encontrado!',
      );
    });

    it('deve ter status NOT_FOUND quando o pedido não existir', async () => {
      const orderId = 999;

      mockPrismaService.order.findFirst.mockResolvedValueOnce(null);

      try {
        await service.findOne(orderId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('update', () => {
    it('deve atualizar um pedido com sucesso', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = { status: 'COMPLETED' };
      const existingOrder = { id: 1, status: 'PENDING' };
      const updatedOrder = { id: 1, status: 'COMPLETED' };

      mockPrismaService.order.findFirst.mockResolvedValueOnce(existingOrder);
      mockPrismaService.order.update.mockResolvedValueOnce(updatedOrder);

      const result = await service.update(orderId, updateOrderDto);

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'COMPLETED' },
        select: {
          id: true,
          status: true,
        },
      });
    });

    it('deve manter o status anterior se nenhum novo status for fornecido', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = {};
      const existingOrder = { id: 1, status: 'PENDING' };
      const updatedOrder = { id: 1, status: 'PENDING' };

      mockPrismaService.order.findFirst.mockResolvedValueOnce(existingOrder);
      mockPrismaService.order.update.mockResolvedValueOnce(updatedOrder);

      const result = await service.update(orderId, updateOrderDto);

      expect(result).toEqual(updatedOrder);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'PENDING' },
        select: {
          id: true,
          status: true,
        },
      });
    });

    it('deve lançar uma exceção quando o pedido não for encontrado', async () => {
      const orderId = 999;
      const updateOrderDto: UpdateOrderDto = { status: 'COMPLETED' };

      mockPrismaService.order.findFirst.mockResolvedValueOnce(null);

      try {
        await service.update(orderId, updateOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Não foi possível atualizar o pedido!');
      }
    });

    it('deve lançar uma exceção quando a atualização falhar', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = { status: 'COMPLETED' };
      const existingOrder = { id: 1, status: 'PENDING' };

      mockPrismaService.order.findFirst.mockResolvedValueOnce(existingOrder);
      mockPrismaService.order.update.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.update(orderId, updateOrderDto)).rejects.toThrow(
        HttpException,
      );
      await expect(service.update(orderId, updateOrderDto)).rejects.toThrow(
        'Não foi possível atualizar o pedido!',
      );
    });
  });

  describe('remove', () => {
    it('deve deletar um pedido com sucesso', async () => {
      const orderId = 1;
      const existingOrder = { id: 1, status: 'PENDING' };

      mockPrismaService.order.findFirst.mockResolvedValueOnce(existingOrder);
      mockPrismaService.order.delete.mockResolvedValueOnce(existingOrder);

      const result = await service.remove(orderId);

      expect(result).toEqual('Pedido excluido com sucesso!');
      expect(mockPrismaService.order.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar uma exceção quando o pedido não for encontrado', async () => {
      const orderId = 999;

      mockPrismaService.order.findFirst.mockResolvedValueOnce(null);

      try {
        await service.remove(orderId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Não foi possível deletar o pedido!');
      }
    });

    it('deve lançar uma exceção quando a exclusão falhar', async () => {
      const orderId = 1;
      const existingOrder = { id: 1, status: 'PENDING' };

      mockPrismaService.order.findFirst.mockResolvedValueOnce(existingOrder);
      mockPrismaService.order.delete.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.remove(orderId)).rejects.toThrow(HttpException);
      await expect(service.remove(orderId)).rejects.toThrow(
        'Não foi possível deletar o pedido!',
      );
    });
  });
});
