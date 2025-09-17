import {
  users,
  apartments,
  pagos,
  tasasCambio,
  type User,
  type UpsertUser,
  type InsertUser,
  type Apartment,
  type InsertApartment,
  type Pago,
  type InsertPago,
  type TasaCambio,
  type InsertTasaCambio,
  type UserWithApartment,
  type PagoWithRelations,
  type BulkPaymentFormData,
  type BulkPaymentData,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, sql, inArray, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByApartment(apartmentId: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<UserWithApartment | undefined>;
  getUsersWithApartments(): Promise<UserWithApartment[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  updateUserBalance(userId: string, balanceChange: number): Promise<User>;
  
  // Auth operations
  authenticateUser(email: string, password: string): Promise<UserWithApartment | null>;
  
  // Apartment operations
  getApartments(): Promise<Apartment[]>;
  getApartment(id: number): Promise<Apartment | undefined>;
  createApartment(apartment: InsertApartment): Promise<Apartment>;
  updateApartment(id: number, apartment: Partial<InsertApartment>): Promise<Apartment>;
  deleteApartment(id: number): Promise<void>;
  
  // Payment operations
  getPagos(): Promise<PagoWithRelations[]>;
  getPagosByUser(userId: string): Promise<PagoWithRelations[]>;
  getPago(id: string): Promise<PagoWithRelations | undefined>;
  createPago(pago: InsertPago): Promise<Pago>;
  hasApartmentPayments(apartmentId: number): Promise<boolean>;
  updatePago(id: string, pago: Partial<InsertPago>): Promise<Pago>;
  deletePago(id: string): Promise<void>;
  updatePendingPaymentsByApartment(apartmentId: number, userId: string): Promise<void>;
  unassignPendingPaymentsByApartment(apartmentId: number, userId: string): Promise<void>;
  applyBulkPayment(userId: string, pagoIds: string[], data: BulkPaymentData): Promise<Pago[]>;
  approveBulkTransaction(transactionId: string): Promise<Pago[]>;
  
  // Exchange rate operations
  getTasasCambio(moneda?: string, limite?: number): Promise<TasaCambio[]>;
  getLatestTasaCambio(moneda: string): Promise<TasaCambio | undefined>;
  createTasaCambio(tasa: InsertTasaCambio): Promise<TasaCambio>;
  getTasasCambioByDateRange(fechaInicio: Date, fechaFin: Date, moneda?: string): Promise<TasaCambio[]>;
  getUSDExchangeRate(fecha?: Date): Promise<{ valor: string, fecha: Date } | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByApartment(apartmentId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.idApartamento, apartmentId));
    return user;
  }

  // Condominium specific operations
  async getUserByEmail(email: string): Promise<UserWithApartment | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(apartments, eq(users.idApartamento, apartments.id))
      .where(eq(users.correo, email));
    
    if (!user) return undefined;
    
    return {
      ...(user as any).users,
      apartment: (user as any).apartments || undefined,
    };
  }

  async getUsersWithApartments(): Promise<UserWithApartment[]> {
    const results = await db
      .select()
      .from(users)
      .leftJoin(apartments, eq(users.idApartamento, apartments.id));
    
    return (results as any[]).map((result: any) => ({
      ...result.users,
      apartment: result.apartments || undefined,
    }));
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(user)
      .returning();
    return (result as any[])[0] as User;
  }

  async authenticateUser(email: string, password: string): Promise<UserWithApartment | null> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(apartments, eq(users.idApartamento, apartments.id))
      .where(eq(users.correo, email));
    
    if (!user) return null;
    
    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(password, (user as any).users.contrasena);
    
    if (!isValid) return null;
    
    return {
      ...(user as any).users,
      apartment: (user as any).apartments || undefined,
    };
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, balanceChange: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${balanceChange}`,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // First check if user has any payments
    const userPayments = await db
      .select()
      .from(pagos)
      .where(eq(pagos.idUsuario, id));
    
    if (userPayments.length > 0) {
      throw new Error("No se puede eliminar el usuario porque tiene pagos asociados");
    }
    
    // Check if user is assigned to an apartment and unassign first
    const user = await this.getUserByEmail(id); // This might fail, let's get user by id instead
    const allUsers = await db.select().from(users).where(eq(users.id, id));
    if (allUsers.length > 0 && allUsers[0].idApartamento) {
      await this.unassignUserFromApartment(allUsers[0].idApartamento, id);
    }
    
    await db.delete(users).where(eq(users.id, id));
  }

  // Apartment operations
  async getApartments(): Promise<Apartment[]> {
    const result = await db.select().from(apartments);
    return (result as any[]) as Apartment[];
  }

  async getApartment(id: number): Promise<Apartment | undefined> {
    const [apartment] = await db.select().from(apartments).where(eq(apartments.id, id));
    return apartment;
  }

  async createApartment(apartmentData: InsertApartment): Promise<Apartment> {
    const result = await db
      .insert(apartments)
      .values(apartmentData)
      .returning();
    return (result as any[])[0] as Apartment;
  }

  async updateApartment(id: number, apartmentData: Partial<InsertApartment>): Promise<Apartment> {
    const [apartment] = await db
      .update(apartments)
      .set({ ...apartmentData, updatedAt: new Date() })
      .where(eq(apartments.id, id))
      .returning();
    return apartment;
  }

  async deleteApartment(id: number): Promise<void> {
    // First check if apartment has any payments
    const apartmentPayments = await db
      .select()
      .from(pagos)
      .where(eq(pagos.idApartamento, id));
    
    if (apartmentPayments.length > 0) {
      throw new Error("No se puede eliminar el apartamento porque tiene pagos asociados");
    }
    
    // Check if apartment has an assigned user and unassign first
    const apartment = await this.getApartment(id);
    if (apartment && apartment.idUsuario) {
      await this.unassignUserFromApartment(id, apartment.idUsuario);
    }
    
    await db.delete(apartments).where(eq(apartments.id, id));
  }

  async assignUserToApartment(apartmentId: number, userId: string): Promise<{ apartment: Apartment; user: User }> {
    // Check if apartment already has another user assigned
    const existingUserInApartment = await this.getUserByApartment(apartmentId);
    if (existingUserInApartment && existingUserInApartment.id !== userId) {
      // Check if apartment has payments - if so, prevent user change
      const hasPayments = await this.hasApartmentPayments(apartmentId);
      if (hasPayments) {
        throw new Error("No se puede cambiar el usuario asignado porque este apartamento tiene pagos asociados. Debe eliminar la asociación actual primero.");
      }
      
      // Unassign previous user from apartment first
      await this.unassignUserFromApartment(apartmentId, existingUserInApartment.id);
    }
    
    // Check if user is already assigned to another apartment
    const existingUser = await this.getUser(userId);
    if (existingUser && existingUser.idApartamento && existingUser.idApartamento !== apartmentId) {
      // Check if user's current apartment has payments - if so, prevent reassignment
      const hasPayments = await this.hasApartmentPayments(existingUser.idApartamento);
      if (hasPayments) {
        throw new Error("No se puede reasignar este usuario porque su apartamento actual tiene pagos asociados. Debe eliminar la asociación actual primero.");
      }
      
      // Unassign user from previous apartment first
      await this.unassignUserFromApartment(existingUser.idApartamento, userId);
    }
    
    // Now assign the user to the apartment
    const apartment = await this.getApartment(apartmentId);
    const user = await this.updateUser(userId, { idApartamento: apartmentId as any });
    
    // Update pending payments for this apartment to be assigned to the new user
    await this.updatePendingPaymentsByApartment(apartmentId, userId);
    
    return { apartment: apartment!, user };
  }

  async unassignUserFromApartment(apartmentId: number, userId: string): Promise<{ apartment: Apartment; user: User }> {
    // Remove the relationship from user side only
    const apartment = await this.getApartment(apartmentId);
    const user = await this.updateUser(userId, { idApartamento: null });
    
    return { apartment: apartment!, user };
  }

  // Payment operations
  async getPagos(): Promise<PagoWithRelations[]> {
    const results = await db
      .select()
      .from(pagos)
      .leftJoin(users, eq(pagos.idUsuario, users.id))
      .innerJoin(apartments, eq(pagos.idApartamento, apartments.id))
      .orderBy(desc(pagos.fechaVencimiento));
    
    return results.map(result => ({
      ...result.pagos,
      user: result.users,
      apartment: result.apartments,
    }));
  }

  async getPagosByUser(userId: string): Promise<PagoWithRelations[]> {
    const results = await db
      .select()
      .from(pagos)
      .innerJoin(users, eq(pagos.idUsuario, users.id))
      .innerJoin(apartments, eq(pagos.idApartamento, apartments.id))
      .where(eq(pagos.idUsuario, userId))
      .orderBy(desc(pagos.fechaVencimiento));
    
    return results.map(result => ({
      ...result.pagos,
      user: result.users,
      apartment: result.apartments,
    }));
  }

  async getPago(id: string): Promise<PagoWithRelations | undefined> {
    const [result] = await db
      .select()
      .from(pagos)
      .leftJoin(users, eq(pagos.idUsuario, users.id))
      .innerJoin(apartments, eq(pagos.idApartamento, apartments.id))
      .where(eq(pagos.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.pagos,
      user: result.users,
      apartment: result.apartments,
    };
  }

  async getUSDExchangeRate(fecha?: Date): Promise<{ valor: string, fecha: Date } | null> {
    // Simply get the most recent USD rate
    const result = await db
      .select()
      .from(tasasCambio)
      .where(eq(tasasCambio.moneda, 'USD'))
      .orderBy(desc(tasasCambio.fecha))
      .limit(1);
    
    return result.length > 0 ? { valor: result[0].valor, fecha: result[0].fecha } : null;
  }

  async createPago(pagoData: InsertPago): Promise<Pago> {
    // Get USD exchange rate for conversion
    const exchangeRate = await this.getUSDExchangeRate();
    
    // Prepare payment data with Bs conversion
    const finalPaymentData = {
      ...pagoData,
      montoBs: exchangeRate ? (parseFloat(pagoData.monto) * parseFloat(exchangeRate.valor)).toFixed(2) : null,
      tasaCambio: exchangeRate?.valor || null
    };

    const result = await db
      .insert(pagos)
      .values(finalPaymentData as any)
      .returning();
    return (result as any[])[0] as Pago;
  }

  async updatePago(id: string, pagoData: any): Promise<Pago> {
    const updateData = { ...pagoData, updatedAt: new Date() };
    const [pago] = await db
      .update(pagos)
      .set(updateData as any)
      .where(eq(pagos.id, id))
      .returning();
    return pago as Pago;
  }

  async updatePendingPaymentsWithLatestRate(): Promise<{ updated: number, latestRate: string }> {
    // Get the latest USD exchange rate
    const exchangeRate = await this.getUSDExchangeRate();
    
    if (!exchangeRate) {
      throw new Error("No USD exchange rate available");
    }

    // Get all pending payments
    const pendingPayments = await db
      .select()
      .from(pagos)
      .where(eq(pagos.estado, 'pendiente'));

    if (pendingPayments.length === 0) {
      return { updated: 0, latestRate: exchangeRate.valor };
    }

    // Update each pending payment with new rate and recalculate montoBs
    const updatePromises = pendingPayments.map(pago => {
      const newMontoBs = (parseFloat(pago.monto) * parseFloat(exchangeRate.valor)).toFixed(2);
      
      return db
        .update(pagos)
        .set({
          montoBs: newMontoBs,
          tasaCambio: exchangeRate.valor,
          updatedAt: new Date()
        })
        .where(eq(pagos.id, pago.id));
    });

    await Promise.all(updatePromises);

    return { 
      updated: pendingPayments.length, 
      latestRate: exchangeRate.valor 
    };
  }

  async deletePago(id: string): Promise<void> {
    await db.delete(pagos).where(eq(pagos.id, id));
  }

  async updatePendingPaymentsByApartment(apartmentId: number, userId: string): Promise<void> {
    await db
      .update(pagos)
      .set({ 
        idUsuario: userId,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(pagos.idApartamento, apartmentId),
          eq(pagos.estado, 'pendiente'),
          isNull(pagos.idUsuario)
        )
      );
  }

  async unassignPendingPaymentsByApartment(apartmentId: number, userId: string): Promise<void> {
    await db
      .update(pagos)
      .set({ 
        idUsuario: null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(pagos.idApartamento, apartmentId),
          eq(pagos.estado, 'pendiente'),
          eq(pagos.idUsuario, userId)
        )
      );
  }

  async applyBulkPayment(userId: string, pagoIds: string[], data: BulkPaymentData): Promise<Pago[]> {
    // Generate unique transaction ID for this bulk payment
    const transactionId = randomUUID();
    
    // Validate that all payments belong to the user and are in correct state
    const payments = await db
      .select()
      .from(pagos)
      .where(
        and(
          inArray(pagos.id, pagoIds),
          eq(pagos.idUsuario, userId),
          inArray(pagos.estado, ['pendiente', 'vencido'])
        )
      )
      .orderBy(asc(pagos.fechaVencimiento)); // Sort by due date (oldest first)

    if (payments.length !== pagoIds.length) {
      throw new Error("Algunos pagos no son válidos o no pertenecen al usuario");
    }

    // Calculate total amount owed to validate payment amount
    const totalOwedUsd = payments.reduce((sum, payment) => sum + parseFloat(payment.monto), 0);
    const paidAmountBs = parseFloat(data.monto);
    
    // Get current USD exchange rate
    const usdRate = await this.getUSDExchangeRate();
    if (!usdRate) {
      throw new Error("No se pudo obtener la tasa de cambio USD");
    }

    const exchangeRate = parseFloat(usdRate.valor);
    const paidAmountUsd = paidAmountBs / exchangeRate;
    
    // Allow overpayments - excess will be added to user balance
    const tolerance = 0.01; // $0.01 tolerance for rounding differences

    let remainingUsdAmount = paidAmountUsd;
    
    // Use transaction to ensure atomicity
    const results = await db.transaction(async (tx) => {
      const transactionResults: Pago[] = [];
      
      for (const payment of payments) {
        const paymentAmountUsd = parseFloat(payment.monto);
        
        if (remainingUsdAmount <= tolerance) {
          // No more money to apply
          break;
        }
        
        if (remainingUsdAmount >= paymentAmountUsd - tolerance) {
          // Full payment - mark as en_revision
          const [updatedPayment] = await tx
            .update(pagos)
            .set({
              estado: 'en_revision',
              fechaPago: new Date(),
              fechaOperacion: new Date(data.fechaOperacion),
              cedulaRif: data.cedulaRif,
              tipoOperacion: data.tipoOperacion,
              correoElectronico: data.correoElectronico,
              montoBs: (paymentAmountUsd * exchangeRate).toFixed(2),
              tasaCambio: usdRate.valor,
              idTransaccionMultiple: transactionId,
              updatedAt: new Date()
            })
            .where(eq(pagos.id, payment.id))
            .returning();

          transactionResults.push(updatedPayment);
          remainingUsdAmount -= paymentAmountUsd;
        } else {
          // Partial payment - CORRECTED LOGIC
          const partialAmountUsd = remainingUsdAmount;
          const remainderAmountUsd = paymentAmountUsd - partialAmountUsd;
          
          // Create NEW payment for the partial amount and mark as 'en_revision'
          const [newPartialPayment] = await tx
            .insert(pagos)
            .values({
              idUsuario: userId,
              idApartamento: payment.idApartamento,
              monto: partialAmountUsd.toFixed(2),
              montoBs: (partialAmountUsd * exchangeRate).toFixed(2),
              tasaCambio: usdRate.valor,
              fechaVencimiento: payment.fechaVencimiento,
              estado: 'en_revision',
              metodoPago: payment.metodoPago,
              concepto: payment.concepto,
              comprobanteUrl: payment.comprobanteUrl,
              idTransaccionMultiple: transactionId,
              fechaPago: new Date(),
              fechaOperacion: new Date(data.fechaOperacion),
              cedulaRif: data.cedulaRif,
              tipoOperacion: data.tipoOperacion,
              correoElectronico: data.correoElectronico,
            } as any)
            .returning();

          transactionResults.push(newPartialPayment);

          // Update ORIGINAL payment with the remaining amount and keep as 'pendiente'
          const [updatedOriginalPayment] = await tx
            .update(pagos)
            .set({
              monto: remainderAmountUsd.toFixed(2),
              montoBs: (remainderAmountUsd * exchangeRate).toFixed(2),
              tasaCambio: usdRate.valor,
              updatedAt: new Date()
            })
            .where(eq(pagos.id, payment.id))
            .returning();

          transactionResults.push(updatedOriginalPayment);
          remainingUsdAmount = 0; // All money has been applied
          break;
        }
      }

      // If there's remaining money, update user balance
      if (remainingUsdAmount > tolerance) {
        await tx
          .update(users)
          .set({
            balance: sql`${users.balance} + ${remainingUsdAmount.toFixed(2)}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }

      return transactionResults;
    });

    return results;
  }

  async approveBulkTransaction(transactionId: string): Promise<Pago[]> {
    // Update all payments with matching idTransaccionMultiple to 'pagado' status
    const results = await db
      .update(pagos)
      .set({
        estado: 'pagado',
        fechaPago: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(pagos.idTransaccionMultiple, transactionId),
          eq(pagos.estado, 'en_revision')
        )
      )
      .returning();
    
    return results;
  }

  async getApartmentsWithUsers(): Promise<any[]> {
    const results = await db
      .select()
      .from(apartments)
      .leftJoin(users, eq(users.idApartamento, apartments.id))
      .orderBy(apartments.numero);
    
    return results.map((result: any) => ({
      ...result.apartments,
      user: result.users,
    }));
  }

  async getPagosByApartment(apartmentId: number): Promise<PagoWithRelations[]> {
    const results = await db
      .select()
      .from(pagos)
      .leftJoin(users, eq(pagos.idUsuario, users.id))
      .innerJoin(apartments, eq(pagos.idApartamento, apartments.id))
      .where(eq(pagos.idApartamento, apartmentId))
      .orderBy(desc(pagos.fechaVencimiento));
    
    return results.map(result => ({
      ...result.pagos,
      user: result.users,
      apartment: result.apartments,
    }));
  }

  async hasApartmentPayments(apartmentId: number): Promise<boolean> {
    const payments = await db
      .select({ count: sql<number>`count(*)` })
      .from(pagos)
      .where(eq(pagos.idApartamento, apartmentId));
    
    return payments[0].count > 0;
  }

  // Exchange rate operations
  async getTasasCambio(moneda?: string, limite?: number): Promise<TasaCambio[]> {
    if (moneda && limite) {
      return await db.select().from(tasasCambio)
        .where(eq(tasasCambio.moneda, moneda as any))
        .orderBy(desc(tasasCambio.fecha), desc(tasasCambio.createdAt))
        .limit(limite);
    } else if (moneda) {
      return await db.select().from(tasasCambio)
        .where(eq(tasasCambio.moneda, moneda as any))
        .orderBy(desc(tasasCambio.fecha), desc(tasasCambio.createdAt));
    } else if (limite) {
      return await db.select().from(tasasCambio)
        .orderBy(desc(tasasCambio.fecha), desc(tasasCambio.createdAt))
        .limit(limite);
    } else {
      return await db.select().from(tasasCambio)
        .orderBy(desc(tasasCambio.fecha), desc(tasasCambio.createdAt));
    }
  }

  async getLatestTasaCambio(moneda: string): Promise<TasaCambio | undefined> {
    const [tasa] = await db
      .select()
      .from(tasasCambio)
      .where(eq(tasasCambio.moneda, moneda as any))
      .orderBy(desc(tasasCambio.fecha), desc(tasasCambio.createdAt))
      .limit(1);
    
    return tasa;
  }

  async createTasaCambio(tasa: InsertTasaCambio): Promise<TasaCambio> {
    const [newTasa] = await db
      .insert(tasasCambio)
      .values(tasa as any)
      .returning();
    
    return newTasa as TasaCambio;
  }

  async getTasasCambioByDateRange(fechaInicio: Date, fechaFin: Date, moneda?: string): Promise<TasaCambio[]> {
    let baseQuery = db
      .select()
      .from(tasasCambio)
      .where(
        and(
          sql`${tasasCambio.fecha} >= ${fechaInicio}`,
          sql`${tasasCambio.fecha} <= ${fechaFin}`
        )
      );
    
    if (moneda) {
      baseQuery = db
        .select()
        .from(tasasCambio)
        .where(
          and(
            sql`${tasasCambio.fecha} >= ${fechaInicio}`,
            sql`${tasasCambio.fecha} <= ${fechaFin}`,
            eq(tasasCambio.moneda, moneda as any)
          )
        );
    }
    
    const result = await baseQuery.orderBy(desc(tasasCambio.fecha));
    return result as TasaCambio[];
  }
}

export const storage = new DatabaseStorage();
