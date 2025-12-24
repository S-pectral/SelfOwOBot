import { broadcastLog } from '../../api/websocket.js';
import chalk from 'chalk';

export class Logger {
    private prefix: string;

    constructor(prefix: string = 'BOT') {
        this.prefix = prefix;
    }

    private timestamp(): string {
        return new Date().toLocaleTimeString();
    }

    private emit(level: string, message: string) {
        // Broadcast to WebSocket
        broadcastLog({
            timestamp: this.timestamp(),
            level: level.toUpperCase(),
            prefix: this.prefix,
            message: message
        });
    }

    log(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.blue(`[${this.prefix}]`)} ${message}`);
        this.emit('log', message);
    }

    success(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.green(`[${this.prefix}]`)} ${message}`);
        this.emit('success', message);
    }

    warn(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.yellow(`[${this.prefix}]`)} ${message}`);
        this.emit('warn', message);
    }

    error(message: string) {
        console.error(`${chalk.gray(this.timestamp())} ${chalk.red(`[${this.prefix}]`)} ${message}`);
        this.emit('error', message);
    }

    info(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.cyan(`[${this.prefix}]`)} ${message}`);
        this.emit('info', message);
    }

    debug(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.magenta(`[DEBUG]`)} ${message}`);
        this.emit('debug', message);
    }
}

export const logger = new Logger('System');
