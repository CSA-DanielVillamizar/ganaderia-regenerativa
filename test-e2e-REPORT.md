# TEST E2E: DECISION TODAY - REPORTE

**Fecha:** 2026-01-10 16:13:10
**Farm ID:** cmk8oe5zm0002114tgxic313l
**Farm Name:** Finca Las Praderas

## CONFIGURACION VALIDADA

- API Puerto: 3000 (desde apps/api/.env)
- WEB Puerto: 3001 (segun especificacion)
- CORS Origin: http://localhost:3001

## TEST DE API: PASS (5/6 validaciones)

### Estructura de Datos:

- confidenceLevel: HIGH
- explainability: 2 razones
- actionChecklist: 14 acciones
- recommendedNextPaddock: 
- recommendedHerd: 
- minRestDays:  dias

## PRUEBA MANUAL UI

**URL:** http://localhost:3001/farms/cmk8oe5zm0002114tgxic313l/decision-today

### Checklist:

- [ ] 1. Loading state aparece al refrescar
- [ ] 2. Error state con traceId cuando API esta caido
- [ ] 3. RecommendationCard renderiza correctamente
- [ ] 4. ConfidenceBadge muestra nivel y color correcto
- [ ] 5. ExplainabilityPanel muestra razones con icons
- [ ] 6. ActionChecklistPanel muestra acciones con prioridades
- [ ] 7. CTAs navegan correctamente
- [ ] 8. Boton Actualizar refresca datos

### Evidencia Requerida:

- Screenshot: Loading state
- Screenshot: Error state con traceId
- Screenshot: Pagina completa en success state
- Screenshot: URL despues de click en CTA

## DATOS DE RESPUESTA

Ver archivo: test-e2e-decision-response.json

## CONCLUSION

**TEST API:** PASS

**TEST UI:** PENDIENTE VALIDACION MANUAL

---

*Generado por test-e2e-simple.ps1*
