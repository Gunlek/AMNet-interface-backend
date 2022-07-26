import { Controller, HttpCode, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUserOnly } from 'src/auth/roles.guard';
import { Response } from 'express';
import { LydiaService } from './lydia.service';


@ApiTags('lydia')
@Controller('lydia')
export class LydiaController {
    constructor(private lydiaService: LydiaService) {};

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Start payement with Lydia' })
    @ApiResponse({ status: 200, description: 'redirect to Lydia' })
    @ApiConsumes('application/json')
    @UseGuards(JwtAuthGuard)
    @UseGuards(RolesGuard)
    @Roles('admin')
    @CurrentUserOnly('user')
    @Post('start/:id')
    async startPayment(
        @Param('id') user_id: number,
        @Res({ passthrough: true }) res: Response
    ): Promise<string> {
        res.status(HttpStatus.OK)
        return await this.lydiaService.startPayment(user_id);
    };

    @ApiOperation({ summary: 'Handle the payment cancel' })
    @ApiResponse({ status: 200, description: 'A payment is cancelled' })
    @ApiResponse({ status: 400, description: 'No payment found' })
    @ApiConsumes('application/json')
    @Post('cancel/:token')
    async cancelPayment(
        @Param('token') ticket_id: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        res.status(await this.lydiaService.cancelPayment(ticket_id));
    };

    @ApiOperation({ summary: 'Handle the fail of paymentt' })
    @ApiResponse({ status: 200, description: 'A User is updated' })
    @ApiResponse({ status: 400, description: 'No user found' })
    @ApiConsumes('application/json')
    @Post('success/:token')
    async successPayment(
        @Param('token') ticket_id: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        res.status(await this.lydiaService.successPayment(ticket_id));
    };
}
