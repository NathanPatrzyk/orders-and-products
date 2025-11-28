import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/orders/orders.controller';
import { OrdersService } from '../../src/orders/orders.service';
import { CreateOrderDto } from '../../src/orders/dto/create-order.dto';
import { UpdateOrderDto } from '../../src/orders/dto/update-order.dto';
import { PaginationDto } from '../../src/common/dto/pagination.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /orders', () => {
    it('deve criar um novo pedido', async () => {
      const createOrderDto: CreateOrderDto = {};
      const result = { id: 1, status: 'PENDING' };

      mockOrdersService.create.mockResolvedValueOnce(result);

      const response = await controller.create(createOrderDto);

      expect(response).toEqual(result);
      expect(mockOrdersService.create).toHaveBeenCalledWith(createOrderDto);
      expect(mockOrdersService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /orders', () => {
    it('deve retornar todos os pedidos com paginação padrão', async () => {
      const paginationDto: PaginationDto = {};
      const result = [
        { id: 1, status: 'PENDING' },
        { id: 2, status: 'COMPLETED' },
      ];

      mockOrdersService.findAll.mockResolvedValueOnce(result);

      const response = await controller.findAll(paginationDto);

      expect(response).toEqual(result);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('deve retornar todos os pedidos com paginação customizada', async () => {
      const paginationDto: PaginationDto = { limit: 5, offset: 0 };
      const result = [{ id: 1, status: 'PENDING' }];

      mockOrdersService.findAll.mockResolvedValueOnce(result);

      const response = await controller.findAll(paginationDto);

      expect(response).toEqual(result);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('GET /orders/:id', () => {
    it('deve retornar um pedido pelo ID', async () => {
      const orderId = 1;
      const result = { id: 1, status: 'PENDING' };

      mockOrdersService.findOne.mockResolvedValueOnce(result);

      const response = await controller.findOne(orderId);

      expect(response).toEqual(result);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
    });

    it('deve retornar erro quando pedido não existir', async () => {
      const orderId = 999;

      mockOrdersService.findOne.mockRejectedValueOnce(
        new Error('Pedido não encontrado!'),
      );

      await expect(controller.findOne(orderId)).rejects.toThrow(
        'Pedido não encontrado!',
      );
    });
  });

  describe('PATCH /orders/:id', () => {
    it('deve atualizar um pedido', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = { status: 'COMPLETED' };
      const result = { id: 1, status: 'COMPLETED' };

      mockOrdersService.update.mockResolvedValueOnce(result);

      const response = await controller.update(orderId, updateOrderDto);

      expect(response).toEqual(result);
      expect(mockOrdersService.update).toHaveBeenCalledWith(
        orderId,
        updateOrderDto,
      );
    });

    it('deve lançar erro quando tentar atualizar pedido inexistente', async () => {
      const orderId = 999;
      const updateOrderDto: UpdateOrderDto = { status: 'COMPLETED' };

      mockOrdersService.update.mockRejectedValueOnce(
        new Error('Pedido não existe!'),
      );

      await expect(controller.update(orderId, updateOrderDto)).rejects.toThrow(
        'Pedido não existe!',
      );
    });
  });

  describe('DELETE /orders/:id', () => {
    it('deve deletar um pedido com sucesso', async () => {
      const orderId = 1;
      const result = 'Pedido excluido com sucesso!';

      mockOrdersService.remove.mockResolvedValueOnce(result);

      const response = await controller.remove(orderId);

      expect(response).toEqual(result);
      expect(mockOrdersService.remove).toHaveBeenCalledWith(orderId);
    });

    it('deve lançar erro quando tentar deletar pedido inexistente', async () => {
      const orderId = 999;

      mockOrdersService.remove.mockRejectedValueOnce(
        new Error('Pedido não existe!'),
      );

      await expect(controller.remove(orderId)).rejects.toThrow(
        'Pedido não existe!',
      );
    });
  });
});
