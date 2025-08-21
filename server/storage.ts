import {
  users,
  apartments,
  pagos,
  type User,
  type UpsertUser,
  type InsertUser,
  type Apartment,
  type InsertApartment,
  type Pago,
  type InsertPago,
  type UserWithApartment,
  type PagoWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByApartment(apartmentId: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<UserWithApartment | undefined>;
  getUsersWithApartments(): Promise<UserWithApartment[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
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
      apartment: (user as any).apartment || undefined,
    };
  }

  async getUsersWithApartments(): Promise<UserWithApartment[]> {
    const results = await db
      .select()
      .from(users)
      .leftJoin(apartments, eq(users.idApartamento, apartments.id));
    
    return (results as any[]).map((result: any) => ({
      ...result.users,
      apartment: result.apartment || undefined,
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
      apartment: (user as any).apartment || undefined,
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

  async createPago(pagoData: InsertPago): Promise<Pago> {
    const result = await db
      .insert(pagos)
      .values(pagoData as any)
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
}

export const storage = new DatabaseStorage();
