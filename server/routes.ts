import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserSchema, insertApartmentSchema, insertPagoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByEmail(req.user.claims.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can create users
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createCondominiumUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can view all users
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const users = await storage.getUsersWithApartments();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Users can update their own profile, admins can update any profile
      if (currentUser.tipoUsuario !== 'admin' && currentUser.id !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Apartment routes
  app.get('/api/apartments', isAuthenticated, async (req: any, res) => {
    try {
      const apartments = await storage.getApartments();
      res.json(apartments);
    } catch (error) {
      console.error("Error fetching apartments:", error);
      res.status(500).json({ message: "Failed to fetch apartments" });
    }
  });

  app.post('/api/apartments', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can create apartments
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const apartmentData = insertApartmentSchema.parse(req.body);
      const apartment = await storage.createApartment(apartmentData);
      res.json(apartment);
    } catch (error) {
      console.error("Error creating apartment:", error);
      res.status(500).json({ message: "Failed to create apartment" });
    }
  });

  app.put('/api/apartments/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can update apartments
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const apartmentData = insertApartmentSchema.partial().parse(req.body);
      const apartment = await storage.updateApartment(req.params.id, apartmentData);
      res.json(apartment);
    } catch (error) {
      console.error("Error updating apartment:", error);
      res.status(500).json({ message: "Failed to update apartment" });
    }
  });

  app.delete('/api/apartments/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can delete apartments
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteApartment(req.params.id);
      res.json({ message: "Apartment deleted successfully" });
    } catch (error) {
      console.error("Error deleting apartment:", error);
      res.status(500).json({ message: "Failed to delete apartment" });
    }
  });

  // Payment routes
  app.get('/api/pagos', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      let pagos;
      if (currentUser.tipoUsuario === 'admin') {
        // Admins can see all payments
        pagos = await storage.getPagos();
      } else {
        // Tenants can only see their own payments
        pagos = await storage.getPagosByUser(currentUser.id);
      }

      res.json(pagos);
    } catch (error) {
      console.error("Error fetching pagos:", error);
      res.status(500).json({ message: "Failed to fetch pagos" });
    }
  });

  app.post('/api/pagos', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can create payments
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const pagoData = insertPagoSchema.parse(req.body);
      const pago = await storage.createPago(pagoData);
      res.json(pago);
    } catch (error) {
      console.error("Error creating pago:", error);
      res.status(500).json({ message: "Failed to create pago" });
    }
  });

  app.put('/api/pagos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only admins can update payment status
      if (currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const pagoData = insertPagoSchema.partial().parse(req.body);
      const pago = await storage.updatePago(req.params.id, pagoData);
      res.json(pago);
    } catch (error) {
      console.error("Error updating pago:", error);
      res.status(500).json({ message: "Failed to update pago" });
    }
  });

  app.delete('/api/pagos/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can delete payments
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deletePago(req.params.id);
      res.json({ message: "Pago deleted successfully" });
    } catch (error) {
      console.error("Error deleting pago:", error);
      res.status(500).json({ message: "Failed to delete pago" });
    }
  });

  // Dashboard stats for admin
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUserByEmail(req.user.claims.email);
      if (!currentUser || currentUser.tipoUsuario !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const [apartments, users, pagos] = await Promise.all([
        storage.getApartments(),
        storage.getUsersWithApartments(),
        storage.getPagos(),
      ]);

      const stats = {
        totalApartments: apartments.length,
        activeUsers: users.filter(u => u.tipoUsuario === 'inquilino').length,
        pendingPayments: pagos.filter(p => p.estado === 'pendiente').length,
        monthlyIncome: pagos
          .filter(p => p.estado === 'pagado' && p.fechaPago)
          .reduce((sum, p) => sum + parseFloat(p.monto), 0),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
