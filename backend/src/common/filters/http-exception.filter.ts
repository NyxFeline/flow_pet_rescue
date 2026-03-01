import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'

// Global HTTP Exception Filter to catch all unhandled exceptions and return a consistent error response format
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    // Catch all exceptions and format the response
    catch(exception: unknown, host: ArgumentsHost) {
        // Get the HTTP context from the arguments host
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        // Default to 500 Internal Server Error if the exception is not an instance of HttpException
        let status = HttpStatus.INTERNAL_SERVER_ERROR
        let message: any = 'Internal server error'

        // If the exception is an instance of HttpException, extract the status and message
        if (exception instanceof HttpException) {
            status = exception.getStatus()
            const exceptionResponse = exception.getResponse()

            // If the exception response is a string, use it as the message; 
            // otherwise, try to extract the message property or use the entire response
            message =
                typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message || exceptionResponse
        }

        // Send the formatted error response
        response.status(status).json({
            success: false,
            statusCode: status,
            path: request.url,
            timestamp: new Date().toISOString(),
            message,
        })
    }
}