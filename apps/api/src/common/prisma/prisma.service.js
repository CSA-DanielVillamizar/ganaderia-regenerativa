var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
let PrismaService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = PrismaClient;
    var PrismaService = _classThis = class extends _classSuper {
        constructor() {
            super({
                log: ['query', 'info', 'warn', 'error'],
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger('PrismaService')
            });
        }
        async onModuleInit() {
            await this.$connect();
            this.logger.log('✅ Conectado a la base de datos');
            // Optimizar SQLite para pruebas concurrentes y evitar bloqueos
            const dbUrl = process.env.DATABASE_URL || '';
            if (dbUrl.toLowerCase().startsWith('file:') || dbUrl.toLowerCase().includes('sqlite')) {
                try {
                    await this.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
                    await this.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
                    await this.$queryRawUnsafe('PRAGMA busy_timeout = 10000;');
                    this.logger.log('🛠️ PRAGMAs SQLite aplicados (WAL, busy_timeout=10000ms)');
                }
                catch (e) {
                    this.logger.warn(`No se pudieron aplicar PRAGMAs SQLite: ${e}`);
                }
            }
        }
        async onModuleDestroy() {
            await this.$disconnect();
            this.logger.log('❌ Desconectado de la base de datos');
        }
    };
    __setFunctionName(_classThis, "PrismaService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PrismaService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PrismaService = _classThis;
})();
export { PrismaService };
//# sourceMappingURL=prisma.service.js.map