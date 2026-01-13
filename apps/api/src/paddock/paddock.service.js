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
let PaddockService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaddockService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        /**
         * Crear potrero
         */
        async create(dto, userId) {
            // Verificar acceso a finca
            await this.verifyFarmAccess(dto.farmId, userId);
            return this.prisma.paddock.create({
                data: {
                    ...dto,
                    createdBy: userId,
                    updatedBy: userId,
                },
            });
        }
        /**
         * Obtener potreros de finca
         */
        async findByFarm(farmId, userId) {
            await this.verifyFarmAccess(farmId, userId);
            return this.prisma.paddock.findMany({
                where: {
                    farmId,
                    deletedAt: null,
                },
                orderBy: { name: 'asc' },
            });
        }
        /**
         * Obtener potrero por ID
         */
        async findOne(id, userId) {
            const paddock = await this.prisma.paddock.findUniqueOrThrow({
                where: { id },
            });
            await this.verifyFarmAccess(paddock.farmId, userId);
            return paddock;
        }
        /**
         * Actualizar potrero
         */
        async update(id, dto, userId) {
            const paddock = await this.findOne(id, userId);
            await this.verifyFarmAccess(paddock.farmId, userId);
            return this.prisma.paddock.update({
                where: { id },
                data: {
                    ...dto,
                    updatedBy: userId,
                },
            });
        }
        /**
         * Eliminar potrero
         */
        async remove(id, userId) {
            const paddock = await this.findOne(id, userId);
            await this.verifyFarmAccess(paddock.farmId, userId);
            return this.prisma.paddock.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        /**
         * Obtener carga animal del potrero
         * Retorna: {ua: número de UA, uaPerHectare: UA/hectárea}
         */
        async getStockingRate(id, userId) {
            const paddock = await this.findOne(id, userId);
            await this.verifyFarmAccess(paddock.farmId, userId);
            // Obtener movimiento activo del potrero
            const activeMovement = await this.prisma.movement.findFirst({
                where: {
                    paddockId: id,
                    status: 'ACTIVE',
                },
                include: {
                    herd: true,
                },
            });
            if (!activeMovement || !activeMovement.herd.currentUA) {
                return {
                    ua: 0,
                    uaPerHectare: 0,
                    herdName: null,
                    startDate: null,
                };
            }
            const ua = activeMovement.herd.currentUA;
            const hectares = paddock.hectares || 1;
            const uaPerHectare = ua / hectares;
            return {
                ua,
                uaPerHectare,
                herdName: activeMovement.herd.name,
                startDate: activeMovement.entryDate,
            };
        }
        async verifyFarmAccess(farmId, userId) {
            const userFarm = await this.prisma.userFarm.findUnique({
                where: { userId_farmId: { userId, farmId } },
            });
            if (!userFarm) {
                throw new ForbiddenException('No tienes acceso a esta finca');
            }
        }
    };
    __setFunctionName(_classThis, "PaddockService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaddockService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaddockService = _classThis;
})();
export { PaddockService };
//# sourceMappingURL=paddock.service.js.map