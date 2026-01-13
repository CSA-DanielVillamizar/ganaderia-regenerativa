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
let FarmService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var FarmService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        /**
         * Crear finca
         */
        async create(dto, userId) {
            const farm = await this.prisma.farm.create({
                data: {
                    ...dto,
                    createdBy: userId,
                    updatedBy: userId,
                },
            });
            // Relacionar usuario con finca
            await this.prisma.userFarm.create({
                data: {
                    userId,
                    farmId: farm.id,
                },
            });
            return farm;
        }
        /**
         * Obtener todas las fincas del usuario
         */
        async findAll(userId) {
            const userFarms = await this.prisma.userFarm.findMany({
                where: { userId },
                include: {
                    farm: true,
                },
            });
            return userFarms.map((uf) => uf.farm);
        }
        /**
         * Obtener finca por ID (verificar acceso)
         */
        async findOne(farmId, userId) {
            // Verificar que usuario tiene acceso a finca
            const userFarm = await this.prisma.userFarm.findUnique({
                where: { userId_farmId: { userId, farmId } },
            });
            if (!userFarm) {
                throw new ForbiddenException('No tienes acceso a esta finca');
            }
            const farm = await this.prisma.farm.findUniqueOrThrow({
                where: { id: farmId },
            });
            return farm;
        }
        /**
         * Actualizar finca
         */
        async update(farmId, dto, userId) {
            await this.findOne(farmId, userId);
            return this.prisma.farm.update({
                where: { id: farmId },
                data: {
                    ...dto,
                    updatedBy: userId,
                },
            });
        }
        /**
         * Eliminar finca (soft delete)
         */
        async remove(farmId, userId) {
            await this.findOne(farmId, userId);
            return this.prisma.farm.update({
                where: { id: farmId },
                data: { deletedAt: new Date() },
            });
        }
    };
    __setFunctionName(_classThis, "FarmService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FarmService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FarmService = _classThis;
})();
export { FarmService };
//# sourceMappingURL=farm.service.js.map