import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'O nome precisa ser um texto!' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio!' })
  @MinLength(5, { message: 'O nome precisa ter pelo menos 5 caracteres!' })
  @MaxLength(40, { message: 'O nome precisa ter no máximo 40 caracteres!' })
  readonly name: string;

  @IsString({ message: 'O nome precisa ser um texto!' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio!' })
  @MinLength(5, { message: 'O nome precisa ter pelo menos 5 caracteres!' })
  @MaxLength(200, { message: 'O nome precisa ter no máximo 200 caracteres!' })
  readonly description: string;

  @IsNumber({}, { message: 'O preço precisa ser um numero!' })
  @IsNotEmpty({ message: 'O preço não pode ser vazio!' })
  readonly price: number;

  @IsNumber({}, { message: 'A quantidade precisa ser um numero!' })
  @IsNotEmpty({ message: 'A quantidade não pode ser vazio!' })
  readonly quantity: number;

  @IsNumber({}, { message: 'O id do pedido precisa ser um numero!' })
  @IsNotEmpty({ message: 'O id do pedido não pode ser vazio!' })
  readonly orderId: number;
}
