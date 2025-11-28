import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductsService } from '../../src/products/products.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { UpdateProductDto } from '../../src/products/dto/update-product.dto';
import { PaginationDto } from '../../src/common/dto/pagination.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
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
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('deve criar um novo produto com sucesso', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };
      const expectedProduct = {
        id: 1,
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 99.99,
        quantity: 10,
        orderId: 1,
        created: new Date(),
      };

      mockPrismaService.product.create.mockResolvedValueOnce(expectedProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          quantity: createProductDto.quantity,
          orderId: createProductDto.orderId,
        },
      });
    });

    it('deve lançar uma exceção quando falhar ao criar um produto', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockPrismaService.product.create.mockRejectedValueOnce(
        new Error('Database error'),
      );

      try {
        await service.create(createProductDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Esse produto não foi criado!');
      }
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de produtos com paginação padrão', async () => {
      const paginationDto: PaginationDto = {};
      const expectedProducts = [
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

      mockPrismaService.product.findMany.mockResolvedValueOnce(
        expectedProducts,
      );

      const result = await service.findAll(paginationDto);

      expect(result).toEqual(expectedProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: {
          created: 'desc',
        },
      });
    });

    it('deve retornar uma lista de produtos com paginação customizada', async () => {
      const paginationDto: PaginationDto = { limit: 20, offset: 5 };
      const expectedProducts = [
        {
          id: 3,
          name: 'Produto 3',
          description: 'Descrição 3',
          price: 199.99,
          quantity: 15,
          orderId: 1,
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValueOnce(
        expectedProducts,
      );

      const result = await service.findAll(paginationDto);

      expect(result).toEqual(expectedProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        take: 20,
        skip: 5,
        orderBy: {
          created: 'desc',
        },
      });
    });

    it('deve retornar uma lista vazia quando não houver produtos', async () => {
      const paginationDto: PaginationDto = {};

      mockPrismaService.product.findMany.mockResolvedValueOnce([]);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findOne', () => {
    it('deve retornar um produto por ID', async () => {
      const productId = 1;
      const expectedProduct = {
        id: 1,
        name: 'Produto 1',
        description: 'Descrição 1',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockPrismaService.product.findFirst.mockResolvedValueOnce(
        expectedProduct,
      );

      const result = await service.findOne(productId);

      expect(result).toEqual(expectedProduct);
      expect(mockPrismaService.product.findFirst).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('deve lançar uma exceção quando o produto não for encontrado', async () => {
      const productId = 999;

      mockPrismaService.product.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne(productId)).rejects.toThrow(HttpException);
      await expect(service.findOne(productId)).rejects.toThrow(
        'Esse produto não existe!',
      );
    });

    it('deve ter status NOT_FOUND quando o produto não existir', async () => {
      const productId = 999;

      mockPrismaService.product.findFirst.mockResolvedValueOnce(null);

      try {
        await service.findOne(productId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('update', () => {
    it('deve atualizar um produto com sucesso', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = {
        name: 'Produto Atualizado',
        price: 129.99,
      };
      const existingProduct = {
        id: 1,
        name: 'Produto Original',
        description: 'Descrição Original',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };
      const updatedProduct = {
        id: 1,
        name: 'Produto Atualizado',
        description: 'Descrição Original',
        price: 129.99,
        quantity: 10,
        orderId: 1,
      };

      mockPrismaService.product.findFirst.mockResolvedValueOnce(
        existingProduct,
      );
      mockPrismaService.product.update.mockResolvedValueOnce(updatedProduct);

      const result = await service.update(productId, updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Produto Atualizado',
          description: 'Descrição Original',
          price: 129.99,
          quantity: 10,
        },
      });
    });

    it('deve manter dados anteriores se nenhuma atualização for fornecida', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = {};
      const existingProduct = {
        id: 1,
        name: 'Produto Original',
        description: 'Descrição Original',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockPrismaService.product.findFirst.mockResolvedValueOnce(
        existingProduct,
      );
      mockPrismaService.product.update.mockResolvedValueOnce(existingProduct);

      const result = await service.update(productId, updateProductDto);

      expect(result).toEqual(existingProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Produto Original',
          description: 'Descrição Original',
          price: 99.99,
          quantity: 10,
        },
      });
    });

    it('deve lançar uma exceção quando o produto não for encontrado', async () => {
      const productId = 999;
      const updateProductDto: UpdateProductDto = { name: 'Novo Nome' };

      mockPrismaService.product.findFirst.mockResolvedValueOnce(null);

      try {
        await service.update(productId, updateProductDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Não foi possível atualizar o produto!');
      }
    });

    it('deve lançar uma exceção quando a atualização falhar', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = { name: 'Novo Nome' };
      const existingProduct = {
        id: 1,
        name: 'Produto Original',
        description: 'Descrição Original',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockPrismaService.product.findFirst.mockResolvedValueOnce(
        existingProduct,
      );
      mockPrismaService.product.update.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        HttpException,
      );
      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        'Não foi possível atualizar o produto!',
      );
    });
  });

  describe('remove', () => {
    it('deve deletar um produto com sucesso', async () => {
      const productId = 1;
      const existingProduct = {
        id: 1,
        name: 'Produto 1',
        description: 'Descrição 1',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockPrismaService.product.findFirst.mockResolvedValueOnce(
        existingProduct,
      );
      mockPrismaService.product.delete.mockResolvedValueOnce(existingProduct);

      const result = await service.remove(productId);

      expect(result).toEqual('Produto excluído com sucesso!');
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar uma exceção quando o produto não for encontrado', async () => {
      const productId = 999;

      mockPrismaService.product.findFirst.mockResolvedValueOnce(null);

      try {
        await service.remove(productId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Não foi possível deletar o produto!');
      }
    });

    it('deve lançar uma exceção quando a exclusão falhar', async () => {
      const productId = 1;
      const existingProduct = {
        id: 1,
        name: 'Produto 1',
        description: 'Descrição 1',
        price: 99.99,
        quantity: 10,
        orderId: 1,
      };

      mockPrismaService.product.findFirst.mockResolvedValueOnce(
        existingProduct,
      );
      mockPrismaService.product.delete.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.remove(productId)).rejects.toThrow(HttpException);
      await expect(service.remove(productId)).rejects.toThrow(
        'Não foi possível deletar o produto!',
      );
    });
  });
});
