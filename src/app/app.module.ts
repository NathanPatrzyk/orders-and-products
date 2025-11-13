import { Module } from '@nestjs/common';
import { OrdersModule } from 'src/orders/orders.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ProductsModule, OrdersModule],
})
export class AppModule {}
