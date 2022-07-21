import { Controller, HttpCode, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUserOnly } from 'src/auth/roles.guard';
import { Response } from 'express';
import { LydiaService } from './lydia.service';

@ApiBearerAuth()
@ApiTags('lydia')
@Controller('lydia')
export class LydiaController {
    constructor(private lydiaService: LydiaService) {};

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

    @ApiOperation({ summary: 'Handle the sucess of payment' })
    @ApiResponse({ status: 200, description: 'A User is updated' })
    @ApiResponse({ status: 400, description: 'No user found' })
    @ApiConsumes('application/json')
    @Post('cancel/:id')
    async cancelPayment(
        @Param('id') ticket_id: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        res.status(await this.lydiaService.cancelPayment(ticket_id));
    };

    @ApiOperation({ summary: 'Handle the fail of paymentt' })
    @ApiResponse({ status: 200, description: 'A User is updated' })
    @ApiResponse({ status: 400, description: 'No user found' })
    @ApiConsumes('application/json')
    @Post('success/:id')
    async successPayment(
        @Param('id') ticket_id: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        res.status(await this.lydiaService.successPayment(ticket_id));
    };
}
