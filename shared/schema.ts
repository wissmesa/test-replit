import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users: any = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Condominium specific fields
  primerNombre: varchar("primer_nombre").notNull(),
  segundoNombre: varchar("segundo_nombre"),
  primerApellido: varchar("primer_apellido").notNull(),
  segundoApellido: varchar("segundo_apellido"),
  telefono: varchar("telefono").notNull(),
  correo: varchar("correo").notNull().unique(),
  contrasena: varchar("contrasena").notNull(),
  identificacion: varchar("identificacion").notNull().unique(),
  tipoUsuario: varchar("tipo_usuario").notNull().$type<'admin' | 'propietario'>(),
  tipoIdentificacion: varchar("tipo_identificacion").notNull().$type<'pasaporte' | 'cedula' | 'rif'>(),
  idApartamento: integer("id_apartamento").references(() => apartments.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apartments: any = pgTable("apartments", {
  id: serial("id").primaryKey(),
  piso: integer("piso").notNull(),
  numero: varchar("numero").notNull().unique(),
  alicuota: decimal("alicuota", { precision: 10, scale: 2 }).notNull(),
  idUsuario: varchar("id_usuario").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pagos = pgTable("pagos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  idUsuario: varchar("id_usuario").notNull().references(() => users.id),
  idApartamento: integer("id_apartamento").notNull().references(() => apartments.id),
  monto: decimal("monto", { precision: 10, scale: 2 }).notNull(),
  fechaVencimiento: timestamp("fecha_vencimiento").notNull(),
  fechaPago: timestamp("fecha_pago"),
  estado: varchar("estado").notNull().$type<'pendiente' | 'pagado' | 'vencido'>().default('pendiente'),
  metodoPago: varchar("metodo_pago"),
  concepto: varchar("concepto").notNull(),
  comprobanteUrl: varchar("comprobante_url"), // URL del comprobante de pago subido
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations: any = relations(users, ({ one, many }) => ({
  apartment: one(apartments, {
    fields: [users.idApartamento],
    references: [apartments.id],
  }),
  pagos: many(pagos),
}));

export const apartmentsRelations: any = relations(apartments, ({ one, many }) => ({
  user: one(users, {
    fields: [apartments.idUsuario],
    references: [users.id],
  }),
  pagos: many(pagos),
}));

export const pagosRelations = relations(pagos, ({ one }) => ({
  user: one(users, {
    fields: [pagos.idUsuario],
    references: [users.id],
  }),
  apartment: one(apartments, {
    fields: [pagos.idApartamento],
    references: [apartments.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApartmentSchema = createInsertSchema(apartments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPagoSchema = createInsertSchema(pagos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  fechaVencimiento: z.string().transform((val) => new Date(val)),
  fechaPago: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const updatePagoSchema = createInsertSchema(pagos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial().extend({
  fechaVencimiento: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  fechaPago: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  estado: z.string().optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Apartment = typeof apartments.$inferSelect;
export type InsertApartment = z.infer<typeof insertApartmentSchema>;

export type Pago = typeof pagos.$inferSelect;
export type InsertPago = z.infer<typeof insertPagoSchema>;
export type UpdatePago = z.infer<typeof updatePagoSchema>;

// Extended types with relations
export type UserWithApartment = User & {
  apartment?: Apartment;
};

export type PagoWithRelations = Pago & {
  user: User;
  apartment: Apartment;
};
