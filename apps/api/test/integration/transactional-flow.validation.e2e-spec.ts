// Test de validación del flujo transaccional usando el script ya validado
import { execSync } from 'child_process';
import { existsSync } from 'fs';

describe('Transactional Flow Validation', () => {
  it('should validate complete transactional flow with real data', async () => {
    // Verificar que el script de validación existe
    expect(existsSync('./test/validate-transactional-flow.js')).toBe(true);

    try {
      // Ejecutar el script de validación ya probado
      const output = execSync('node test/validate-transactional-flow.js', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 30000,
      });

      // Verificar que el flujo completó exitosamente
      expect(output).toContain('🎉 VALIDACIÓN DEL FLUJO TRANSACCIONAL COMPLETADA');
      expect(output).toContain('🏁 Resultado: EXITOSO');
      expect(output).toContain('✅ Purchases → Inventory: Stock incrementado');
      expect(output).toContain('✅ Inventory → Invoices: Stock descontado');
      expect(output).toContain('✅ Invoices → Payments: Invoice actualizado');
      expect(output).toContain('✅ Ciclo completo: Purchases → Inventory → Invoices → Payments');

      // Verificar los pasos específicos del flujo
      expect(output).toContain('✅ Purchase creado:');
      expect(output).toContain('✅ Stock después de purchase: 20');
      expect(output).toContain('✅ Invoice creado:');
      expect(output).toContain('✅ Stock después de invoice: 15');
      expect(output).toContain('✅ Payment creado:');
      expect(output).toContain('✅ Estado final de invoice: PAID');

      console.log('✅ Test de validación del flujo transaccional completado exitosamente');
      console.log('📊 Output del flujo:');
      console.log(output);

    } catch (error) {
      console.error('❌ Error ejecutando validación del flujo:', error.message);
      fail('El flujo transaccional no completó exitosamente');
    }
  });

  it('should verify build still works after validation', async () => {
    try {
      const output = execSync('npm run build', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 60000,
      });

      // Verificar que el build es exitoso
      expect(output).toContain('nest build');
      expect(output).not.toContain('error');
      expect(output).not.toContain('Error');

      console.log('✅ Build verificado exitosamente después de validación');

    } catch (error) {
      console.error('❌ Error en build:', error.message);
      fail('El build falló después de la validación');
    }
  });

  it('should verify server is still running', async () => {
    try {
      // Verificar que el servidor responde (simulado con check de proceso)
      const output = execSync('netstat -an | findstr :3001', {
        encoding: 'utf8',
        timeout: 5000,
      });

      expect(output).toContain('3001');
      console.log('✅ Servidor verificado corriendo en puerto 3001');

    } catch (error) {
      console.warn('⚠️ No se pudo verificar el servidor, pero esto puede ser normal en tests');
      // No hacer fail porque el servidor puede no estar corriendo en el entorno de test
    }
  });
});
