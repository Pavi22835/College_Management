import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

/**
 * Protect routes - Verify JWT token and attach user to request
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("========== PROTECT MIDDLEWARE ==========");
    console.log("Auth header exists?", !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided or invalid format");
      return res.status(401).json({ 
        success: false,
        error: "No token provided. Please log in." 
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token received (first 20 chars):", token.substring(0, 20) + "...");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified. User ID from token:", decoded.id);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log("❌ Token expired");
        return res.status(401).json({ 
          success: false,
          error: "Token expired. Please log in again." 
        });
      }
      if (error.name === 'JsonWebTokenError') {
        console.log("❌ Invalid token");
        return res.status(401).json({ 
          success: false,
          error: "Invalid token. Please log in again." 
        });
      }
      console.log("❌ Token verification error:", error.message);
      throw error;
    }

    // Find user by ID from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
      }
    });

    if (!user) {
      console.log("❌ User not found for ID:", decoded.id);
      return res.status(401).json({ 
        success: false,
        error: "User not found" 
      });
    }

    console.log("✅ User found in database:");
    console.log("   - ID:", user.id);
    console.log("   - Email:", user.email);
    console.log("   - Name:", user.name);
    console.log("   - Role from DB:", user.role);
    console.log("   - Role type:", typeof user.role);
    console.log("   - Role length:", user.role?.length);
    console.log("   - Role char codes:", user.role?.split('').map(c => c.charCodeAt(0)));

    if (!user.isActive) {
      console.log("❌ Account is deactivated");
      return res.status(403).json({ 
        success: false,
        error: "Account is deactivated. Please contact admin." 
      });
    }

    // Log user authentication for debugging
    console.log(`🔐 User ${user.email} authenticated with role: "${user.role}"`);
    console.log("==========================================");

    // Attach user to request object
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();

  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    res.status(500).json({ 
      success: false,
      error: "Authentication failed. Please try again." 
    });
  }
};

/**
 * Authorize roles - Restrict access to specific roles
 * FIXED: Now handles case sensitivity and whitespace issues with detailed debug
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("\n========== AUTHORIZE MIDDLEWARE ==========");
    console.log("1. req.user exists?", !!req.user);
    
    if (!req.user) {
      console.log("❌ No user in request - authentication required");
      return res.status(401).json({ 
        success: false,
        error: "Not authenticated" 
      });
    }

    console.log("2. User object:", {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      roleType: typeof req.user.role
    });

    console.log("3. Raw user role from DB:", JSON.stringify(req.user.role));
    console.log("4. Role type:", typeof req.user.role);
    console.log("5. Role length:", req.user.role?.length);
    console.log("6. Role characters:", req.user.role?.split('').map(c => ({
      char: c,
      code: c.charCodeAt(0)
    })));

    // Check for hidden characters
    const hasHiddenChars = req.user.role?.split('').some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126);
    console.log("7. Has hidden characters?", hasHiddenChars);

    // Normalize the user role and allowed roles for comparison
    // This fixes issues with case sensitivity and hidden whitespace
    const userRole = req.user.role?.trim().toUpperCase();
    const allowedRoles = roles.map(role => role.trim().toUpperCase());

    console.log("8. Original allowed roles:", roles);
    console.log("9. Normalized user role:", userRole);
    console.log("10. Normalized allowed roles:", allowedRoles);
    console.log("11. Does user role match allowed roles?", allowedRoles.includes(userRole));
    
    // Try different comparison methods for debugging
    console.log("12. Alternative checks:");
    console.log("    - Direct includes:", roles.includes(req.user.role));
    console.log("    - Trim only:", roles.map(r => r.trim()).includes(req.user.role?.trim()));
    console.log("    - Uppercase only:", roles.map(r => r.toUpperCase()).includes(req.user.role?.toUpperCase()));
    console.log("    - Trim + Uppercase:", allowedRoles.includes(userRole));
    
    console.log("==========================================\n");

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    console.log("✅ Access granted - user has required role");
    next();
  };
};

/**
 * Optional authentication - Doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          }
        });

        if (user && user.isActive) {
          req.user = user;
          req.userId = user.id;
          req.userRole = user.role;
          console.log(`🔓 Optional auth: User ${user.email} attached`);
        }
      } catch (error) {
        // Silent fail for optional auth
        console.debug("Optional auth failed:", error.message);
      }
    }

    next();
  } catch (error) {
    // Continue even if optional auth fails
    next();
  }
};

/**
 * Check if user is owner or admin
 */
export const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      console.log("========== OWNER/ADMIN CHECK ==========");
      
      // Admin always has access
      if (req.user.role?.toUpperCase() === 'ADMIN') {
        console.log("✅ User is admin - access granted");
        return next();
      }

      // Get the resource owner's user ID
      const resourceUserId = await getResourceUserId(req);
      console.log("Resource owner ID:", resourceUserId);
      console.log("Current user ID:", req.user.id);
      
      // Check if current user is the owner
      if (req.user.id !== resourceUserId) {
        console.log("❌ User is not owner - access denied");
        return res.status(403).json({ 
          success: false,
          error: "You don't have permission to access this resource" 
        });
      }

      console.log("✅ User is owner - access granted");
      console.log("========================================");
      next();
    } catch (error) {
      console.error("Owner check error:", error);
      res.status(500).json({ 
        success: false,
        error: "Authorization failed" 
      });
    }
  };
};

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Set token cookie
 */
export const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Clear token cookie
 */
export const clearTokenCookie = (res) => {
  res.clearCookie('token');
};

/**
 * Refresh token middleware
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        error: "No refresh token provided" 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid refresh token" 
      });
    }

    // Generate new access token
    const newToken = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ 
      success: false,
      error: "Invalid refresh token" 
    });
  }
};

/**
 * Log auth activity
 */
export const logAuthActivity = async (req, res, next) => {
  const originalSend = res.json;
  
  res.json = function(data) {
    // Log after response is sent
    if (req.user && data.success) {
      prisma.log.create({
        data: {
          userId: req.user.id,
          action: req.method,
          entity: 'AUTH',
          details: `${req.method} ${req.originalUrl}`,
          ipAddress: req.ip
        }
      }).catch(err => console.error("Log error:", err));
    }
    
    originalSend.call(this, data);
  };
  
  next();
};