import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate(signInDto: SignInDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        clientEmail: signInDto.clientEmail,
      },
    });

    if (!order)
      throw new HttpException(
        'Não foi possível fazer o login!',
        HttpStatus.UNAUTHORIZED,
      );

    const passwordIsValid = await this.hashingService.compare(
      signInDto.emailPassword,
      order.clientPasswordHash,
    );

    if (!passwordIsValid)
      throw new HttpException(
        'Não foi possível fazer o login!',
        HttpStatus.UNAUTHORIZED,
      );

    const token = await this.jwtService.signAsync(
      {
        sub: order.id,
        clientEmail: order.clientEmail,
      },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.jwtTtl
          ? parseInt(this.jwtConfiguration.jwtTtl)
          : 604800,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      },
    );

    return {
      id: order.id,
      status: order.status,
      clientEmail: order.clientEmail,
      token: token,
    };
  }
}
