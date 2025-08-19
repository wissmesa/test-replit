import type { Express } from "express";
import { createServer, type Server } from "http";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const session = require("express-session");
import { storage } from "./storage";
import { insertUserSchema, insertApartmentSchema, insertPagoSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword, isAuthenticated, isAdmin } from "./auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.omit({
  contrasena: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'condominium-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth routes
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userEmail = user.correo;
      req.session.userType = user.tipoUsuario;

      // Return user without password
      const { contrasena, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password as string);
      
      // Create user with hashed password
      const { password, ...userDataWithoutPassword } = userData;
      const userToCreate = {
        ...userDataWithoutPassword,
        contrasena: hashedPassword
      } as any;

      const user = await storage.createUser(userToCreate);
      
      // Auto-login after registration
      req.session.userId = user.id;
      req.session.userEmail = user.correo;
      req.session.userType = user.tipoUsuario;

      // Return user without password
      const { contrasena, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session?.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user with apartment info
      const userWithApartment = await storage.getUserByEmail(user.correo);
      if (!userWithApartment) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { contrasena, ...userWithoutPassword } = userWithApartment;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.post('/api/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password as string);
      
      // Create user with hashed password
      const { password, ...userDataWithoutPassword } = userData;
      const userToCreate = {
        ...userDataWithoutPassword,
        contrasena: hashedPassword
      } as any;

      const user = await storage.createUser(userToCreate);
      
      // Return user without password
      const { contrasena, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getUsersWithApartments();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map((user: any) => {
        const { contrasena, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const sessionUserId = req.session.userId;
      const userType = req.session.userType;
      
      // Users can update their own profile, admins can update any profile
      if (userId !== sessionUserId && userType !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updateData = req.body;
      
      // If password is being updated, hash it
      if (updateData.password) {
        updateData.contrasena = await hashPassword(updateData.password);
        delete updateData.password;
      }

      const user = await storage.updateUser(userId, updateData);
      
      // Return user without password
      const { contrasena, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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

  app.post('/api/apartments', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const apartmentData = insertApartmentSchema.parse(req.body);
      const apartment = await storage.createApartment(apartmentData);
      res.json(apartment);
    } catch (error) {
      console.error("Error creating apartment:", error);
      res.status(500).json({ message: "Failed to create apartment" });
    }
  });

  app.put('/api/apartments/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const apartmentId = parseInt(req.params.id);
      if (isNaN(apartmentId)) {
        return res.status(400).json({ message: "Invalid apartment ID" });
      }
      const apartmentData = req.body;
      const apartment = await storage.updateApartment(apartmentId, apartmentData);
      res.json(apartment);
    } catch (error) {
      console.error("Error updating apartment:", error);
      res.status(500).json({ message: "Failed to update apartment" });
    }
  });

  app.delete('/api/apartments/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const apartmentId = parseInt(req.params.id);
      if (isNaN(apartmentId)) {
        return res.status(400).json({ message: "Invalid apartment ID" });
      }
      await storage.deleteApartment(apartmentId);
      res.json({ message: "Apartment deleted successfully" });
    } catch (error) {
      console.error("Error deleting apartment:", error);
      res.status(500).json({ message: "Failed to delete apartment" });
    }
  });

  // Assign user to apartment
  app.post('/api/apartments/:id/assign-user', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const apartmentId = parseInt(req.params.id);
      if (isNaN(apartmentId)) {
        return res.status(400).json({ message: "Invalid apartment ID" });
      }
      
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const result = await storage.assignUserToApartment(apartmentId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error assigning user to apartment:", error);
      res.status(500).json({ message: "Failed to assign user to apartment" });
    }
  });

  // Unassign user from apartment
  app.post('/api/apartments/:id/unassign-user', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const apartmentId = parseInt(req.params.id);
      if (isNaN(apartmentId)) {
        return res.status(400).json({ message: "Invalid apartment ID" });
      }
      
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const result = await storage.unassignUserFromApartment(apartmentId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error unassigning user from apartment:", error);
      res.status(500).json({ message: "Failed to unassign user from apartment" });
    }
  });

  // Create pago
  app.post('/api/pagos', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Creating pago with data:", req.body);
      const result = insertPagoSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Validation failed:", result.error.issues);
        return res.status(400).json({ message: "Datos inválidos", errors: result.error.issues });
      }

      const pago = await storage.createPago(result.data);
      res.status(201).json(pago);
    } catch (error) {
      console.error("Error creating pago:", error);
      res.status(500).json({ message: "No se pudo crear el pago" });
    }
  });

  // Get upload URL for payment receipt
  app.post('/api/pagos/upload-url', isAuthenticated, async (req: any, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Set ACL policy for uploaded payment receipt
  app.put('/api/pagos/set-receipt-acl', isAuthenticated, async (req: any, res) => {
    try {
      const { receiptUrl } = req.body;
      if (!receiptUrl) {
        return res.status(400).json({ message: "receiptUrl is required" });
      }

      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        receiptUrl,
        {
          owner: userId,
          visibility: "private", // Payment receipts are private
        }
      );

      res.json({ objectPath });
    } catch (error) {
      console.error("Error setting receipt ACL:", error);
      res.status(500).json({ message: "Failed to set receipt ACL" });
    }
  });

  // Serve uploaded payment receipts
  app.get('/objects/:objectPath(*)', isAuthenticated, async (req: any, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Check if user can access this file (basic ownership check)
      const userId = req.session.userId;
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
      });
      
      if (!canAccess) {
        return res.sendStatus(403);
      }
      
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error serving object:", error);
      if (error.name === "ObjectNotFoundError") {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Payment routes
  app.get('/api/pagos', isAuthenticated, async (req: any, res) => {
    try {
      const userType = req.session.userType;
      const userId = req.session.userId;
      
      let pagos;
      if (userType === 'admin') {
        pagos = await storage.getPagos();
      } else {
        pagos = await storage.getPagosByUser(userId);
      }
      
      res.json(pagos);
    } catch (error) {
      console.error("Error fetching pagos:", error);
      res.status(500).json({ message: "Failed to fetch pagos" });
    }
  });

  app.post('/api/pagos', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pagoData = insertPagoSchema.parse(req.body);
      const pago = await storage.createPago(pagoData);
      res.json(pago);
    } catch (error) {
      console.error("Error creating pago:", error);
      res.status(500).json({ message: "Failed to create pago" });
    }
  });

  app.put('/api/pagos/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pagoId = req.params.id;
      const pagoData = req.body;
      const pago = await storage.updatePago(pagoId, pagoData);
      res.json(pago);
    } catch (error) {
      console.error("Error updating pago:", error);
      res.status(500).json({ message: "Failed to update pago" });
    }
  });

  app.delete('/api/pagos/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pagoId = req.params.id;
      await storage.deletePago(pagoId);
      res.json({ message: "Pago deleted successfully" });
    } catch (error) {
      console.error("Error deleting pago:", error);
      res.status(500).json({ message: "Failed to delete pago" });
    }
  });

  // Stats routes
  app.get('/api/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const [users, apartments, pagos] = await Promise.all([
        storage.getUsersWithApartments(),
        storage.getApartments(),
        storage.getPagos()
      ]);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const pendingPayments = pagos.filter((p: any) => p.estado === 'pendiente').length;
      const monthlyIncome = pagos
        .filter((p: any) => {
          const pagoDate = new Date(p.fechaPago || p.fechaVencimiento);
          return pagoDate.getMonth() === currentMonth && 
                 pagoDate.getFullYear() === currentYear &&
                 p.estado === 'pagado';
        })
        .reduce((sum: number, p: any) => sum + parseFloat(p.monto), 0);

      const stats = {
        totalApartments: apartments.length,
        activeUsers: users.filter((u: any) => u.tipoUsuario === 'inquilino').length,
        pendingPayments,
        monthlyIncome
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