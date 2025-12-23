import chalk from 'chalk';

export class Logger {
    private prefix: string;

    constructor(prefix: string = 'BOT') {
        this.prefix = prefix;
    }

    private timestamp(): string {
        return new Date().toLocaleTimeString();
    }

    log(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.blue(`[${this.prefix}]`)} ${message}`);
    }

    success(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.green(`[${this.prefix}]`)} ${message}`);
    }

    warn(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.yellow(`[${this.prefix}]`)} ${message}`);
    }

    error(message: string) {
        console.error(`${chalk.gray(this.timestamp())} ${chalk.red(`[${this.prefix}]`)} ${message}`);
    }

    info(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.cyan(`[${this.prefix}]`)} ${message}`);
    }

    debug(message: string) {
        console.log(`${chalk.gray(this.timestamp())} ${chalk.magenta(`[DEBUG]`)} ${message}`);
    }
}

export const logger = new Logger('System');
