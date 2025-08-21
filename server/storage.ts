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
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
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
  updatePago(id: string, pago: Partial<InsertPago>): Promise<Pago>;
  deletePago(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
    await db.delete(apartments).where(eq(apartments.id, id));
  }

  async assignUserToApartment(apartmentId: number, userId: string): Promise<{ apartment: Apartment; user: User }> {
    // Start a transaction to ensure both updates happen together
    const apartment = await this.updateApartment(apartmentId, { idUsuario: userId });
    const user = await this.updateUser(userId, { idApartamento: apartmentId as any });
    
    return { apartment, user };
  }

  async unassignUserFromApartment(apartmentId: number, userId: string): Promise<{ apartment: Apartment; user: User }> {
    // Remove the relationship from both sides
    const apartment = await this.updateApartment(apartmentId, { idUsuario: null as any });
    const user = await this.updateUser(userId, { idApartamento: null as any });
    
    return { apartment, user };
  }

  // Payment operations
  async getPagos(): Promise<PagoWithRelations[]> {
    const results = await db
      .select()
      .from(pagos)
      .innerJoin(users, eq(pagos.idUsuario, users.id))
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
      .innerJoin(users, eq(pagos.idUsuario, users.id))
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

  async getApartmentsWithUsers(): Promise<any[]> {
    const results = await db
      .select()
      .from(apartments)
      .leftJoin(users, eq(apartments.idUsuario, users.id))
      .orderBy(apartments.numero);
    
    return results.map(result => ({
      ...result.apartments,
      user: result.users,
    }));
  }
}

export const storage = new DatabaseStorage();
