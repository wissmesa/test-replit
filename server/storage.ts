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
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Condominium specific operations
  getUserByEmail(email: string): Promise<UserWithApartment | undefined>;
  getUsersWithApartments(): Promise<UserWithApartment[]>;
  createCondominiumUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Apartment operations
  getApartments(): Promise<Apartment[]>;
  getApartment(id: string): Promise<Apartment | undefined>;
  createApartment(apartment: InsertApartment): Promise<Apartment>;
  updateApartment(id: string, apartment: Partial<InsertApartment>): Promise<Apartment>;
  deleteApartment(id: string): Promise<void>;
  
  // Payment operations
  getPagos(): Promise<PagoWithRelations[]>;
  getPagosByUser(userId: string): Promise<PagoWithRelations[]>;
  getPago(id: string): Promise<PagoWithRelations | undefined>;
  createPago(pago: InsertPago): Promise<Pago>;
  updatePago(id: string, pago: Partial<InsertPago>): Promise<Pago>;
  deletePago(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
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
      ...user.users,
      apartment: user.apartments || undefined,
    };
  }

  async getUsersWithApartments(): Promise<UserWithApartment[]> {
    const results = await db
      .select()
      .from(users)
      .leftJoin(apartments, eq(users.idApartamento, apartments.id));
    
    return results.map(result => ({
      ...result.users,
      apartment: result.apartments || undefined,
    }));
  }

  async createCondominiumUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
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
    return await db.select().from(apartments);
  }

  async getApartment(id: string): Promise<Apartment | undefined> {
    const [apartment] = await db.select().from(apartments).where(eq(apartments.id, id));
    return apartment;
  }

  async createApartment(apartmentData: InsertApartment): Promise<Apartment> {
    const [apartment] = await db
      .insert(apartments)
      .values(apartmentData)
      .returning();
    return apartment;
  }

  async updateApartment(id: string, apartmentData: Partial<InsertApartment>): Promise<Apartment> {
    const [apartment] = await db
      .update(apartments)
      .set({ ...apartmentData, updatedAt: new Date() })
      .where(eq(apartments.id, id))
      .returning();
    return apartment;
  }

  async deleteApartment(id: string): Promise<void> {
    await db.delete(apartments).where(eq(apartments.id, id));
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
    const [pago] = await db
      .insert(pagos)
      .values(pagoData)
      .returning();
    return pago;
  }

  async updatePago(id: string, pagoData: Partial<InsertPago>): Promise<Pago> {
    const [pago] = await db
      .update(pagos)
      .set({ ...pagoData, updatedAt: new Date() })
      .where(eq(pagos.id, id))
      .returning();
    return pago;
  }

  async deletePago(id: string): Promise<void> {
    await db.delete(pagos).where(eq(pagos.id, id));
  }
}

export const storage = new DatabaseStorage();
