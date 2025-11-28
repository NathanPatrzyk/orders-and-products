import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../src/products/products.controller';
import { ProductsService } from '../../src/products/products.service';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';
import { PaginationDto } from '../../src/common/dto/pagination.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /products', () => {
    it('deve criar um novo produto', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };
      const result = {
        id: 1,
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 99.99,
        quantity: 10,
        orderId: 1,
        created: new Date(),
      };

      mockProductsService.create.mockResolvedValueOnce(result);

      const response = await controller.create(createProductDto);

      expect(response).toEqual(result);
      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
      expect(mockProductsService.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando os dados forem inválidos', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockProductsService.create.mockRejectedValueOnce(
        new Error('Esse produto não foi criado!'),
      );

      await expect(controller.create(createProductDto)).rejects.toThrow(
        'Esse produto não foi criado!',
      );
    });
  });

  describe('GET /products', () => {
    it('deve retornar todos os produtos com paginação padrão', async () => {
      const paginationDto: PaginationDto = {};
      const result = [
        {
          id: 1,
          name: 'Produto 1',
          description: 'Descrição 1',
          price: 99.99,
          quantity: 10,
          orderId: 1,
        },
        {
          id: 2,
          name: 'Produto 2',
          description: 'Descrição 2',
          price: 149.99,
          quantity: 5,
          orderId: 2,
        },
      ];

      mockProductsService.findAll.mockResolvedValueOnce(result);

      const response = await controller.findAll(paginationDto);

      expect(response).toEqual(result);
      expect(response.length).toBe(2);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('deve retornar todos os produtos com paginação customizada', async () => {
      const paginationDto: PaginationDto = { limit: 5, offset: 0 };
      const result = [
        {
          id: 1,
          name: 'Produto 1',
          description: 'Descrição 1',
          price: 99.99,
          quantity: 10,
          orderId: 1,
        },
      ];

      mockProductsService.findAll.mockResolvedValueOnce(result);

      const response = await controller.findAll(paginationDto);

      expect(response).toEqual(result);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('deve retornar lista vazia quando não houver produtos', async () => {
      const paginationDto: PaginationDto = {};

      mockProductsService.findAll.mockResolvedValueOnce([]);

      const response = await controller.findAll(paginationDto);

      expect(response).toEqual([]);
      expect(response.length).toBe(0);
    });
  });

  describe('GET /products/:id', () => {
    it('deve retornar um produto pelo ID', async () => {
      const productId = 1;
      const result = {
        id: 1,
        name: 'Produto 1',
        description: 'Descrição 1',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockProductsService.findOne.mockResolvedValueOnce(result);

      const response = await controller.findOne(productId);

      expect(response).toEqual(result);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(productId);
    });

    it('deve retornar erro quando produto não existir', async () => {
      const productId = 999;

      mockProductsService.findOne.mockRejectedValueOnce(
        new Error('Esse produto não existe!'),
      );

      await expect(controller.findOne(productId)).rejects.toThrow(
        'Esse produto não existe!',
      );
    });
  });

  describe('PATCH /products/:id', () => {
    it('deve atualizar um produto', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = {
        name: 'Produto Atualizado',
        price: 129.99,
      };
      const result = {
        id: 1,
        name: 'Produto Atualizado',
        description: 'Descrição 1',
        price: 129.99,
        quantity: 10,
        orderId: 1,
      };

      mockProductsService.update.mockResolvedValueOnce(result);

      const response = await controller.update(productId, updateProductDto);

      expect(response).toEqual(result);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
    });

    it('deve atualizar parcialmente um produto', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = { price: 129.99 };
      const result = {
        id: 1,
        name: 'Produto 1',
        description: 'Descrição 1',
        price: 129.99,
        quantity: 10,
        orderId: 1,
      };

      mockProductsService.update.mockResolvedValueOnce(result);

      const response = await controller.update(productId, updateProductDto);

      expect(response).toEqual(result);
      expect(response.price).toBe(129.99);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
    });

    it('deve lançar erro quando tentar atualizar produto inexistente', async () => {
      const productId = 999;
      const updateProductDto: UpdateProductDto = { name: 'Novo Nome' };

      mockProductsService.update.mockRejectedValueOnce(
        new Error('Esse produto não existe!'),
      );

      await expect(
        controller.update(productId, updateProductDto),
      ).rejects.toThrow('Esse produto não existe!');
    });
  });

  describe('DELETE /products/:id', () => {
    it('deve deletar um produto com sucesso', async () => {
      const productId = 1;
      const result = 'Produto excluído com sucesso!';

      mockProductsService.remove.mockResolvedValueOnce(result);

      const response = await controller.remove(productId);

      expect(response).toEqual(result);
      expect(mockProductsService.remove).toHaveBeenCalledWith(productId);
    });

    it('deve lançar erro quando tentar deletar produto inexistente', async () => {
      const productId = 999;

      mockProductsService.remove.mockRejectedValueOnce(
        new Error('Esse produto não existe!'),
      );

      await expect(controller.remove(productId)).rejects.toThrow(
        'Esse produto não existe!',
      );
    });
  });
});
