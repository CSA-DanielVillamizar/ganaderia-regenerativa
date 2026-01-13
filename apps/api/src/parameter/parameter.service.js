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
import { Injectable, ForbiddenException } from '@nestjs/common';
/**
 * Parámetros de cálculo configurables por finca.
 * P0.2, P0.3, P0.4, P0.5 dependen de esta configuración.
 */
let ParameterService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ParameterService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        /**
         * Obtener valor de parámetro con fallback a default
         */
        async getParameter(farmId, key, defaultValue) {
            const param = await this.prisma.parameter.findUnique({
                where: { farmId_key: { farmId, key } },
            });
            return param?.value ?? defaultValue;
        }
        /**
         * Obtener parámetro como número
         */
        async getParameterAsNumber(farmId, key, defaultValue) {
            const value = await this.getParameter(farmId, key, defaultValue.toString());
            const parsed = parseFloat(value);
            return isNaN(parsed) ? defaultValue : parsed;
        }
        /**
         * Establecer parámetro
         */
        async setParameter(farmId, key, value, userId, description) {
            return this.prisma.parameter.upsert({
                where: { farmId_key: { farmId, key } },
                create: {
                    farmId,
                    key,
                    value,
                    description,
                },
                update: {
                    value,
                    description,
                    updatedBy: userId,
                },
            });
        }
        /**
         * Listar parámetros de finca
         */
        async listByFarm(farmId) {
            return this.prisma.parameter.findMany({
                where: { farmId },
                orderBy: { key: 'asc' },
            });
        }
        /**
         * Inicializar parámetros default para nueva finca
         */
        async initializeDefaults(farmId, _userId) {
            const defaults = [
                { key: 'ua_weight_kg', value: '450', description: 'Peso de una Unidad Animal en kg' },
                { key: 'intake_percent_of_bw', value: '0.025', description: 'Consumo como % del peso vivo (ej: 2.5%)' },
                { key: 'dry_matter_fraction', value: '0.30', description: 'Fracción de materia seca en consumo (ej: 30%)' },
                { key: 'utilization_percent', value: '70', description: 'Porcentaje de aprovechamiento de forraje' },
                { key: 'min_rest_days', value: '21', description: 'Mínimo días de descanso entre rotaciones' },
            ];
            const existing = await this.prisma.parameter.findMany({
                where: { farmId },
                select: { key: true },
            });
            const existingKeys = new Set(existing.map((p) => p.key));
            const toCreate = defaults.filter((d) => !existingKeys.has(d.key));
            for (const param of toCreate) {
                await this.prisma.parameter.create({
                    data: {
                        farmId,
                        key: param.key,
                        value: param.value,
                        description: param.description,
                    },
                });
            }
            return toCreate.length;
        }
        /**
         * Validar acceso a parámetros de finca
         */
        async verifyFarmAccess(farmId, userId) {
            const userFarm = await this.prisma.userFarm.findUnique({
                where: { userId_farmId: { userId, farmId } },
            });
            if (!userFarm) {
                throw new ForbiddenException('No tienes acceso a esta finca');
            }
        }
    };
    __setFunctionName(_classThis, "ParameterService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParameterService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParameterService = _classThis;
})();
export { ParameterService };
//# sourceMappingURL=parameter.service.js.map