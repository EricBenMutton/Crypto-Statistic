import { Request, Response } from 'express';
import { checkAllExchangesBalance } from '../services/balanceService';
import { ApiResponse } from '../types/api';

export class BalanceHandler {
    static async check(_req: Request, res: Response<ApiResponse>) {
        try {
            const balanceInfo = await checkAllExchangesBalance();
            res.json({
                success: true,
                message: 'Balance check completed',
                data: balanceInfo
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error running balance check:', error);
            res.status(500).json({
                success: false,
                error: errorMessage
            });
        }
    }
} 